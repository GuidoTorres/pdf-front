import React, { useState } from "react";
import { Card, CardHeader, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { DocumentWithStatus, useDocumentStore } from "../../stores/useDocumentStore";
import { BankDetectionService } from "../../services/bankDetection";
import { getStatusChip, getStatusIcon } from "../../utils/dashboardUtils";
import HistoryModal from "./HistoryModal";
import ConfirmModal from "../common/ConfirmModal";

interface JobListProps {
  documents: DocumentWithStatus[];
  currentDocument: DocumentWithStatus | null;
  onDocumentSelect: (doc: DocumentWithStatus) => void;
}

const JobList: React.FC<JobListProps> = ({
  documents,
  currentDocument,
  onDocumentSelect,
}) => {
  const { t } = useTranslation();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [jobToCancel, setJobToCancel] = useState<string | null>(null);
  const { cancelJob, removeDocument } = useDocumentStore();

  const handleDocumentSelect = (doc: DocumentWithStatus) => {
    if (doc.status === "completed") {
      onDocumentSelect(doc);
    }
  };

  const handleCancelJob = (jobId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    console.log('🔴 Cancel job clicked:', jobId);
    
    setJobToCancel(jobId);
    setShowConfirmModal(true);
  };

  const confirmCancelJob = async () => {
    if (!jobToCancel) return;
    
    console.log('✅ User confirmed, calling removeDocument for:', jobToCancel);
    
    try {
      await removeDocument(jobToCancel);
      console.log('✅ removeDocument completed successfully');
    } catch (error) {
      console.error('❌ Error in removeDocument:', error);
    } finally {
      setJobToCancel(null);
    }
  };

  const cancelConfirmation = () => {
    console.log('❌ User cancelled');
    setJobToCancel(null);
  };

  // Prioritize processing jobs, then show the most recent ones
  const isProcessingStatus = (status: string) => {
    return status === "processing" || status === "queued" || status === "started" || status === "progress";
  };

  const canCancelJob = (status: string) => {
    return isProcessingStatus(status);
  };
  
  const processingDocs = documents.filter(doc => isProcessingStatus(doc.status));
  const otherDocs = documents.filter(doc => !isProcessingStatus(doc.status));
  
  // Combine processing jobs (always show) with recent completed/failed jobs
  const recentDocuments = [
    ...processingDocs,
    ...otherDocs.slice(0, Math.max(0, 3 - processingDocs.length))
  ].slice(0, 3);
  
  const hasMoreDocuments = documents.length > recentDocuments.length;

  return (
    <>
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{t("dashboard.jobs.title")}</h2>
            {hasMoreDocuments && (
              <p className="text-sm text-default-500">
                {t("dashboard.jobs.showingRecent", { count: 3 })}
              </p>
            )}
          </div>
          {hasMoreDocuments && (
            <Button
              size="sm"
              variant="ghost"
              onPress={() => setShowHistoryModal(true)}
              startContent={<Icon icon="lucide:clock" className="w-4 h-4" />}
            >
              {t("dashboard.jobs.viewHistory")}
            </Button>
          )}
        </CardHeader>
        <CardBody>
          {recentDocuments && recentDocuments.length > 0 ? (
            <div className="space-y-3">
              {recentDocuments.map((doc) => {
                console.log('🔍 Rendering document:', { jobId: doc.jobId, fileName: doc.fileName, status: doc.status });
                return (
                  <div key={doc.jobId} className="space-y-2">
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        doc.status === "completed"
                          ? "cursor-pointer hover:bg-default-100"
                          : "cursor-not-allowed"
                      } ${
                        currentDocument?.jobId === doc.jobId
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-default-50"
                      }`}
                      onClick={() => handleDocumentSelect(doc)}
                    >
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {isProcessingStatus(doc.status) ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                      ) : (
                        getStatusIcon(doc.status)
                      )}
                    </div>

                    {/* Bank logo if detected */}
                    {doc.bankDetection && (
                      <div className="flex-shrink-0">
                        <Icon
                          icon="lucide:building-2"
                          className="w-6 h-6 text-default-400"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {doc.fileName ||
                            doc.meta?.bank_name ||
                            t("dashboard.jobs.processedDocument")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-default-500">
                        <span>
                          {doc.meta?.statement_period ||
                            new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2 flex items-center gap-2">
                    {canCancelJob(doc.status) ? (
                      <>
                        <div className="text-right">
                          <p className="text-sm text-primary font-medium">
                            {doc.step || "AI procesando..."}
                          </p>
                          <p className="text-xs text-default-500">
                            {doc.progress ? `${doc.progress}%` : "Analizando documento"}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleCancelJob(doc.jobId!, e)}
                          className="min-w-6 w-6 h-6 flex items-center justify-center rounded-md hover:bg-danger-100 text-danger-500 hover:text-danger-600 transition-colors"
                          title="Cancelar trabajo"
                        >
                          <Icon icon="lucide:x" className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      getStatusChip(doc.status, t)
                    )}
                  </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon
              icon="lucide:file-x"
              className="mx-auto text-4xl text-default-300 mb-2"
            />
            <p className="text-default-500">{t("dashboard.jobs.noJobs")}</p>
          </div>
        )}
      </CardBody>
    </Card>

    {/* History Modal */}
    <HistoryModal
      isOpen={showHistoryModal}
      onClose={() => setShowHistoryModal(false)}
      documents={documents}
      currentDocument={currentDocument}
      onDocumentSelect={onDocumentSelect}
    />

    {/* Confirm Cancel Modal */}
    {jobToCancel && (
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          cancelConfirmation();
        }}
        onConfirm={confirmCancelJob}
        title="Cancelar trabajo"
        message={`¿Estás seguro de que quieres cancelar el procesamiento de "${
          documents.find(doc => doc.jobId === jobToCancel)?.fileName || 'este documento'
        }"? Esta acción no se puede deshacer y el trabajo se eliminará permanentemente.`}
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        type="danger"
      />
    )}
    </>
  );
};

export default JobList;
