import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Button,
  Tooltip,
  Divider,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import {
  DocumentStructure,
  FlexibleTransaction,
} from "../../types/transaction";

interface ExtractionMetadataPanelProps {
  documentStructure?: DocumentStructure;
  transactions: FlexibleTransaction[];
  className?: string;
  isCollapsible?: boolean;
}

const ExtractionMetadataPanel: React.FC<ExtractionMetadataPanelProps> = ({
  documentStructure,
  transactions,
  className = "",
  isCollapsible = true,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate metadata from transactions
  const metadata = React.useMemo(() => {
    const totalTransactions = transactions.length;
    const transactionsWithOriginalData = transactions.filter(
      (tx) => tx.originalData && Object.keys(tx.originalData).length > 0
    ).length;

    const averageConfidence =
      transactions.reduce((sum, tx) => {
        return sum + (tx.transformationMetadata?.confidence || 0);
      }, 0) / totalTransactions;

    const preservationRate =
      totalTransactions > 0
        ? (transactionsWithOriginalData / totalTransactions) * 100
        : 0;

    const extractionMethods = transactions.reduce((methods, tx) => {
      const method = tx.sign_detection_method || "unknown";
      methods[method] = (methods[method] || 0) + 1;
      return methods;
    }, {} as Record<string, number>);

    return {
      totalTransactions,
      transactionsWithOriginalData,
      averageConfidence,
      preservationRate,
      extractionMethods,
    };
  }, [transactions]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "success";
    if (confidence >= 0.6) return "warning";
    return "danger";
  };

  const getPreservationColor = (rate: number) => {
    if (rate >= 90) return "success";
    if (rate >= 70) return "warning";
    return "danger";
  };

  const content = (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {metadata.totalTransactions}
          </div>
          <div className="text-xs text-default-500">Total Transactions</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-success">
            {Math.round(metadata.averageConfidence * 100)}%
          </div>
          <div className="text-xs text-default-500">Avg Confidence</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-secondary">
            {documentStructure?.columnMetadata?.originalColumnNames?.length ||
              0}
          </div>
          <div className="text-xs text-default-500">Original Columns</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-warning">
            {Math.round(metadata.preservationRate)}%
          </div>
          <div className="text-xs text-default-500">Data Preserved</div>
        </div>
      </div>

      <Divider />

      {/* Confidence and Preservation Metrics */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Extraction Confidence</span>
            <Chip
              size="sm"
              color={getConfidenceColor(metadata.averageConfidence)}
              variant="flat"
            >
              {Math.round(metadata.averageConfidence * 100)}%
            </Chip>
          </div>
          <Progress
            value={metadata.averageConfidence * 100}
            color={getConfidenceColor(metadata.averageConfidence)}
            size="sm"
            showValueLabel={false}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Data Preservation</span>
            <Chip
              size="sm"
              color={getPreservationColor(metadata.preservationRate)}
              variant="flat"
            >
              {Math.round(metadata.preservationRate)}%
            </Chip>
          </div>
          <Progress
            value={metadata.preservationRate}
            color={getPreservationColor(metadata.preservationRate)}
            size="sm"
            showValueLabel={false}
          />
        </div>
      </div>

      {/* Document Structure Info */}
      {documentStructure && (
        <>
          <Divider />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Icon icon="lucide:file-text" className="text-sm" />
              Document Structure
            </h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-default-500">Extraction Method:</span>
                <div className="font-medium">
                  {documentStructure.extractionMethod || "Standard"}
                </div>
              </div>

              <div>
                <span className="text-default-500">Structure Confidence:</span>
                <div className="font-medium">
                  {documentStructure.confidence
                    ? `${Math.round(documentStructure.confidence * 100)}%`
                    : "N/A"}
                </div>
              </div>
            </div>

            {/* Original Column Names */}
            {documentStructure.columnMetadata?.originalColumnNames && (
              <div>
                <span className="text-sm text-default-500 mb-2 block">
                  Original Columns (
                  {documentStructure.columnMetadata.originalColumnNames.length}
                  ):
                </span>
                <div className="flex flex-wrap gap-1">
                  {documentStructure.columnMetadata.originalColumnNames.map(
                    (column, index) => (
                      <Chip
                        key={index}
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="text-xs"
                      >
                        {column}
                      </Chip>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Extraction Methods Breakdown */}
      {Object.keys(metadata.extractionMethods).length > 0 && (
        <>
          <Divider />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Icon icon="lucide:cpu" className="text-sm" />
              Extraction Methods
            </h4>

            <div className="space-y-2">
              {Object.entries(metadata.extractionMethods).map(
                ([method, count]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          method === "columns"
                            ? "bg-success"
                            : method === "heuristics"
                            ? "bg-warning"
                            : method === "hybrid"
                            ? "bg-primary"
                            : "bg-default"
                        }`}
                      />
                      <span className="text-sm capitalize">{method}</span>
                    </div>
                    <Chip size="sm" variant="flat">
                      {count}
                    </Chip>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* Column Mapping Details */}
      {documentStructure?.columnMetadata && (
        <Accordion variant="light" className="px-0">
          <AccordionItem
            key="column-mappings"
            aria-label="Column Mappings"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:arrow-right-left" className="text-sm" />
                <span className="text-sm font-medium">Column Mappings</span>
              </div>
            }
          >
            <div className="space-y-2">
              {documentStructure.columnMetadata.originalColumnNames.map(
                (original, index) => {
                  const normalized =
                    documentStructure.columnMetadata?.normalizedColumnNames[
                      index
                    ];
                  const type =
                    documentStructure.columnMetadata?.columnTypes[index];

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-default-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Chip size="sm" variant="flat" color="primary">
                          {original}
                        </Chip>
                        <Icon
                          icon="lucide:arrow-right"
                          className="text-xs text-default-400"
                        />
                        <Chip size="sm" variant="flat" color="secondary">
                          {normalized}
                        </Chip>
                      </div>
                      {type && (
                        <Chip size="sm" variant="dot" color="default">
                          {type}
                        </Chip>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );

  if (isCollapsible) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:info" className="text-primary" />
              <h3 className="text-sm font-semibold">Extraction Metadata</h3>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon
                icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"}
                className="text-sm"
              />
            </Button>
          </div>
        </CardHeader>
        {isExpanded && <CardBody className="pt-0">{content}</CardBody>}
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="lucide:info" className="text-primary" />
          <h3 className="text-sm font-semibold">Extraction Metadata</h3>
        </div>
      </CardHeader>
      <CardBody>{content}</CardBody>
    </Card>
  );
};

export default ExtractionMetadataPanel;
