import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Progress,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useDocumentStore } from "../stores/useDocumentStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Pagination, getKeyValue } from "@heroui/react";

const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<"docling" | "traditional">(
    "docling"
  );

  const {
    processDocument,
    isProcessing,
    documents,
    loadHistory,
    currentDocument,
    setCurrentDocument,
  } = useDocumentStore();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const transactions = currentDocument?.transactions || [];
  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const paginatedTransactions = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return transactions.slice(start, end);
  }, [page, transactions]);
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === "application/pdf") {
          setSelectedFile(file);
        } else {
          alert(t("dashboard.pdfOnlyError"));
        }
      }
    },
    [t]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        alert(t("dashboard.pdfOnlyError"));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setCurrentDocument(null); // Limpiar la vista previa al subir un nuevo archivo
    await processDocument(selectedFile, provider);
    setSelectedFile(null); // Limpiar el fichero seleccionado
  };

  const handleDocumentSelect = (doc) => {
    if (doc.status === "completed") {
      setCurrentDocument(doc);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Chip color="warning" variant="flat" size="sm">
            {t("dashboard.jobs.processing")}
          </Chip>
        );
      case "completed":
        return (
          <Chip color="success" variant="flat" size="sm">
            {t("dashboard.jobs.completed")}
          </Chip>
        );
      case "failed":
        return (
          <Chip color="danger" variant="flat" size="sm">
            {t("dashboard.jobs.failed")}
          </Chip>
        );
      default:
        return <Chip size="sm">{status}</Chip>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Spinner size="sm" color="warning" />;
      case "completed":
        return <Icon icon="lucide:check-circle" className="text-success" />;
      case "failed":
        return <Icon icon="lucide:x-circle" className="text-danger" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button size="sm" variant="light" onClick={() => changeLanguage("en")}>
          English
        </Button>
        <Button size="sm" variant="light" onClick={() => changeLanguage("es")}>
          Español
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="flex flex-row items-center justify-between p-4">
            <div>
              <p className="text-sm text-default-500">
                {t("dashboard.pagesRemaining")}
              </p>
              <p className="text-2xl font-bold text-primary">
                {user?.pages_remaining || 0}
              </p>
            </div>
            <Icon icon="lucide:file-text" className="text-3xl text-primary" />
          </CardBody>
        </Card>

        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="flex flex-row items-center justify-between p-4">
            <div>
              <p className="text-sm text-default-500">
                {t("dashboard.documentsProcessed")}
              </p>
              <p className="text-2xl font-bold text-success">
                {documents?.filter((d) => d.status === "completed").length || 0}
              </p>
            </div>
            <Icon
              icon="lucide:check-circle"
              className="text-3xl text-success"
            />
          </CardBody>
        </Card>

        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="flex flex-row items-center justify-between p-4">
            <div>
              <p className="text-sm text-default-500">
                {t("dashboard.currentPlan")}
              </p>
              <p className="text-2xl font-bold text-warning">
                {user?.plan || "Free"}
              </p>
            </div>
            <Icon icon="lucide:crown" className="text-3xl text-warning" />
          </CardBody>
        </Card>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload and Job List */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-content1/60 backdrop-blur-md border border-divider">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {t("dashboard.processDocument.title")}
              </h2>
              {user?.pages_remaining && (
                <Chip color="primary" variant="flat" size="sm">
                  {user.pages_remaining}{" "}
                  {t("dashboard.processDocument.pagesRemainingChip")}
                </Chip>
              )}
            </CardHeader>
            <CardBody className="space-y-4">
              <Select
                label={t("dashboard.processDocument.processingMethod")}
                size="sm"
                selectedKeys={[provider]}
                onChange={(e) =>
                  setProvider(e.target.value as "docling" | "traditional")
                }
                isDisabled={isProcessing}
              >
                <SelectItem key="docling" value="docling">
                  {t("dashboard.processDocument.docling")}
                </SelectItem>
                <SelectItem key="traditional" value="traditional">
                  {t("dashboard.processDocument.traditional")}
                </SelectItem>
              </Select>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : selectedFile
                    ? "border-success bg-success/10"
                    : "border-divider"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-3">
                    <Icon
                      icon="lucide:file-check"
                      className="mx-auto text-4xl text-success"
                    />
                    <div>
                      <p className="text-sm font-medium truncate px-4">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-default-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="flat"
                        onClick={() => setSelectedFile(null)}
                        isDisabled={isProcessing}
                      >
                        {t("dashboard.processDocument.remove")}
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        onClick={handleUpload}
                        isLoading={isProcessing}
                        startContent={
                          !isProcessing && <Icon icon="lucide:upload" />
                        }
                      >
                        {t("dashboard.processDocument.process")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Icon
                      icon="lucide:upload-cloud"
                      className={`mx-auto text-4xl transition-colors ${
                        dragActive ? "text-primary" : "text-default-400"
                      }`}
                    />
                    <div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        disabled={isProcessing}
                      />
                      <Button
                        as="label"
                        htmlFor="file-upload"
                        size="sm"
                        variant="light"
                        color="primary"
                        className="cursor-pointer"
                        isDisabled={isProcessing}
                      >
                        {t("dashboard.processDocument.dragAndDrop")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Job List Card */}
          <Card className="bg-content1/60 backdrop-blur-md border border-divider">
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {t("dashboard.jobs.title")}
              </h2>
            </CardHeader>
            <CardBody>
              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.jobId}
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
                          {getStatusIcon(doc.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.fileName ||
                              doc.meta?.bank_name ||
                              t("dashboard.jobs.processedDocument")}
                          </p>
                          <p className="text-xs text-default-500">
                            {doc.meta?.statement_period ||
                              new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {getStatusChip(doc.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon
                    icon="lucide:file-x"
                    className="mx-auto text-4xl text-default-300 mb-2"
                  />
                  <p className="text-default-500">
                    {t("dashboard.jobs.noJobs")}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Excel Preview */}
        <div className="lg:col-span-2">
          <Card className="bg-content1/60 backdrop-blur-md border border-divider h-full">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {t("dashboard.excelPreview.title")}
              </h2>
              <Button
                color="success"
                variant="flat"
                disabled={
                  !currentDocument || currentDocument.status !== "completed"
                }
                onClick={handleDownloadExcel}
              >
                <Icon icon="lucide:download" className="mr-2" />
                {t("dashboard.excelPreview.download")}
              </Button>
            </CardHeader>
            <CardBody>
              {currentDocument && currentDocument.status === "completed" ? (
                <Table
                  isStriped
                  aria-label={t("dashboard.excelPreview.tableAriaLabel")}
                  bottomContent={
                    totalPages > 1 && (
                      <div className="flex w-full justify-center mt-4">
                        <Pagination
                          isCompact
                          showControls
                          showShadow
                          color="secondary"
                          page={page}
                          total={totalPages}
                          onChange={setPage}
                        />
                      </div>
                    )
                  }
                >
                  <TableHeader>
                    <TableColumn>
                      {t("dashboard.excelPreview.date")}
                    </TableColumn>
                    <TableColumn>
                      {t("dashboard.excelPreview.description")}
                    </TableColumn>
                    <TableColumn>
                      {t("dashboard.excelPreview.amount")}
                    </TableColumn>
                    <TableColumn>
                      {t("dashboard.excelPreview.balance")}
                    </TableColumn>
                  </TableHeader>
                  <TableBody items={paginatedTransactions}>
                    {(item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          <span
                            className={
                              item.amount >= 0 ? "text-success" : "text-danger"
                            }
                          >
                            {new Intl.NumberFormat("es-ES", {
                              style: "currency",
                              currency: currentDocument.meta.currency || "EUR",
                            }).format(item.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.balance !== undefined && item.balance !== 0
                            ? new Intl.NumberFormat("es-ES", {
                                style: "currency",
                                currency:
                                  currentDocument.meta.currency || "EUR",
                              }).format(item.balance)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 flex flex-col items-center justify-center h-full">
                  <Icon
                    icon="lucide:sheet"
                    className="mx-auto text-5xl text-default-300 mb-4"
                  />
                  <p className="text-default-500">
                    {t("dashboard.excelPreview.noPreview")}
                  </p>
                  <p className="text-sm text-default-400">
                    {t("dashboard.excelPreview.selectCompleted")}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

const handleDownloadExcel = () => {
  if (!currentDocument || currentDocument.status !== 'completed') return;
  
  // Crear datos para el Excel
  const excelData = currentDocument.transactions.map(transaction => ({
    'Fecha': transaction.date,
    'Descripción': transaction.description,
    'Importe': transaction.amount,
    'Saldo': transaction.balance || 0
  }));
  
  // Crear contenido CSV
  const headers = ['Fecha', 'Descripción', 'Importe', 'Saldo'];
  const csvContent = [
    headers.join(','),
    ...excelData.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar comillas y envolver en comillas si contiene comas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  // Crear y descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${currentDocument.fileName || 'transactions'}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
