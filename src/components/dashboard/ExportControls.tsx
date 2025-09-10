import React, { useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  Chip,
  Card,
  CardBody,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { DocumentWithStatus } from "../../stores/useDocumentStore";
import { ExportService, EXPORT_FORMATS } from "../../services/exportFormats";
import ExcelExportButton from "./ExcelExportButton";

interface ExportControlsProps {
  currentDocument: DocumentWithStatus | null;
  documents: DocumentWithStatus[];
  selectedExportFormat: string;
  onExportFormatChange: (format: string) => void;
  hasUnsavedChanges: boolean;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
  onShowNotification?: (
    message: string,
    type: "success" | "error" | "info"
  ) => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  currentDocument,
  documents,
  selectedExportFormat,
  onExportFormatChange,
  hasUnsavedChanges,
  onSaveChanges,
  onDiscardChanges,
}) => {
  const { t } = useTranslation();
  const [showFormatInfo, setShowFormatInfo] = useState(false);

  // Excel export handlers
  const handleExcelExportStart = () => {
    onShowNotification?.(t("dashboard.export.excelExportStarted"), "info");
  };

  const handleExcelExportComplete = (success: boolean, filename?: string) => {
    if (success) {
      onShowNotification?.(
        t("dashboard.export.excelExportSuccess", { filename }),
        "success"
      );
    }
  };

  const handleExcelExportError = (error: string) => {
    onShowNotification?.(
      t("dashboard.export.excelExportError", { error }),
      "error"
    );
  };

  const handleDownloadCurrent = () => {
    if (!currentDocument || currentDocument.status !== "completed") return;

    const baseFilename =
      currentDocument.fileName?.replace(/\.[^/.]+$/, "") || "transactions";
    ExportService.exportTransactions(
      currentDocument.transactions,
      selectedExportFormat,
      baseFilename,
      currentDocument.meta
    );
  };

  const handleDownloadCombined = () => {
    const completedDocs = documents.filter((doc) => doc.status === "completed");
    if (completedDocs.length === 0) return;

    const allTransactions: any[] = [];

    completedDocs.forEach((doc) => {
      doc.transactions.forEach((transaction) => {
        allTransactions.push({
          ...transaction,
          // Add source document info
          sourceDocument: doc.fileName || t("dashboard.export.unknown"),
          sourceBank: doc.meta?.bank_name || t("dashboard.export.unknown"),
        });
      });
    });

    // Sort by date
    allTransactions.sort(
      (a, b) =>
        new Date(a.date || a.post_date).getTime() -
        new Date(b.date || b.post_date).getTime()
    );

    const filename = `combined-statements-${completedDocs.length}-docs`;
    const combinedMeta = {
      sourceDocuments: completedDocs.map((doc) => ({
        fileName: doc.fileName,
        bankName: doc.meta?.bank_name,
        transactionCount: doc.transactions.length,
      })),
      totalDocuments: completedDocs.length,
    };

    ExportService.exportTransactions(
      allTransactions,
      selectedExportFormat,
      filename,
      combinedMeta
    );
  };

  return (
    <div className="flex flex-col gap-4">


      {/* Standard Export Format and Buttons */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-default-600">
          {t("dashboard.export.exportFormat")}:
        </span>
        <Select
          size="sm"
          className="w-40"
          selectedKeys={[selectedExportFormat]}
          onSelectionChange={(keys) =>
            onExportFormatChange(Array.from(keys)[0] as string)
          }
        >
          {EXPORT_FORMATS.map((format) => (
            <SelectItem
              key={format.id}
              startContent={<Icon icon={format.icon} />}
            >
              {format.name}
            </SelectItem>
          ))}
        </Select>

        {/* Action Buttons in same row */}
        <div className="flex gap-2">
          {/* Save/Discard buttons */}
          {hasUnsavedChanges && (
            <>
              <Button
                color="warning"
                variant="flat"
                size="sm"
                onClick={onDiscardChanges}
                startContent={<Icon icon="lucide:x" />}
              >
                {t("dashboard.export.discardChanges")}
              </Button>
              <Button
                color="success"
                size="sm"
                onClick={onSaveChanges}
                startContent={<Icon icon="lucide:save" />}
              >
                {t("dashboard.export.save")}
              </Button>
            </>
          )}

          {/* Download Current */}
          <Button
            color="primary"
            size="sm"
            disabled={
              !currentDocument || currentDocument.status !== "completed"
            }
            onClick={handleDownloadCurrent}
            startContent={<Icon icon="lucide:download" />}
          >
            {t("dashboard.export.download")}
          </Button>

          {/* Download All (if multiple docs) */}
          {documents.filter((doc) => doc.status === "completed").length > 1 && (
            <Button
              color="secondary"
              variant="flat"
              size="sm"
              onClick={handleDownloadCombined}
              startContent={<Icon icon="lucide:layers" />}
            >
              {t("dashboard.export.all")} (
              {documents.filter((doc) => doc.status === "completed").length})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportControls;
