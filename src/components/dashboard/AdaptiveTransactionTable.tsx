import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Switch,
  Card,
  CardBody,
  Pagination,
  Tooltip,
  Select,
  SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Transaction } from "../../services/api";

// Import validation status type
import { ValidationStatus } from "../../types/transaction";

// Extended transaction interface for flexible data
interface FlexibleTransaction extends Transaction {
  originalData?: Record<string, any>;
  // Validation metadata from backend
  _validation_status?: ValidationStatus;
  _validation_errors?: string[];
  _validation_error?: string;
  _quality_score?: number;
  transformationMetadata?: {
    sourceColumns?: string[];
    transformationRules?: string[];
    confidence?: number;
    preservationFlags?: {
      originalFormatPreserved?: boolean;
      dataTypesPreserved?: boolean;
      allColumnsIncluded?: boolean;
    };
  };
}

// Document structure metadata
interface DocumentStructure {
  originalHeaders?: string[];
  columnMetadata?: {
    originalColumnNames: string[];
    normalizedColumnNames: string[];
    columnTypes: string[];
    dataPatterns: string[];
  };
  preservedData?: boolean;
  extractionMethod?: string;
  confidence?: number;
}

interface AdaptiveTransactionTableProps {
  transactions: FlexibleTransaction[];
  documentStructure?: DocumentStructure;
  currency?: string;
  onTransactionUpdate?: (
    id: string,
    updates: Partial<FlexibleTransaction>
  ) => void;
  className?: string;
}

