import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from "../stores/useDocumentStore";
import { useAuthStore } from "../stores/useAuthStore";
import DocumentDetails from "../components/DocumentDetails";

const HistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { documents, loadHistory } = useDocumentStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    console.log('HistoryPage: Loading history...');
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    console.log('HistoryPage: Documents updated:', documents);
  }, [documents]);

  const filteredDocuments =
    documents?.filter((doc) => {
      console.log('Filtering doc:', doc);
      const matchesSearch = searchTerm === "" || doc.original_file_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || doc.status === statusFilter;
      console.log('Search match:', matchesSearch, 'Status match:', matchesStatus);
      return matchesSearch && matchesStatus;
    }) || [];
  
  console.log('Filtered documents:', filteredDocuments.length);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusChip = (status: string) => {
    const statusConfig = {
      completed: {
        color: "success" as const,
        icon: "lucide:check-circle",
        text: t('historyPage.completed'),
      },
      processing: {
        color: "warning" as const,
        icon: "lucide:clock",
        text: t('historyPage.processing'),
      },
      failed: {
        color: "danger" as const,
        icon: "lucide:x-circle",
        text: t('historyPage.failed'),
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.failed;

    return (
      <Chip
        color={config.color}
        variant="flat"
        size="sm"
        startContent={<Icon icon={config.icon} className="text-sm" />}
      >
        {config.text}
      </Chip>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = (document: any) => {
    if (document.status !== "completed" || !document.transactions) return;

    const csvContent = [
      ["Date", "Description", "Amount", "Balance"].join(","),
      ...document.transactions.map((t: any) =>
        [t.date, `"${t.description}"`, t.amount, t.balance || 0].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${document.original_file_name || "transactions"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (document: any) => {
    setSelectedDocument(document);
    setIsDetailsOpen(true);
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

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-200 rounded-lg">
                <Icon icon="lucide:file-text" className="text-primary text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-primary-600">{t('historyPage.totalDocuments')}</p>
                <p className="text-2xl font-bold text-primary">
                  {documents?.length || 0}
                </p>
                <p className="text-xs text-primary-600">
                  {documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) / 1024 / 1024 > 0
                    ? `${(documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0) / 1024 / 1024).toFixed(1)} MB ${t('historyPage.total')}`
                    : t('historyPage.noSizeData')}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-success-50 to-success-100 border border-success-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-200 rounded-lg">
                <Icon icon="lucide:check-circle" className="text-success text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-success-600">{t('historyPage.completed')}</p>
                <p className="text-2xl font-bold text-success">
                  {documents?.filter((d) => d.status === "completed").length || 0}
                </p>
                <p className="text-xs text-success-600">
                  {documents?.reduce((sum, doc) => sum + (doc.transactions?.length || 0), 0) || 0} {t('historyPage.transactionsExtracted')}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border border-warning-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-200 rounded-lg">
                <Icon icon="lucide:clock" className="text-warning text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-warning-600">{t('historyPage.processing')}</p>
                <p className="text-2xl font-bold text-warning">
                  {documents?.filter((d) => d.status === "processing").length || 0}
                </p>
                <p className="text-xs text-warning-600">
                  {documents?.reduce((sum, doc) => sum + (doc.pages_processed || 1), 0) || 0} {t('historyPage.pagesProcessed')}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-200 rounded-lg">
                <Icon icon="lucide:trending-up" className="text-secondary text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-secondary-600">{t('historyPage.avgQuality')}</p>
                <p className="text-2xl font-bold text-secondary">
                  {documents?.filter(d => d.quality?.score).length > 0
                    ? `${Math.round(
                        (documents.filter(d => d.quality?.score).reduce((sum, doc) => sum + (doc.quality?.score || 0), 0) /
                         documents.filter(d => d.quality?.score).length) * 100
                      )}%`
                    : '95%'}
                </p>
                <p className="text-xs text-secondary-600">
                  {t('historyPage.aiProcessingAccuracy')}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

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
                <TableColumn>{t('historyPage.filename').toUpperCase()}</TableColumn>
                <TableColumn>{t('historyPage.status').toUpperCase()}</TableColumn>
                <TableColumn>{t('historyPage.date').toUpperCase()}</TableColumn>
                <TableColumn>{t('historyPage.sizePages').toUpperCase()}</TableColumn>
                <TableColumn>{t('historyPage.transactions').toUpperCase()}</TableColumn>
                <TableColumn>{t('historyPage.actions').toUpperCase()}</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    {/* Filename Column */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-default-100 rounded-lg">
                          <Icon
                            icon={doc.meta?.bank_name ? "lucide:building-2" : "lucide:file-text"}
                            className="text-default-600"
                          />
                        </div>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">
                            {doc.original_file_name || doc.fileName || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-default-500">
                            {doc.meta?.bank_name && (
                              <span className="text-primary font-medium">{doc.meta.bank_name}</span>
                            )}
                            {doc.meta?.account_number && (
                              <span>•••{doc.meta.account_number.slice(-4)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Status Column */}
                    <TableCell>{getStatusChip(doc.status)}</TableCell>
                    
                    {/* Date Column */}
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{formatDate(doc.created_at)}</p>
                        {doc.meta?.period && (
                          <p className="text-xs text-default-500">{doc.meta.period}</p>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Size/Pages Column */}
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {doc.file_size
                            ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB`
                            : "Unknown"}
                        </p>
                        <p className="text-xs text-default-500">
                          {doc.pages_processed || 1} {(doc.pages_processed || 1) > 1 ? t('historyPage.pages') : t('historyPage.page')}
                        </p>
                      </div>
                    </TableCell>
                    
                    {/* Transactions Column */}
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {doc.transactions?.length || 0} {t('historyPage.transactions')}
                        </p>
                        {doc.meta?.currency && (
                          <p className="text-xs text-default-500">
                            {doc.meta.currency} • 
                            {doc.meta.opening_balance !== undefined && (
                              <span> {t('historyPage.balance')}: {doc.meta.opening_balance.toFixed(2)}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Actions Column */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {doc.status === "completed" && (
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={<Icon icon="lucide:download" />}
                            onClick={() => handleDownload(doc)}
                          >
                            {t('historyPage.download')}
                          </Button>
                        )}
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="light" isIconOnly aria-label="More actions">
                              <Icon icon="lucide:more-vertical" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="view"
                              startContent={<Icon icon="lucide:eye" />}
                              onPress={() => handleViewDetails(doc)}
                            >
                              {t('historyPage.viewDetails')}
                            </DropdownItem>
                            <DropdownItem
                              key="reprocess"
                              startContent={<Icon icon="lucide:refresh-cw" />}
                            >
                              {t('historyPage.reprocess')}
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Icon icon="lucide:trash-2" />}
                            >
                              {t('historyPage.delete')}
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
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
              <Button
                color="primary"
                startContent={<Icon icon="lucide:upload" />}
              >
                {t('historyPage.uploadDocument')}
              </Button>
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

      {/* Document Details Modal */}
      <DocumentDetails
        document={selectedDocument}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedDocument(null);
        }}
      />
    </div>
  );
};

export default HistoryPage;
