import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Pagination,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { DocumentWithStatus } from "../../stores/useDocumentStore";
import { getStatusChip, getStatusIcon } from "../../utils/dashboardUtils";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentWithStatus[];
  currentDocument: DocumentWithStatus | null;
  onDocumentSelect: (doc: DocumentWithStatus) => void;
}

const ITEMS_PER_PAGE = 10;

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  documents,
  currentDocument,
  onDocumentSelect,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const handleDocumentSelect = (doc: DocumentWithStatus) => {
    if (doc.status === "completed") {
      onDocumentSelect(doc);
      onClose();
    }
  };

  // Filter and search documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.fileName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      doc.meta?.bank_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "warning";
      case "failed":
        return "danger";
      case "queued":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "p-0",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {t("dashboard.jobs.history.title")}
              </h3>
              <p className="text-sm text-default-500">
                {t("dashboard.jobs.history.subtitle", {
                  total: documents.length,
                })}
              </p>
            </div>
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
            >
              <Icon icon="lucide:x" className="w-5 h-5" />
            </Button>
          </div>
        </ModalHeader>

        <ModalBody className="px-6 pb-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              placeholder={t("dashboard.jobs.history.search")}
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Icon icon="lucide:search" className="w-4 h-4" />}
              className="flex-1"
            />
            <Select
              placeholder={t("dashboard.jobs.history.filterByStatus")}
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
              className="w-full sm:w-48"
            >
              <SelectItem key="all" value="all">
                {t("dashboard.jobs.history.allStatuses")}
              </SelectItem>
              <SelectItem key="completed" value="completed">
                {t("dashboard.jobs.status.completed")}
              </SelectItem>
              <SelectItem key="processing" value="processing">
                {t("dashboard.jobs.status.processing")}
              </SelectItem>
              <SelectItem key="failed" value="failed">
                {t("dashboard.jobs.status.failed")}
              </SelectItem>
              <SelectItem key="queued" value="queued">
                {t("dashboard.jobs.status.queued")}
              </SelectItem>
            </Select>
          </div>

          {/* Documents List */}
          {paginatedDocuments.length > 0 ? (
            <div className="space-y-2">
              {paginatedDocuments.map((doc) => (
                <div
                  key={doc.jobId}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    doc.status === "completed"
                      ? "cursor-pointer hover:bg-default-50 hover:border-primary-200"
                      : "cursor-not-allowed opacity-60"
                  } ${
                    currentDocument?.jobId === doc.jobId
                      ? "bg-primary-50 border-primary-200"
                      : "bg-default-25 border-default-200"
                  }`}
                  onClick={() => handleDocumentSelect(doc)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(doc.status)}
                    </div>

                    {/* Bank logo if detected */}
                    {doc.bankDetection && (
                      <div className="flex-shrink-0">
                        <Icon
                          icon="lucide:building-2"
                          className="w-5 h-5 text-default-400"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {doc.fileName ||
                            doc.meta?.bank_name ||
                            t("dashboard.jobs.processedDocument")}
                        </p>
                        {doc.meta?.statement_period && (
                          <Chip size="sm" variant="flat" color="default">
                            {doc.meta.statement_period}
                          </Chip>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-default-500 mt-1">
                        <span>
                          {new Date(doc.createdAt || new Date()).toLocaleDateString()}
                        </span>
                        {doc.transactions && doc.transactions.length > 0 && (
                          <span>
                            {t("dashboard.jobs.history.transactionCount", {
                              count: doc.transactions.length,
                            })}
                          </span>
                        )}
                        {doc.bankDetection?.bank && (
                          <span className="flex items-center gap-1">
                            <Icon icon="lucide:building-2" className="w-3 h-3" />
                            {doc.bankDetection.bank}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Chip
                      size="sm"
                      color={getStatusColor(doc.status)}
                      variant="flat"
                    >
                      {t(`dashboard.jobs.status.${doc.status}`)}
                    </Chip>
                    {doc.status === "completed" && (
                      <Icon
                        icon="lucide:chevron-right"
                        className="w-4 h-4 text-default-400"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon
                icon="lucide:search-x"
                className="mx-auto text-4xl text-default-300 mb-2"
              />
              <p className="text-default-500">
                {searchTerm || statusFilter !== "all"
                  ? t("dashboard.jobs.history.noResultsFound")
                  : t("dashboard.jobs.noJobs")}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
                showShadow
                size="sm"
              />
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default HistoryModal;