import React from "react";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { DocumentWithStatus } from "../../stores/useDocumentStore";
import { BankDetectionService } from "../../services/bankDetection";

interface BankDetectionInfoProps {
  currentDocument: DocumentWithStatus;
}

const BankDetectionInfo: React.FC<BankDetectionInfoProps> = ({
  currentDocument,
}) => {
  if (!currentDocument?.bankDetection) {
    return null;
  }

  const { bankDetection } = currentDocument;

  return (
    <div className="mb-3 p-3 bg-default-100/50 rounded-lg border border-default-200">
      <div className="flex items-center gap-3">
        <Icon icon="lucide:building-2" className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-semibold text-sm">
            {bankDetection.bankInfo.bankName}
          </h3>
          {bankDetection.bankInfo.currency && (
            <p className="text-xs text-default-500">
              {bankDetection.bankInfo.currency} • {bankDetection.bankInfo.statementPeriod || 'Statement'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankDetectionInfo;
