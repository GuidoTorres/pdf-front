import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from "../stores/useDocumentStore";

const HistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { documents, loadHistory } = useDocumentStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    return documents.filter((doc) => {
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        doc.original_file_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || doc.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderStatus = (status: string) => {
    const statusConfig = {
      completed: {
        color: "success" as const,
        icon: "lucide:check-circle",
        label: t('historyPage.statusCompleted'),
      },
      processing: {
        color: "warning" as const,
        icon: "lucide:clock",
        label: t('historyPage.statusProcessing'),
      },
      failed: {
        color: "danger" as const,
        icon: "lucide:x-circle",
        label: t('historyPage.statusFailed'),
      },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;

    return (
      <Chip
        color={config.color}
        variant="flat"
        size="sm"
        startContent={<Icon icon={config.icon} className="text-xs" />}
      >
        {config.label}
      </Chip>
    );
  };

  const formatDate = (value?: string) => {
    if (!value) return t('historyPage.unknown');
    return new Date(value).toLocaleString();
  };

  const renderPagesInfo = (pages?: number) => {
    const count = pages && pages > 0 ? pages : 1;
    return count === 1
      ? t('historyPage.pagesSingle')
      : t('historyPage.pagesPlural', { count });
  };

  const renderTransactionsInfo = (transactions?: unknown[]) => {
    const count = transactions?.length ?? 0;
    return count === 1
      ? t('historyPage.transactionsSingle')
      : t('historyPage.transactionsPlural', { count });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('historyPage.title')}</h1>
          <p className="text-default-600">
            {t('historyPage.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Chip color="primary" variant="flat">
{filteredDocuments.length} {t('historyPage.documentsCount')}
          </Chip>
        </div>
      </div>

      {/* Privacy notice */}
      <Card className="bg-default-50 border border-default-200">
        <CardBody className="flex items-start gap-3 text-sm text-default-600">
          <Icon icon="lucide:shield-check" className="text-default-400 mt-1" />
          <p>{t('historyPage.privacyNotice')}</p>
        </CardBody>
      </Card>

      {/* Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder={t('historyPage.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={
                <Icon icon="lucide:search" className="text-default-400" />
              }
              className="sm:max-w-xs"
            />
            <Select
              placeholder={t('historyPage.filterByStatus')}
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) =>
                setStatusFilter(Array.from(keys)[0] as string)
              }
              className="sm:max-w-xs"
            >
              <SelectItem key="all">{t('historyPage.allStatuses')}</SelectItem>
              <SelectItem key="completed">{t('historyPage.completed')}</SelectItem>
              <SelectItem key="processing">{t('historyPage.processing')}</SelectItem>
              <SelectItem key="failed">{t('historyPage.failed')}</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-xl font-semibold">{t('historyPage.title')}</h2>
        </CardHeader>
        <CardBody className="p-0">
          {paginatedDocuments.length > 0 ? (
            <Table aria-label="Documents table">
              <TableHeader>
                <TableColumn>{t('historyPage.columnDocument').toUpperCase()}</TableColumn>
                <TableColumn>{t('historyPage.columnStatus').toUpperCase()}</TableColumn>
                <TableColumn>{t('historyPage.columnUploaded').toUpperCase()}</TableColumn>
                <TableColumn>{t('historyPage.columnPages').toUpperCase()}</TableColumn>
                <TableColumn>{t('historyPage.columnTransactions').toUpperCase()}</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-default-100 rounded-lg">
                          <Icon
                            icon="lucide:file-text"
                            className="text-default-600"
                          />
                        </div>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">
                            {doc.original_file_name || doc.fileName || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderStatus(doc.status)}</TableCell>

                    <TableCell>
                      <span className="text-sm font-medium text-default-700">
                        {formatDate(doc.created_at)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col text-xs text-default-500">
                        <span>
                          {doc.file_size
                            ? t('historyPage.sizeLabel', {
                                size: (doc.file_size / 1024 / 1024).toFixed(1),
                              })
                            : t('historyPage.sizeUnknown')}
                        </span>
                        <span>{renderPagesInfo(doc.pages_processed)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-default-500">
                        {renderTransactionsInfo(doc.transactions)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Icon
                icon="lucide:file-x"
                className="text-6xl text-default-300 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{t('historyPage.noDocumentsFound')}</h3>
              <p className="text-default-500 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? t('historyPage.tryAdjustingFilters')
                  : t('historyPage.uploadFirstDocument')}
              </p>
              <p className="text-sm text-default-400">
                {t('historyPage.reuploadHint')}
              </p>
            </div>
          )}
        </CardBody>
        {totalPages > 1 && (
          <div className="flex justify-center p-4">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              showControls
              showShadow
              color="primary"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default HistoryPage;
