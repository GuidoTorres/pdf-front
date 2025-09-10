import React, { useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Progress,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { formatFileSize } from "../../utils/dashboardUtils";
import { useNotificationStore } from "../../stores/useNotificationStore";

interface User {
  pages_remaining?: number;
}

interface BatchProgress {
  current: number;
  total: number;
  files: string[];
}

interface FileUploadSectionProps {
  user: User | null;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  uploadMode: "single" | "batch";
  setUploadMode: (mode: "single" | "batch") => void;
  isProcessing: boolean;
  batchProgress: BatchProgress | null;
  onUpload: () => void;
  onRemoveFile: (index: number) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  user,
  selectedFiles,
  setSelectedFiles,
  uploadMode,
  setUploadMode,
  isProcessing,
  batchProgress,
  onUpload,
  onRemoveFile,
}) => {
  const { t } = useTranslation();
  const { error, warning } = useNotificationStore();
  const [dragActive, setDragActive] = useState(false);

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

      if (e.dataTransfer.files) {
        const files = Array.from(e.dataTransfer.files);
        const pdfFiles = files.filter(
          (file) => file.type === "application/pdf"
        );

        if (pdfFiles.length === 0) {
          error(
            t("dashboard.processDocument.fileTypeError"),
            t("dashboard.pdfOnlyError")
          );
          return;
        }

        if (pdfFiles.length !== files.length) {
          warning(
            t("dashboard.processDocument.filesFiltered"),
            t("dashboard.processDocument.someFilesIgnored")
          );
        }

        if (uploadMode === "single" && pdfFiles.length > 1) {
          setSelectedFiles([pdfFiles[0]]);
          warning(
            t("dashboard.processDocument.modeWarning"),
            t("dashboard.processDocument.singleModeWarning")
          );
        } else {
          setSelectedFiles(pdfFiles);
        }
      }
    },
    [t, uploadMode, setSelectedFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const pdfFiles = files.filter((file) => file.type === "application/pdf");

      if (pdfFiles.length === 0) {
        error(
          t("dashboard.processDocument.fileTypeError"),
          t("dashboard.pdfOnlyError")
        );
        return;
      }

      if (uploadMode === "single" && pdfFiles.length > 1) {
        setSelectedFiles([pdfFiles[0]]);
        warning(
          t("dashboard.processDocument.modeWarning"),
          t("dashboard.processDocument.singleModeWarning")
        );
      } else {
        setSelectedFiles(pdfFiles);
      }
    }
  };

  return (
    <Card
      className="bg-content1/60 backdrop-blur-md border border-divider"
      data-upload-section
    >
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {t("dashboard.processDocument.title")}
        </h2>

      </CardHeader>
      <CardBody className="space-y-4">
        {/* Upload Mode Toggle */}
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant={uploadMode === "single" ? "solid" : "flat"}
            color="primary"
            onClick={() => {
              setUploadMode("single");
              if (selectedFiles.length > 1) {
                setSelectedFiles([selectedFiles[0]]);
              }
            }}
            startContent={<Icon icon="lucide:file" />}
          >
            {t("dashboard.processDocument.singleFile")}
          </Button>
          <Button
            size="sm"
            variant={uploadMode === "batch" ? "solid" : "flat"}
            color="secondary"
            onClick={() => setUploadMode("batch")}
            startContent={<Icon icon="lucide:files" />}
          >
            {t("dashboard.processDocument.batchUpload")}
          </Button>
        </div>

        {/* Batch Progress */}
        {batchProgress && (
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {t("dashboard.processDocument.processingFiles")}
              </span>
              <span className="text-xs text-default-500">
                {batchProgress.current}{" "}
                {t("dashboard.excelPreview.transactionsCount")}{" "}
                {batchProgress.total}
              </span>
            </div>
            <Progress
              value={(batchProgress.current / batchProgress.total) * 100}
              color="primary"
              size="sm"
            />
            <p className="text-xs text-default-500 mt-1">
              {t("dashboard.processDocument.current")}:{" "}
              {batchProgress.files[batchProgress.current - 1] ||
                t("dashboard.processDocument.starting")}
            </p>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
            dragActive
              ? "border-primary bg-primary/10"
              : selectedFiles.length > 0
              ? "border-success bg-success/10"
              : "border-divider"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFiles.length > 0 ? (
            <div className="space-y-3">
              <Icon
                icon={
                  uploadMode === "batch" ? "lucide:files" : "lucide:file-check"
                }
                className="mx-auto text-4xl text-success"
              />

              {/* Single file display */}
              {selectedFiles.length === 1 ? (
                <div>
                  <p className="text-sm font-medium truncate px-4">
                    {selectedFiles[0].name}
                  </p>
                  <p className="text-xs text-default-500">
                    {formatFileSize(selectedFiles[0].size)}
                  </p>
                </div>
              ) : (
                /* Multiple files display */
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <p className="text-sm font-medium">
                    {selectedFiles.length}{" "}
                    {t("dashboard.processDocument.filesSelected")}
                  </p>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-default-50 p-2 rounded text-xs"
                    >
                      <span className="truncate flex-1">{file.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-default-500">
                          {formatFileSize(file.size)}
                        </span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onClick={() => onRemoveFile(index)}
                          isDisabled={isProcessing}
                        >
                          <Icon icon="lucide:x" className="text-xs" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="flat"
                  onClick={() => setSelectedFiles([])}
                  isDisabled={isProcessing}
                >
                  {t("dashboard.processDocument.clearAll")}
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  onClick={onUpload}
                  isLoading={isProcessing}
                  startContent={
                    !isProcessing && (
                      <Icon
                        icon={
                          uploadMode === "batch"
                            ? "lucide:zap"
                            : "lucide:upload"
                        }
                      />
                    )
                  }
                >
                  {uploadMode === "batch" && selectedFiles.length > 1
                    ? `${t("dashboard.processDocument.processMultiple")} ${
                        selectedFiles.length
                      } ${t("dashboard.processDocument.files")}`
                    : t("dashboard.processDocument.process")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              <Icon
                icon={
                  uploadMode === "batch"
                    ? "lucide:upload-cloud"
                    : "lucide:upload-cloud"
                }
                className={`mx-auto text-4xl transition-colors ${
                  dragActive ? "text-primary" : "text-default-400"
                }`}
              />
              <div>
                <input
                  type="file"
                  accept=".pdf"
                  multiple={uploadMode === "batch"}
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
                  {uploadMode === "batch"
                    ? t("dashboard.processDocument.selectMultiplePDFs")
                    : t("dashboard.processDocument.dragAndDrop")}
                </Button>
                <p className="text-xs text-default-500 mt-2">
                  {uploadMode === "batch"
                    ? t("dashboard.processDocument.uploadMultiple")
                    : t("dashboard.processDocument.uploadOne")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <Divider />
        <div className="bg-default-50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Icon icon="lucide:info" className="text-primary mt-0.5 text-sm" />
            <div className="text-xs">
              <p className="font-medium mb-1">Supported formats:</p>
              <ul className="text-default-600 space-y-0.5">
                <li>• PDF bank statements (digital and scanned)</li>
                <li>• Maximum file size: 10MB per document</li>
                <li>
                  • {uploadMode === "batch" ? "Multiple files" : "Single file"}{" "}
                  processing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default FileUploadSection;