const AdaptiveTransactionTable: React.FC<AdaptiveTransactionTableProps> = ({
  transactions,
  documentStructure,
  currency = "EUR",
  onTransactionUpdate,
  className = "",
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"normalized" | "original">(
    "normalized"
  );
  const [page, setPage] = useState(1);
  const [highlightMappings, setHighlightMappings] = useState(false);
  const [showValidationStatus, setShowValidationStatus] = useState(true);
  const [validationFilter, setValidationFilter] = useState<ValidationStatus | "all">("all");
  const rowsPerPage = 10;

  // Helper function to get validation status color and icon
  const getValidationStatusInfo = (status?: ValidationStatus) => {
    switch (status) {
      case "invalid":
        return {
          color: "danger" as const,
          icon: "lucide:alert-triangle",
          text: "Invalid",
        };
      case "error":
        return {
          color: "danger" as const,
          icon: "lucide:x-circle",
          text: "Error",
        };
      case "warning":
        return {
          color: "warning" as const,
          icon: "lucide:alert-circle",
          text: "Warning",
        };
      default:
        return {
          color: "success" as const,
          icon: "lucide:check-circle",
          text: "Valid",
        };
    }
  };

  // Count validation status
  const validationStats = useMemo(() => {
    const stats = {
      total: transactions.length,
      valid: 0,
      invalid: 0,
      error: 0,
      warning: 0,
    };
    
    transactions.forEach(tx => {
      if (tx._validation_status === "invalid") stats.invalid++;
      else if (tx._validation_status === "error") stats.error++;
      else if (tx._validation_status === "warning") stats.warning++;
      else stats.valid++;
    });
    
    return stats;
  }, [transactions]);

  // Determine if we have flexible data
  const hasFlexibleData = useMemo(() => {
    return transactions.some(
      (tx) => tx.originalData && Object.keys(tx.originalData).length > 0
    );
  }, [transactions]);

  // Get original column names from the first transaction or document structure
  const originalColumns = useMemo(() => {
    if (documentStructure?.columnMetadata?.originalColumnNames) {
      return documentStructure.columnMetadata.originalColumnNames;
    }

    if (hasFlexibleData && transactions[0]?.originalData) {
      return Object.keys(transactions[0].originalData);
    }

    return [];
  }, [documentStructure, hasFlexibleData, transactions]);

  // Filter transactions by validation status
  const filteredTransactions = useMemo(() => {
    if (validationFilter === "all") {
      return transactions;
    }
    return transactions.filter(tx => {
      const status = tx._validation_status || "valid";
      return status === validationFilter;
    });
  }, [transactions, validationFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredTransactions.slice(start, end);
  }, [page, filteredTransactions]);

  // Render normalized view (current format)
  const renderNormalizedView = () => (
    <Table
      isStriped
      aria-label={t("dashboard.excelPreview.tableAriaLabel")}
      className={className}
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
        <TableColumn>{t("dashboard.excelPreview.date")}</TableColumn>
        <TableColumn>{t("dashboard.excelPreview.description")}</TableColumn>
        <TableColumn>{t("dashboard.excelPreview.category")}</TableColumn>
        <TableColumn>{t("dashboard.excelPreview.amount")}</TableColumn>
        {showValidationStatus && (
          <TableColumn>
            <Tooltip content="Validation status">
              <div className="flex items-center gap-1">
                <Icon icon="lucide:shield-check" className="text-sm" />
                Status
              </div>
            </Tooltip>
          </TableColumn>
        )}
        {hasFlexibleData && (
          <TableColumn>
            <Tooltip content="Transformation confidence">
              <div className="flex items-center gap-1">
                <Icon icon="lucide:zap" className="text-sm" />
                Confidence
              </div>
            </Tooltip>
          </TableColumn>
        )}
      </TableHeader>
      <TableBody>
        {paginatedTransactions.map((transaction, index) => (
          <TableRow
            key={transaction.id || `tx-${index}`}
            className={
              highlightMappings ? "hover:bg-primary-50 transition-colors" : ""
            }
          >
            <TableCell>
              <div className="flex flex-col">
                <span>{transaction.date}</span>
                {highlightMappings && transaction.originalData && (
                  <span className="text-xs text-default-400">
                    From:{" "}
                    {Object.keys(transaction.originalData).find(
                      (key) =>
                        key.toLowerCase().includes("fecha") ||
                        key.toLowerCase().includes("date")
                    ) || "N/A"}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="max-w-xs">
                <p className="truncate text-sm">{transaction.description}</p>
                {highlightMappings && transaction.originalData && (
                  <span className="text-xs text-default-400">
                    From:{" "}
                    {Object.keys(transaction.originalData).find(
                      (key) =>
                        key.toLowerCase().includes("concepto") ||
                        key.toLowerCase().includes("description") ||
                        key.toLowerCase().includes("detalle")
                    ) || "N/A"}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Chip
                size="sm"
                color={transaction.type === "credit" ? "success" : "danger"}
                variant="dot"
                className="text-xs"
              >
                {transaction.type === "credit"
                  ? t("dashboard.excelPreview.income")
                  : t("dashboard.excelPreview.expense")}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Icon
                  icon={
                    transaction.type === "credit"
                      ? "lucide:arrow-down-left"
                      : "lucide:arrow-up-right"
                  }
                  className={`text-xs ${
                    transaction.type === "credit"
                      ? "text-success"
                      : "text-danger"
                  }`}
                />
                <span
                  className={
                    transaction.type === "credit"
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  {new Intl.NumberFormat("es-ES", {
                    style: "currency",
                    currency: currency,
                    signDisplay: "always",
                  }).format(
                    transaction.type === "credit"
                      ? Math.abs(transaction.amount)
                      : -Math.abs(transaction.amount)
                  )}
                </span>
              </div>
            </TableCell>
            {showValidationStatus && (
              <TableCell>
                <div className="flex items-center gap-1">
                  {(() => {
                    const statusInfo = getValidationStatusInfo(transaction._validation_status);
                    return (
                      <Tooltip
                        content={
                          <div className="max-w-xs">
                            <p className="font-medium">{statusInfo.text}</p>
                            {transaction._validation_errors && transaction._validation_errors.length > 0 && (
                              <ul className="mt-1 text-xs list-disc list-inside">
                                {transaction._validation_errors.map((error, idx) => (
                                  <li key={idx}>{error}</li>
                                ))}
                              </ul>
                            )}
                            {transaction._validation_error && (
                              <p className="mt-1 text-xs">{transaction._validation_error}</p>
                            )}
                            {transaction._quality_score !== undefined && (
                              <p className="mt-1 text-xs">
                                Quality Score: {Math.round(transaction._quality_score * 100)}%
                              </p>
                            )}
                          </div>
                        }
                      >
                        <Chip
                          size="sm"
                          color={statusInfo.color}
                          variant="flat"
                          startContent={<Icon icon={statusInfo.icon} className="w-3 h-3" />}
                          className="text-xs cursor-help"
                        >
                          {statusInfo.text}
                        </Chip>
                      </Tooltip>
                    );
                  })()}
                </div>
              </TableCell>
            )}
            {hasFlexibleData && (
              <TableCell>
                {transaction.transformationMetadata?.confidence ? (
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        transaction.transformationMetadata.confidence > 0.8
                          ? "bg-success"
                          : transaction.transformationMetadata.confidence > 0.6
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                    />
                    <span className="text-xs">
                      {Math.round(
                        transaction.transformationMetadata.confidence * 100
                      )}
                      %
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-default-400">N/A</span>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Render original view (flexible format)
  const renderOriginalView = () => {
    if (!hasFlexibleData || originalColumns.length === 0) {
      return (
        <div className="text-center py-8">
          <Icon
            icon="lucide:info"
            className="mx-auto text-4xl text-default-300 mb-2"
          />
          <p className="text-default-500">
            No original data structure available
          </p>
          <p className="text-sm text-default-400">
            This document was processed with the standard extraction method
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table
          isStriped
          aria-label="Original data structure"
          className={`${className} min-w-full`}
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
            {originalColumns.map((column, index) => (
              <TableColumn key={index} className="whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="font-medium">{column}</span>
                  {documentStructure?.columnMetadata?.columnTypes?.[index] && (
                    <span className="text-xs text-default-400">
                      {documentStructure.columnMetadata.columnTypes[index]}
                    </span>
                  )}
                </div>
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction, index) => (
              <TableRow key={transaction.id || `tx-${index}`}>
                {originalColumns.map((column, colIndex) => (
                  <TableCell key={colIndex} className="whitespace-nowrap">
                    <div className="max-w-32">
                      <span className="text-sm">
                        {transaction.originalData?.[column] || "-"}
                      </span>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Controls */}
      {hasFlexibleData && (
        <Card>
          <CardBody className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    size="sm"
                    isSelected={viewMode === "original"}
                    onValueChange={(checked) =>
                      setViewMode(checked ? "original" : "normalized")
                    }
                  />
                  <span className="text-sm font-medium">
                    {viewMode === "original"
                      ? "Original View"
                      : "Normalized View"}
                  </span>
                </div>

                {viewMode === "normalized" && (
                  <>
                    <div className="flex items-center gap-2">
                      <Switch
                        size="sm"
                        isSelected={highlightMappings}
                        onValueChange={setHighlightMappings}
                      />
                      <span className="text-sm">Show Mappings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        size="sm"
                        isSelected={showValidationStatus}
                        onValueChange={setShowValidationStatus}
                      />
                      <span className="text-sm">Show Validation</span>
                    </div>
                    {showValidationStatus && (
                      <Select
                        size="sm"
                        placeholder="Filter by status"
                        className="min-w-32"
                        selectedKeys={[validationFilter]}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as ValidationStatus | "all";
                          setValidationFilter(selected);
                          setPage(1); // Reset to first page when filtering
                        }}
                      >
                        <SelectItem key="all" value="all">
                          All ({validationStats.total})
                        </SelectItem>
                        <SelectItem key="valid" value="valid">
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:check-circle" className="text-xs text-success" />
                            Valid ({validationStats.valid})
                          </div>
                        </SelectItem>
                        {validationStats.invalid > 0 && (
                          <SelectItem key="invalid" value="invalid">
                            <div className="flex items-center gap-2">
                              <Icon icon="lucide:alert-triangle" className="text-xs text-danger" />
                              Invalid ({validationStats.invalid})
                            </div>
                          </SelectItem>
                        )}
                        {validationStats.error > 0 && (
                          <SelectItem key="error" value="error">
                            <div className="flex items-center gap-2">
                              <Icon icon="lucide:x-circle" className="text-xs text-danger" />
                              Error ({validationStats.error})
                            </div>
                          </SelectItem>
                        )}
                        {validationStats.warning > 0 && (
                          <SelectItem key="warning" value="warning">
                            <div className="flex items-center gap-2">
                              <Icon icon="lucide:alert-circle" className="text-xs text-warning" />
                              Warning ({validationStats.warning})
                            </div>
                          </SelectItem>
                        )}
                      </Select>
                    )}
                  </>
                )}
              </div>

              {/* Metadata Info */}
              <div className="flex items-center gap-4 text-sm text-default-600 flex-wrap">
                {/* Validation Stats */}
                {showValidationStatus && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Icon icon="lucide:check-circle" className="text-xs text-success" />
                      <span>{validationStats.valid}</span>
                    </div>
                    {validationStats.invalid > 0 && (
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:alert-triangle" className="text-xs text-danger" />
                        <span>{validationStats.invalid}</span>
                      </div>
                    )}
                    {validationStats.error > 0 && (
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:x-circle" className="text-xs text-danger" />
                        <span>{validationStats.error}</span>
                      </div>
                    )}
                    {validationStats.warning > 0 && (
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:alert-circle" className="text-xs text-warning" />
                        <span>{validationStats.warning}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {documentStructure && (
                  <>
                    {documentStructure.extractionMethod && (
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:cpu" className="text-xs" />
                        <span>{documentStructure.extractionMethod}</span>
                      </div>
                    )}
                    {documentStructure.confidence && (
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:target" className="text-xs" />
                        <span>
                          {Math.round(documentStructure.confidence * 100)}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Icon icon="lucide:columns" className="text-xs" />
                      <span>{originalColumns.length} columns</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Table Content */}
      {viewMode === "normalized"
        ? renderNormalizedView()
        : renderOriginalView()}

      {/* Footer Info */}
      <div className="text-xs text-default-500 text-center">
        Showing {paginatedTransactions.length} of {filteredTransactions.length}
        {validationFilter !== "all" && ` (filtered: ${validationFilter})`} 
        {filteredTransactions.length !== transactions.length && ` / ${transactions.length} total`}
        {" "}transactions
        {viewMode === "original" && " with preserved original structure"}
      </div>
    </div>
  );
};

export default AdaptiveTransactionTable;
