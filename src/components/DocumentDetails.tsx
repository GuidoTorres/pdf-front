import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { DocumentWithStatus } from "../stores/useDocumentStore";

interface DocumentDetailsProps {
  document: DocumentWithStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!document) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getQualityColor = (score?: number) => {
    if (!score) return 'default';
    if (score > 0.8) return 'success';
    if (score > 0.6) return 'warning';
    return 'danger';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  // Sample transactions for table (first 10)
  const sampleTransactions = document.transactions?.slice(0, 10) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Icon 
              icon={document.meta?.bank_name ? "lucide:building-2" : "lucide:file-text"} 
              className="text-2xl text-primary"
            />
            <div>
              <h2 className="text-xl font-semibold">
                {document.original_file_name || document.fileName || 'Document Details'}
              </h2>
              <p className="text-sm text-default-500">
                Processed {formatDate(document.created_at)}
              </p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody className="gap-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <Icon icon="lucide:info" className="text-lg mr-2" />
                <span className="font-medium">Status & Processing</span>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Status:</span>
                  <Chip color={getStatusColor(document.status)} variant="flat" size="sm">
                    {document.status}
                  </Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Provider:</span>
                  <span className="text-sm font-medium">{document.provider || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Processing Time:</span>
                  <span className="text-sm font-medium">{document.processing_time || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Pages:</span>
                  <span className="text-sm font-medium">{document.pages_processed || 1}</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Icon icon="lucide:file-text" className="text-lg mr-2" />
                <span className="font-medium">File Information</span>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Size:</span>
                  <span className="text-sm font-medium">{formatFileSize(document.file_size)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Created:</span>
                  <span className="text-sm font-medium">
                    {document.created_at ? new Date(document.created_at).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">Updated:</span>
                  <span className="text-sm font-medium">
                    {document.updated_at ? new Date(document.updated_at).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Icon icon="lucide:trending-up" className="text-lg mr-2" />
                <span className="font-medium">Quality Metrics</span>
              </CardHeader>
              <CardBody className="space-y-3">
                {document.quality?.score ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-600">Overall Score:</span>
                      <Chip color={getQualityColor(document.quality.score)} variant="flat" size="sm">
                        {Math.round(document.quality.score * 100)}%
                      </Chip>
                    </div>
                    <Progress 
                      value={document.quality.score * 100} 
                      color={getQualityColor(document.quality.score)}
                      size="sm"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-600">Confidence:</span>
                      <span className="text-sm font-medium">{document.quality.confidence || 'Medium'}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-default-500">No quality data available</p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Bank & Account Information */}
          {document.meta && (
            <Card>
              <CardHeader className="pb-3">
                <Icon icon="lucide:building-2" className="text-lg mr-2" />
                <span className="font-medium">Bank Statement Information</span>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {document.meta.bank_name && (
                    <div>
                      <span className="text-sm text-default-600">Bank:</span>
                      <p className="font-medium">{document.meta.bank_name}</p>
                    </div>
                  )}
                  {document.meta.account_number && (
                    <div>
                      <span className="text-sm text-default-600">Account:</span>
                      <p className="font-medium">•••{document.meta.account_number.slice(-4)}</p>
                    </div>
                  )}
                  {document.meta.currency && (
                    <div>
                      <span className="text-sm text-default-600">Currency:</span>
                      <p className="font-medium">{document.meta.currency}</p>
                    </div>
                  )}
                  {document.meta.period && (
                    <div>
                      <span className="text-sm text-default-600">Period:</span>
                      <p className="font-medium">{document.meta.period}</p>
                    </div>
                  )}
                </div>
                
                {(document.meta.opening_balance !== undefined || document.meta.closing_balance !== undefined) && (
                  <>
                    <Divider className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {document.meta.opening_balance !== undefined && (
                        <div>
                          <span className="text-sm text-default-600">Opening Balance:</span>
                          <p className="font-medium text-lg">
                            {document.meta.currency} {document.meta.opening_balance.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {document.meta.closing_balance !== undefined && (
                        <div>
                          <span className="text-sm text-default-600">Closing Balance:</span>
                          <p className="font-medium text-lg">
                            {document.meta.currency} {document.meta.closing_balance.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          )}

          {/* Amount Sign Detection Data */}
          {document.amountSignData && (
            <Card>
              <CardHeader className="pb-3">
                <Icon icon="lucide:calculator" className="text-lg mr-2" />
                <span className="font-medium">Amount Sign Detection</span>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-default-600">Detection Method:</span>
                    <p className="font-medium">{document.amountSignData.sign_detection_method || 'Unknown'}</p>
                  </div>
                  {document.amountSignData.original_credit !== undefined && (
                    <div>
                      <span className="text-sm text-default-600">Original Credit:</span>
                      <p className="font-medium">{document.amountSignData.original_credit.toFixed(2)}</p>
                    </div>
                  )}
                  {document.amountSignData.original_debit !== undefined && (
                    <div>
                      <span className="text-sm text-default-600">Original Debit:</span>
                      <p className="font-medium">{document.amountSignData.original_debit.toFixed(2)}</p>
                    </div>
                  )}
                  {document.amountSignData.original_amount !== undefined && (
                    <div>
                      <span className="text-sm text-default-600">Original Amount:</span>
                      <p className="font-medium">{document.amountSignData.original_amount.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Quality Issues */}
          {document.quality?.issues && document.quality.issues.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <Icon icon="lucide:alert-triangle" className="text-lg mr-2 text-warning" />
                <span className="font-medium">Processing Issues</span>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {document.quality.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Icon icon="lucide:alert-circle" className="text-sm text-warning mt-0.5" />
                      <span className="text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Sample Transactions */}
          {sampleTransactions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <Icon icon="lucide:list" className="text-lg mr-2" />
                <span className="font-medium">Sample Transactions (First 10)</span>
              </CardHeader>
              <CardBody className="p-0">
                <Table aria-label="Sample transactions">
                  <TableHeader>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn>AMOUNT</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>CATEGORY</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {sampleTransactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <span className="text-sm">
                            {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm max-w-xs truncate block">
                            {transaction.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${
                            transaction.amount >= 0 ? 'text-success' : 'text-danger'
                          }`}>
                            {document.meta?.currency} {transaction.amount.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            color={transaction.type === 'credit' ? 'success' : 'danger'} 
                            variant="flat" 
                            size="sm"
                          >
                            {transaction.type}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {transaction.category || 'other'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button color="primary" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DocumentDetails;