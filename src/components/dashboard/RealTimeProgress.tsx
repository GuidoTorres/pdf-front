import React from "react";
import { Card, CardBody, Progress, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useWebSocketStore } from "../../stores/useWebSocketStore";
import { DocumentWithStatus } from "../../stores/useDocumentStore";

interface RealTimeProgressProps {
  document: DocumentWithStatus;
}

const RealTimeProgress: React.FC<RealTimeProgressProps> = ({ document }) => {
  const { t } = useTranslation();
  const { jobProgress, queueStatus, isConnected } = useWebSocketStore();

  const progress = document.jobId ? jobProgress[document.jobId] : null;
  const isProcessing = document.status === "processing";

  if (!isProcessing || !document.jobId) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "queued":
        return "warning";
      case "started":
        return "primary";
      case "progress":
        return "primary";
      case "completed":
        return "success";
      case "failed":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "queued":
        return "mdi:clock-outline";
      case "started":
        return "mdi:play-circle-outline";
      case "progress":
        return "mdi:progress-clock";
      case "completed":
        return "mdi:check-circle-outline";
      case "failed":
        return "mdi:alert-circle-outline";
      default:
        return "mdi:help-circle-outline";
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getQueueInfo = () => {
    if (!queueStatus || !progress) return null;

    // Determine which queue this job is in based on user plan or file size
    // This would need to be determined from the backend or job metadata
    const queueType = "normal"; // Default assumption
    const queue = queueStatus[queueType as keyof typeof queueStatus];

    if (typeof queue === "object" && "waiting" in queue) {
      return {
        position: progress.queuePosition || queue.waiting,
        avgWaitTime: queue.avgWaitTime,
        totalWaiting: queue.waiting,
      };
    }

    return null;
  };

  const queueInfo = getQueueInfo();

  return (
    <Card className="bg-content2/50 border border-divider">
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon
              icon={getStatusIcon(progress?.status || "queued")}
              className="text-lg"
            />
            <span className="font-medium text-sm">{document.fileName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              color={getStatusColor(progress?.status || "queued")}
              variant="flat"
            >
              {progress?.status || "queued"}
            </Chip>

            {!isConnected && (
              <Chip size="sm" color="warning" variant="flat">
                <Icon icon="mdi:wifi-off" className="mr-1" />
                Offline
              </Chip>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {progress?.progress !== undefined && (
          <div className="mb-3">
            <Progress
              value={progress.progress}
              color={getStatusColor(progress.status)}
              size="sm"
              showValueLabel
              className="mb-2"
            />
            <p className="text-xs text-default-600">
              {progress.step || "Processing..."}
            </p>
          </div>
        )}

        {/* Queue Information */}
        {progress?.status === "queued" && queueInfo && (
          <>
            <Divider className="my-3" />
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-default-600">Queue Position:</span>
                <span className="font-medium">#{queueInfo.position}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-default-600">Estimated Wait:</span>
                <span className="font-medium">
                  {formatTime(queueInfo.avgWaitTime * 60)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-default-600">Total in Queue:</span>
                <span className="font-medium">{queueInfo.totalWaiting}</span>
              </div>
            </div>
          </>
        )}

        {/* Processing Information */}
        {progress?.status === "started" && progress.estimatedTime && (
          <>
            <Divider className="my-3" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-default-600">Estimated Time:</span>
              <span className="font-medium">
                {formatTime(progress.estimatedTime)}
              </span>
            </div>
          </>
        )}

        {/* Error Information */}
        {progress?.status === "failed" && progress.error && (
          <>
            <Divider className="my-3" />
            <div className="text-sm text-danger">
              <Icon icon="mdi:alert-circle-outline" className="inline mr-1" />
              {progress.error}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default RealTimeProgress;
