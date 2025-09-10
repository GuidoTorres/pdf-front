import React, { useState } from "react";
import { Button, Tooltip, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { apiService } from "../../services/api";
import { DocumentWithStatus } from "../../stores/useDocumentStore";

interface ExcelExportButtonProps {
  document: DocumentWithStatus;
  variant?: "solid" | "flat" | "ghost" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
  onExportStart?: () => void;
  onExportComplete?: (success: boolean, filename?: string) => void;
  onExportError?: (error: string) => void;
}

const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  document,
  variant = "flat",
  size = "sm",
  className = "",
  showLabel = true,
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async () => {
    if (!document || document.status !== "completed") {
      onExportError?.(t("dashboard.export.documentNotReady"));
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    onExportStart?.();

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await apiService.exportToExcel(document.id);

      clearInterval(progressInterval);
      setExportProgress(100);

      if (response.success && response.data) {
        // Generate filename based on document
        const baseFilename =
          document.fileName?.replace(/\.[^/.]+$/, "") || "transactions";
        const filename = `${baseFilename}_flexible_export.xlsx`;

        // Create download link
        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onExportComplete?.(true, filename);
      } else {
        throw new Error(response.error || "Export failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      onExportError?.(errorMessage);
      onExportComplete?.(false);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const isDisabled =
    !document || document.status !== "completed" || isExporting;

  const buttonContent = (
    <Button
      color="success"
      variant={variant}
      size={size}
      isDisabled={isDisabled}
      isLoading={isExporting}
      onClick={handleExport}
      className={className}
      startContent={
        !isExporting ? (
          <Icon icon="lucide:file-spreadsheet" className="text-sm" />
        ) : undefined
      }
    >
      {isExporting ? (
        <div className="flex items-center gap-2">
          <span className="text-xs">
            {exportProgress < 100 ? `${exportProgress}%` : "Finalizing..."}
          </span>
        </div>
      ) : showLabel ? (
        t("dashboard.export.excelExport")
      ) : null}
    </Button>
  );

  if (!showLabel) {
    return (
      <Tooltip
        content={
          isDisabled && document?.status !== "completed"
            ? t("dashboard.export.documentNotReady")
            : t("dashboard.export.excelExportTooltip")
        }
      >
        {buttonContent}
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {buttonContent}
      {isExporting && (
        <Progress
          size="sm"
          value={exportProgress}
          color="success"
          className="w-full"
          showValueLabel={false}
        />
      )}
    </div>
  );
};

export default ExcelExportButton;
