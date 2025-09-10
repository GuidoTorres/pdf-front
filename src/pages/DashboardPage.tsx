import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Button, ButtonGroup } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useDocumentStore } from "../stores/useDocumentStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useWebSocketStore } from "../stores/useWebSocketStore";
import {
  DashboardStats,
  FileUploadSection,
  JobList,
  BankDetectionInfo,
  TransactionTable,
  ExportControls,
  WebSocketStatus,
} from "../components/dashboard";
import OriginalDataTable from "../components/dashboard/OriginalDataTable";
import EmptyState from "../components/EmptyState";
import PageDeductionNotification from "../components/PageDeductionNotification";
import { usePageDeductionNotifications } from "../hooks/usePageDeductionNotifications";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<"single" | "batch">("single");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedExportFormat, setSelectedExportFormat] =
    useState<string>("csv");
  const [viewMode, setViewMode] = useState<"processed" | "original">("processed");

  const { notifications, addNotification, removeNotification } =
    usePageDeductionNotifications();

  const {
    processDocument,
    processBatchDocuments,
    isProcessing,
    documents,
    loadHistory,
    currentDocument,
    setCurrentDocument,
    batchProgress,
    editingTransactions,
    hasUnsavedChanges,
    updateTransaction,
    setTransactionEditing,
    saveChanges,
    discardChanges,
    handleWebSocketJobUpdate,
  } = useDocumentStore();
  const { user, isAuthenticated } = useAuthStore();
  const {
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    isConnected: wsConnected,
    jobProgress,
  } = useWebSocketStore();

  useEffect(() => {
    // Only load history if user is authenticated
    if (isAuthenticated && user) {
      loadHistory();
    }
  }, [loadHistory, isAuthenticated, user]);

  // WebSocket connection is handled by App.tsx
  // Removed duplicate WebSocket initialization to prevent auth conflicts

  // Handle WebSocket job progress updates
  useEffect(() => {
    console.log('[DashboardPage] Processing jobProgress updates:', {
      updateCount: Object.keys(jobProgress).length,
      wsConnected,
      jobIds: Object.keys(jobProgress)
    });
    Object.entries(jobProgress).forEach(([jobId, progress]) => {
      console.log('[DashboardPage] Processing job update:', {
        jobId,
        status: progress.status,
        hasResult: !!progress.result
      });
      handleWebSocketJobUpdate(
        jobId,
        progress.status,
        progress.progress,
        progress.step,
        progress.result,
        progress.error
      );
    });
  }, [jobProgress, handleWebSocketJobUpdate, wsConnected]);

  // Listen for page deduction events
  useEffect(() => {
    const handlePageDeducted = (event: CustomEvent) => {
      const { pagesDeducted, remainingPages, fileName } = event.detail;
      addNotification(pagesDeducted, remainingPages, fileName);
    };

    window.addEventListener(
      "pageDeducted",
      handlePageDeducted as EventListener
    );

    return () => {
      window.removeEventListener(
        "pageDeducted",
        handlePageDeducted as EventListener
      );
    };
  }, [addNotification]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setCurrentDocument(null);

    if (uploadMode === "single" || selectedFiles.length === 1) {
      await processDocument(selectedFiles[0]);
    } else {
      await processBatchDocuments(selectedFiles);
    }

    setSelectedFiles([]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  const handleDocumentSelect = (doc: any) => {
    if (doc.status === "completed") {
      setCurrentDocument(doc);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {t("dashboard.welcomeBack")}, {user?.name || t("dashboard.user")}!
          </h1>
          <p className="text-default-600">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <WebSocketStatus />
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats
        user={user}
        documents={documents}
        currentDocument={currentDocument}
      />

      {/* Main Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Upload and Job List */}
        <div className="lg:col-span-1 space-y-6">
          <FileUploadSection
            user={user}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            uploadMode={uploadMode}
            setUploadMode={setUploadMode}
            isProcessing={isProcessing}
            batchProgress={batchProgress}
            onUpload={handleUpload}
            onRemoveFile={removeFile}
          />

          <JobList
            documents={documents}
            currentDocument={currentDocument}
            onDocumentSelect={handleDocumentSelect}
          />
        </div>

        {/* Right Column: Transaction Preview */}
        <div className="lg:col-span-2">
          <Card className="bg-content1/60 backdrop-blur-md border border-divider h-full">
            <CardHeader className="flex justify-between items-start pb-4">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {currentDocument?.fileName ||
                      t("dashboard.excelPreview.title")}
                  </h2>
                  
                  {/* View Mode Toggle */}
                  {currentDocument && currentDocument.status === "completed" && (
                    <ButtonGroup size="sm" className="bg-content2">
                      <Button
                        variant={viewMode === "processed" ? "solid" : "light"}
                        color={viewMode === "processed" ? "primary" : "default"}
                        onPress={() => setViewMode("processed")}
                        startContent={<Icon icon="lucide:zap" />}
                      >
                        {t("dashboard.dataViews.processed")}
                      </Button>
                      <Button
                        variant={viewMode === "original" ? "solid" : "light"}
                        color={viewMode === "original" ? "primary" : "default"}
                        onPress={() => setViewMode("original")}
                        startContent={<Icon icon="lucide:file-text" />}
                      >
                        {t("dashboard.dataViews.original")}
                      </Button>
                    </ButtonGroup>
                  )}
                </div>

                {/* Export Controls */}
                {currentDocument && currentDocument.status === "completed" && viewMode === "processed" && (
                  <ExportControls
                    currentDocument={currentDocument}
                    documents={documents}
                    selectedExportFormat={selectedExportFormat}
                    onExportFormatChange={setSelectedExportFormat}
                    hasUnsavedChanges={hasUnsavedChanges}
                    onSaveChanges={saveChanges}
                    onDiscardChanges={discardChanges}
                  />
                )}
              </div>
            </CardHeader>
            <CardBody>
              {viewMode === "processed" ? (
                <TransactionTable
                  currentDocument={currentDocument}
                  editingTransactions={editingTransactions}
                  hasUnsavedChanges={hasUnsavedChanges}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onUpdateTransaction={updateTransaction}
                  onSetTransactionEditing={setTransactionEditing}
                  onSaveChanges={saveChanges}
                  onDiscardChanges={discardChanges}
                />
              ) : (
                <OriginalDataTable currentDocument={currentDocument} />
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Page Deduction Notifications */}
      {notifications.map((notification) => (
        <PageDeductionNotification
          key={notification.id}
          pagesDeducted={notification.pagesDeducted}
          remainingPages={notification.remainingPages}
          fileName={notification.fileName}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default DashboardPage;
