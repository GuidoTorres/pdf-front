import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Button,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import AdaptiveTransactionTable from "./AdaptiveTransactionTable";
import ExtractionMetadataPanel from "./ExtractionMetadataPanel";
import OriginalDataTable from "./OriginalDataTable";
import { DocumentWithStatus } from "../../stores/useDocumentStore";
import {
  FlexibleTransaction,
  DocumentStructure,
} from "../../types/transaction";

interface EnhancedTransactionPreviewProps {
  currentDocument: DocumentWithStatus | null;
  onShowNotification?: (
    message: string,
    type: "success" | "error" | "info"
  ) => void;
  className?: string;
}

const EnhancedTransactionPreview: React.FC<EnhancedTransactionPreviewProps> = ({
  currentDocument,
  onShowNotification,
  className = "",
}) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("transactions");

  // Convert current document transactions to flexible format
  const flexibleTransactions: FlexibleTransaction[] = React.useMemo(() => {
    if (!currentDocument?.transactions) return [];

    return currentDocument.transactions.map((tx) => ({
      ...tx,
      // Add mock original data for demonstration
      // In real implementation, this would come from the backend
      originalData: tx.originalData || {
        Fecha: tx.date,
        Descripción: tx.description,
        Importe: tx.amount.toString(),
        Saldo: tx.balance?.toString() || "",
      },
      transformationMetadata: tx.transformationMetadata || {
        confidence: tx.confidence || 0.85,
        sourceColumns: ["Fecha", "Descripción", "Importe"],
        preservationFlags: {
          originalFormatPreserved: true,
          dataTypesPreserved: true,
          allColumnsIncluded: true,
        },
      },
    }));
  }, [currentDocument?.transactions]);

  // Mock document structure - in real implementation, this would come from the backend
  const documentStructure: DocumentStructure | undefined = React.useMemo(() => {
    if (!currentDocument) return undefined;

    return {
      originalHeaders: ["Fecha", "Descripción", "Importe", "Saldo"],
      columnMetadata: {
        originalColumnNames: ["Fecha", "Descripción", "Importe", "Saldo"],
        normalizedColumnNames: ["date", "description", "amount", "balance"],
        columnTypes: ["date", "text", "currency", "currency"],
        dataPatterns: ["dd/mm/yyyy", "text", "decimal", "decimal"],
      },
      preservedData: true,
      extractionMethod: "flexible",
      confidence: 0.92,
    };
  }, [currentDocument]);

  const hasFlexibleData = flexibleTransactions.some(
    (tx) => tx.originalData && Object.keys(tx.originalData).length > 0
  );

  // Excel export handler
  const handleExportToExcel = () => {
    if (!currentDocument?.transactions) return;
    
    try {
      // Prepare data for Excel
      const transactions = currentDocument.transactions;
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Convert transactions to array format
      const wsData = [
        // Headers
        ['Fecha', 'Descripción', 'Importe', 'Saldo', 'Tipo', 'Referencia'],
        // Data rows
        ...transactions.map(tx => [
          tx.date || tx.post_date || tx.value_date || '',
          tx.description || '',
          tx.amount || 0,
          tx.balance || '',
          tx.type || '',
          tx.reference || ''
        ])
      ];
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
      
      // Generate filename
      const originalName = currentDocument.fileName || 'documento';
      const baseName = originalName.replace(/\.[^/.]+$/, ''); // Remove extension
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const filename = `${baseName}_${timestamp}.xlsx`;
      
      // Download file
      XLSX.writeFile(wb, filename);
      
      onShowNotification?.("Excel generado exitosamente", "success");
    } catch (error) {
      console.error('Error generating Excel:', error);
      onShowNotification?.("Error al generar Excel", "error");
    }
  };

  if (!currentDocument) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <Icon
            icon="lucide:file-search"
            className="mx-auto text-4xl text-default-300 mb-4"
          />
          <h3 className="text-lg font-semibold text-default-600 mb-2">
            No Document Selected
          </h3>
          <p className="text-default-500">
            Upload and process a bank statement to view the enhanced preview
          </p>
        </CardBody>
      </Card>
    );
  }

  if (currentDocument.status !== "completed") {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <Icon
            icon="lucide:clock"
            className="mx-auto text-4xl text-warning mb-4"
          />
          <h3 className="text-lg font-semibold text-warning-600 mb-2">
            Document Processing
          </h3>
          <p className="text-default-500">
            Please wait while the document is being processed
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Export Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:eye" className="text-primary text-lg" />
              <div>
                <h3 className="text-lg font-semibold">Document Preview</h3>
                <p className="text-sm text-default-500">
                  {currentDocument.fileName} • {flexibleTransactions.length}{" "}
                  transactions
                </p>
              </div>
              {hasFlexibleData && (
                <Chip size="sm" color="success" variant="flat">
                  <Icon icon="lucide:shield-check" className="text-xs mr-1" />
                  Flexible Data
                </Chip>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Icon icon="lucide:file-spreadsheet" className="text-sm" />}
                onPress={handleExportToExcel}
              >
                Exportar Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabbed Content */}
      <Card>
        <CardBody className="p-0">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: "px-4 pt-4",
              panel: "px-4 pb-4",
            }}
          >
            <Tab
              key="transactions"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:table" className="text-sm" />
                  <span>Transactions</span>
                  <Chip size="sm" variant="flat">
                    {flexibleTransactions.length}
                  </Chip>
                </div>
              }
            >
              <AdaptiveTransactionTable
                transactions={flexibleTransactions}
                documentStructure={documentStructure}
                currency={currentDocument.meta?.currency || "EUR"}
                className="mt-4"
              />
            </Tab>

            <Tab
              key="metadata"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:info" className="text-sm" />
                  <span>Metadata</span>
                  {documentStructure?.confidence && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        documentStructure.confidence > 0.8
                          ? "success"
                          : "warning"
                      }
                    >
                      {Math.round(documentStructure.confidence * 100)}%
                    </Chip>
                  )}
                </div>
              }
            >
              <div className="mt-4">
                <ExtractionMetadataPanel
                  documentStructure={documentStructure}
                  transactions={flexibleTransactions}
                  isCollapsible={false}
                />
              </div>
            </Tab>

            <Tab
              key="original"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:file-text" className="text-sm" />
                  <span>Original</span>
                </div>
              }
            >
              <div className="mt-4">
                <OriginalDataTable currentDocument={currentDocument} />
              </div>
            </Tab>

            {hasFlexibleData && (
              <Tab
                key="structure"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:columns" className="text-sm" />
                    <span>Structure</span>
                    <Chip size="sm" variant="flat" color="primary">
                      {documentStructure?.columnMetadata?.originalColumnNames
                        ?.length || 0}
                    </Chip>
                  </div>
                }
              >
                <div className="mt-4 space-y-4">
                  {/* Column Structure Visualization */}
                  <Card className="bg-gradient-to-r from-primary-50 to-secondary-50">
                    <CardHeader>
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Icon icon="lucide:layout" className="text-primary" />
                        Original Document Structure
                      </h4>
                    </CardHeader>
                    <CardBody>
                      {documentStructure?.columnMetadata && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium mb-2">
                                Original Columns
                              </h5>
                              <div className="space-y-1">
                                {documentStructure.columnMetadata.originalColumnNames.map(
                                  (col, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 p-2 bg-white rounded"
                                    >
                                      <div className="w-6 h-6 bg-primary-100 rounded flex items-center justify-center text-xs font-medium text-primary-600">
                                        {index + 1}
                                      </div>
                                      <span className="text-sm font-medium">
                                        {col}
                                      </span>
                                      <Chip
                                        size="sm"
                                        variant="flat"
                                        color="default"
                                      >
                                        {
                                          documentStructure.columnMetadata
                                            .columnTypes[index]
                                        }
                                      </Chip>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium mb-2">
                                Normalized Mapping
                              </h5>
                              <div className="space-y-1">
                                {documentStructure.columnMetadata.normalizedColumnNames.map(
                                  (col, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 p-2 bg-white rounded"
                                    >
                                      <div className="w-6 h-6 bg-secondary-100 rounded flex items-center justify-center text-xs font-medium text-secondary-600">
                                        {index + 1}
                                      </div>
                                      <span className="text-sm font-medium">
                                        {col}
                                      </span>
                                      <Icon
                                        icon="lucide:arrow-left"
                                        className="text-xs text-default-400"
                                      />
                                      <span className="text-xs text-default-500">
                                        {
                                          documentStructure.columnMetadata
                                            .originalColumnNames[index]
                                        }
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              </Tab>
            )}
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

export default EnhancedTransactionPreview;
