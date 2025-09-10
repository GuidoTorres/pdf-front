import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Select,
  SelectItem,
  Input,
  Button,
  Pagination,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { DocumentWithStatus } from "../../stores/useDocumentStore";
import { Transaction } from "../../services/api";
import { CategorizationService } from "../../services/categorization";
import EmptyState from "../EmptyState";

interface TransactionTableProps {
  currentDocument: DocumentWithStatus | null;
  editingTransactions: Record<string, boolean>;
  hasUnsavedChanges: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onSetTransactionEditing: (id: string, editing: boolean) => void;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  currentDocument,
  editingTransactions,
  hasUnsavedChanges,
  selectedCategory,
  onCategoryChange,
  onUpdateTransaction,
  onSetTransactionEditing,
  onSaveChanges,
  onDiscardChanges,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const transactions = currentDocument?.transactions || [];

  // Show all transactions (no filtering)
  const filteredTransactions = transactions;

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredTransactions.slice(start, end);
  }, [page, filteredTransactions]);


  const generateTransactionId = (
    transaction: Transaction,
    index: number
  ): string => {
    if (transaction.id) return transaction.id;

    const date =
      transaction.date || transaction.post_date || transaction.value_date || "";
    const desc = (transaction.description || "").substring(0, 20);
    const amount = transaction.amount || 0;

    return `tx-${date}-${desc.replace(/[^a-zA-Z0-9]/g, "")}-${amount}-${index}`;
  };

  if (!currentDocument || currentDocument.status !== "completed") {
    return (
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
    );
  }

  // Show empty state if no document is selected
  if (!currentDocument) {
    return (
      <EmptyState
        icon="lucide:file-search"
        title="No Document Selected"
        description="Upload and process a bank statement to view transactions here. Select from single or batch processing options."
        size="sm"
        action={{
          label: "Upload Document",
          onClick: () => {
            // Scroll to upload section
            document.querySelector('[data-upload-section]')?.scrollIntoView({ behavior: 'smooth' });
          },
          color: "primary",
          variant: "flat",
          startContent: <Icon icon="lucide:upload" />
        }}
      />
    );
  }

  // Show empty state if no transactions found
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="lucide:receipt"
        title="No Transactions Found" 
        description="This document was processed but no transactions were extracted. Try reprocessing with a different method or check if the PDF contains valid transaction data."
        size="sm"
        action={{
          label: "View Document Details",
          onClick: () => {
            console.log("View document details");
          },
          color: "warning",
          variant: "flat",
          startContent: <Icon icon="lucide:info" />
        }}
      />
    );
  }

  return (
    <div className="space-y-4">

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:alert-triangle" className="text-warning" />
              <span className="text-sm font-medium text-warning-700">
                {t("dashboard.excelPreview.unsavedChanges")}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="warning"
                variant="flat"
                onClick={onDiscardChanges}
                startContent={<Icon icon="lucide:x" />}
              >
                {t("dashboard.excelPreview.discard")}
              </Button>
              <Button
                size="sm"
                color="success"
                onClick={onSaveChanges}
                startContent={<Icon icon="lucide:save" />}
              >
                {t("dashboard.excelPreview.saveChanges")}
              </Button>
            </div>
          </div>
        </div>
      )}

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
          <TableColumn>{t("dashboard.excelPreview.date")}</TableColumn>
          <TableColumn>{t("dashboard.excelPreview.description")}</TableColumn>
          <TableColumn>{t("dashboard.excelPreview.category")}</TableColumn>
          <TableColumn>{t("dashboard.excelPreview.amount")}</TableColumn>
          <TableColumn>{t("dashboard.excelPreview.actions")}</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedTransactions.map((item: Transaction, index: number) => {
            const transactionId = generateTransactionId(item, index);
            const isEditing = editingTransactions[transactionId] || false;

            return (
              <TableRow
                key={transactionId}
                className={hasUnsavedChanges ? "bg-warning-50/30" : ""}
              >
                {/* Date Column */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      size="sm"
                      type="date"
                      value={item.date}
                      onChange={(e) =>
                        onUpdateTransaction(transactionId, {
                          date: e.target.value,
                        })
                      }
                      className="w-32"
                    />
                  ) : (
                    item.date
                  )}
                </TableCell>

                {/* Description Column */}
                <TableCell>
                  {isEditing ? (
                    <div className="max-w-xs">
                      <Input
                        size="sm"
                        value={item.description}
                        onChange={(e) =>
                          onUpdateTransaction(transactionId, {
                            description: e.target.value,
                          })
                        }
                        placeholder={t(
                          "dashboard.excelPreview.transactionDescription"
                        )}
                      />
                    </div>
                  ) : (
                    <div className="max-w-xs">
                      <p className="truncate text-sm">{item.description}</p>
                    </div>
                  )}
                </TableCell>


                {/* Category Column */}
                <TableCell>
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <Select
                        size="sm"
                        className="w-40"
                        selectedKeys={[item.category || "other"]}
                        onSelectionChange={(keys) => {
                          const selectedCategory = Array.from(
                            keys
                          )[0] as string;
                          onUpdateTransaction(transactionId, {
                            category: selectedCategory,
                            subcategory: "", // Reset subcategory when changing main category
                          });
                        }}
                      >
                        {
                          CategorizationService.getAllCategories().map(
                            (category) => (
                              <SelectItem
                                key={category.id}
                                startContent={<Icon icon={category.icon} />}
                              >
                                {category.name}
                              </SelectItem>
                            )
                          ) as any
                        }
                      </Select>
                      <Input
                        size="sm"
                        placeholder={t("dashboard.excelPreview.subcategory")}
                        value={item.subcategory || ""}
                        onChange={(e) =>
                          onUpdateTransaction(transactionId, {
                            subcategory: e.target.value,
                          })
                        }
                        className="w-40"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">

                        {/* Transaction type indicator */}
                        <Chip
                          size="sm"
                          color={item.type === "credit" ? "success" : "danger"}
                          variant="dot"
                          className="text-xs"
                        >
                          {item.type === "credit"
                            ? t("dashboard.excelPreview.income")
                            : t("dashboard.excelPreview.expense")}
                        </Chip>
                      </div>
                      {item.subcategory && (
                        <span className="text-xs text-default-500 truncate">
                          {item.subcategory}
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>

                {/* Amount Column */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      size="sm"
                      type="number"
                      step="0.01"
                      value={item.amount.toString()}
                      onChange={(e) =>
                        onUpdateTransaction(transactionId, {
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-24"
                      startContent={<span className="text-xs">€</span>}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Transaction type indicator */}
                      <Icon
                        icon={
                          item.type === "credit"
                            ? "lucide:arrow-down-left"
                            : "lucide:arrow-up-right"
                        }
                        className={`text-xs ${
                          item.type === "credit"
                            ? "text-success"
                            : "text-danger"
                        }`}
                      />
                      <span
                        className={
                          item.type === "credit"
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {/* Show positive amounts for credits, negative for debits */}
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: currentDocument.meta.currency || "EUR",
                          signDisplay: "always",
                        }).format(
                          item.type === "credit"
                            ? Math.abs(item.amount)
                            : -Math.abs(item.amount)
                        )}
                      </span>
                    </div>
                  )}
                </TableCell>


                {/* Actions Column */}
                <TableCell>
                  <div className="flex gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          isIconOnly
                          size="sm"
                          color="success"
                          variant="flat"
                          onClick={() =>
                            onSetTransactionEditing(transactionId, false)
                          }
                        >
                          <Icon icon="lucide:check" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="flat"
                          onClick={() => {
                            // Revert changes to this transaction
                            onSetTransactionEditing(transactionId, false);
                            // Note: In a more complex implementation, you'd restore the original values
                          }}
                        >
                          <Icon icon="lucide:x" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() =>
                          onSetTransactionEditing(transactionId, true)
                        }
                      >
                        <Icon icon="lucide:edit" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
