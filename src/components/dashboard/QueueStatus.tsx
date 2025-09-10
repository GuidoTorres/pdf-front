import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Progress,
  Chip,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useWebSocketStore } from "../../stores/useWebSocketStore";

const QueueStatus: React.FC = () => {
  const { t } = useTranslation();
  const { queueStatus, isConnected } = useWebSocketStore();

  if (!queueStatus) {
    return (
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:queue-first-in-first-out" className="text-lg" />
            <h3 className="text-lg font-semibold">Queue Status</h3>
            {!isConnected && (
              <Chip size="sm" color="warning" variant="flat">
                <Icon icon="mdi:wifi-off" className="mr-1" />
                Offline
              </Chip>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center text-default-500 py-4">
            <Icon icon="mdi:loading" className="text-2xl animate-spin mb-2" />
            <p>Loading queue status...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const totalWaiting =
    queueStatus.premium.waiting +
    queueStatus.normal.waiting +
    queueStatus.large.waiting;
  const totalActive =
    queueStatus.premium.active +
    queueStatus.normal.active +
    queueStatus.large.active;
  const workerUtilization =
    queueStatus.totalWorkers > 0
      ? (queueStatus.activeWorkers / queueStatus.totalWorkers) * 100
      : 0;

  const getQueueColor = (waiting: number) => {
    if (waiting === 0) return "success";
    if (waiting < 10) return "primary";
    if (waiting < 25) return "warning";
    return "danger";
  };

  const formatTime = (minutes: number) => {
    if (minutes < 1) return "<1m";
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-divider">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:queue-first-in-first-out" className="text-lg" />
            <h3 className="text-lg font-semibold">Queue Status</h3>
          </div>

          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              color={isConnected ? "success" : "danger"}
              variant="flat"
            >
              <Icon
                icon={isConnected ? "mdi:wifi" : "mdi:wifi-off"}
                className="mr-1"
              />
              {isConnected ? "Live" : "Offline"}
            </Chip>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {totalWaiting}
            </div>
            <div className="text-sm text-default-600">Waiting</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{totalActive}</div>
            <div className="text-sm text-default-600">Processing</div>
          </div>
        </div>

        <Divider />

        {/* Worker Utilization */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Worker Utilization</span>
            <span className="text-sm text-default-600">
              {queueStatus.activeWorkers}/{queueStatus.totalWorkers}
            </span>
          </div>
          <Progress
            value={workerUtilization}
            color={
              workerUtilization > 80
                ? "danger"
                : workerUtilization > 60
                ? "warning"
                : "success"
            }
            size="sm"
            showValueLabel
          />
        </div>

        <Divider />

        {/* Queue Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Queue Details</h4>

          {/* Premium Queue */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:crown" className="text-warning" />
              <span className="text-sm">Premium</span>
            </div>
            <div className="flex items-center gap-3">
              <Chip
                size="sm"
                color={getQueueColor(queueStatus.premium.waiting)}
                variant="flat"
              >
                {queueStatus.premium.waiting} waiting
              </Chip>
              <span className="text-xs text-default-600">
                ~{formatTime(queueStatus.premium.avgWaitTime)}
              </span>
            </div>
          </div>

          {/* Normal Queue */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:account" className="text-primary" />
              <span className="text-sm">Normal</span>
            </div>
            <div className="flex items-center gap-3">
              <Chip
                size="sm"
                color={getQueueColor(queueStatus.normal.waiting)}
                variant="flat"
              >
                {queueStatus.normal.waiting} waiting
              </Chip>
              <span className="text-xs text-default-600">
                ~{formatTime(queueStatus.normal.avgWaitTime)}
              </span>
            </div>
          </div>

          {/* Large Files Queue */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon
                icon="mdi:file-document-multiple"
                className="text-secondary"
              />
              <span className="text-sm">Large Files</span>
            </div>
            <div className="flex items-center gap-3">
              <Chip
                size="sm"
                color={getQueueColor(queueStatus.large.waiting)}
                variant="flat"
              >
                {queueStatus.large.waiting} waiting
              </Chip>
              <span className="text-xs text-default-600">
                ~{formatTime(queueStatus.large.avgWaitTime)}
              </span>
            </div>
          </div>
        </div>

        {/* System Status Indicator */}
        {totalWaiting > 50 && (
          <>
            <Divider />
            <div className="flex items-center gap-2 text-warning text-sm">
              <Icon icon="mdi:alert-outline" />
              <span>
                High queue volume detected. Consider upgrading for priority
                processing.
              </span>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default QueueStatus;
