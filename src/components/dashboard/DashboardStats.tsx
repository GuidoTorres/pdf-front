import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { DocumentWithStatus } from "../../stores/useDocumentStore";

interface User {
  name?: string;
  pages_remaining?: number;
  plan?: string;
  subscription?: {
    plan: string;
    pages_remaining: number;
    expires_at?: string;
    renewed_at?: string;
    next_reset?: string;
    total_pages_used?: number;
    pages_used_this_month?: number;
  };
}

interface DashboardStatsProps {
  user: User | null;
  documents: DocumentWithStatus[];
  currentDocument: DocumentWithStatus | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  user,
  documents,
  currentDocument,
}) => {
  const { t } = useTranslation();

  // Simple calculations only
  const pagesRemaining =
    user?.subscription?.pages_remaining || user?.pages_remaining || 0;
  const currentPlan = user?.subscription?.plan || user?.plan || "free";
  const isUnlimited = currentPlan === "unlimited" || pagesRemaining >= 999999;
  const completedDocs =
    documents?.filter((d) => d.status === "completed").length || 0;
  const processingDocs =
    documents?.filter((d) => d.status === "processing").length || 0;

  // Calculate total pages used from completed documents
  const totalPagesUsed =
    documents?.reduce((total, doc) => {
      if (doc.status === "completed" && doc.pages_processed) {
        return total + doc.pages_processed;
      }
      return total + (doc.status === "completed" ? 1 : 0); // Default to 1 page if not specified
    }, 0) || 0;

  // Get plan limits
  const planLimits = {
    free: 10,
    starter: 400,
    pro: 1000,
    business: 2000,
  };
  const planLimit = planLimits[currentPlan as keyof typeof planLimits] || 10;
  const usagePercentage = Math.round(
    ((planLimit - pagesRemaining) / planLimit) * 100
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Pages Remaining */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-200 rounded-lg">
              <Icon icon="lucide:file-text" className="text-primary text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-primary-600">
                {t("dashboard.pagesRemaining")}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-primary">
                  {isUnlimited ? "∞" : pagesRemaining}
                </p>
                {!isUnlimited && (
                  <p className="text-sm text-primary-500">/ {planLimit}</p>
                )}
                {isUnlimited && (
                  <p className="text-sm text-primary-500">Unlimited</p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-primary-600 capitalize">
                  {currentPlan} {t("dashboard.plan")}
                </p>
                {usagePercentage > 80 && (
                  <span className="text-xs bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full">
                    {usagePercentage}% used
                  </span>
                )}
              </div>
              {/* Progress bar */}
              <div className="w-full bg-primary-200 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    usagePercentage > 90
                      ? "bg-danger"
                      : usagePercentage > 80
                      ? "bg-warning"
                      : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Documents Completed */}
      <Card className="bg-gradient-to-br from-success-50 to-success-100 border border-success-200">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-200 rounded-lg">
              <Icon
                icon="lucide:check-circle"
                className="text-success text-xl"
              />
            </div>
            <div>
              <p className="text-sm text-success-600">
                {t("dashboard.documentsProcessed")}
              </p>
              <p className="text-2xl font-bold text-success">{completedDocs}</p>
              <p className="text-xs text-success-600">
                {t("dashboard.documents")}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Processing */}
      <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border border-warning-200">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-200 rounded-lg">
              <Icon icon="lucide:clock" className="text-warning text-xl" />
            </div>
            <div>
              <p className="text-sm text-warning-600">
                {t("dashboard.stats.processing")}
              </p>
              <p className="text-2xl font-bold text-warning">
                {processingDocs}
              </p>
              <p className="text-xs text-warning-600">
                {t("dashboard.stats.inQueue")}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Current Document */}
      <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-200 rounded-lg">
              <Icon icon="lucide:receipt" className="text-secondary text-xl" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">
                {t("dashboard.transactions")}
              </p>
              <p className="text-2xl font-bold text-secondary">
                {currentDocument?.transactions?.length || 0}
              </p>
              <p className="text-xs text-secondary-600">
                {t("dashboard.currentDoc")}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DashboardStats;
