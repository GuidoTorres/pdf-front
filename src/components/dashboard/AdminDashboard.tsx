import React, { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Progress,
  Chip,
  Divider,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useWebSocketStore } from "../../stores/useWebSocketStore";
import { useAuthStore } from "../../stores/useAuthStore";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    systemMetrics,
    isConnected,
    subscribeToAdminEvents,
    unsubscribeFromAdminEvents,
  } = useWebSocketStore();

  // Check if user is admin (you may need to adjust this based on your user model)
  const isAdmin = user?.plan === "admin" || user?.email?.includes("admin");

  useEffect(() => {
    if (isAdmin && isConnected) {
      subscribeToAdminEvents();
      return () => unsubscribeFromAdminEvents();
    }
  }, [
    isAdmin,
    isConnected,
    subscribeToAdminEvents,
    unsubscribeFromAdminEvents,
  ]);

  if (!isAdmin) {
    return null;
  }

  if (!systemMetrics) {
    return (
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:monitor-dashboard" className="text-lg" />
            <h3 className="text-lg font-semibold">System Metrics</h3>
            <Chip size="sm" color="secondary" variant="flat">
              Admin
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center text-default-500 py-4">
            <Icon icon="mdi:loading" className="text-2xl animate-spin mb-2" />
            <p>Loading system metrics...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const getWorkerStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "idle":
        return "primary";
      case "overloaded":
        return "warning";
      case "failed":
        return "danger";
      default:
        return "default";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (lastHeartbeat: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastHeartbeat.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) return `${minutes}m`;
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:monitor-dashboard" className="text-lg" />
              <h3 className="text-lg font-semibold">System Overview</h3>
              <Chip size="sm" color="secondary" variant="flat">
                Admin
              </Chip>
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
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {systemMetrics.performance.totalJobsProcessed}
              </div>
              <div className="text-sm text-default-600">Total Processed</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {Math.round(
                  systemMetrics.performance.averageProcessingTime / 1000
                )}
                s
              </div>
              <div className="text-sm text-default-600">Avg Time</div>
            </div>

            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  systemMetrics.performance.errorRate > 0.1
                    ? "text-danger"
                    : "text-success"
                }`}
              >
                {(systemMetrics.performance.errorRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-default-600">Error Rate</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {systemMetrics.performance.throughputPerHour}
              </div>
              <div className="text-sm text-default-600">Jobs/Hour</div>
            </div>
          </div>

          <Divider />

          {/* System Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">System Resources</h4>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm text-default-600">
                  {formatBytes(systemMetrics.system.totalMemoryUsage)}
                </span>
              </div>
              <Progress
                value={
                  (systemMetrics.system.totalMemoryUsage /
                    (2 * 1024 * 1024 * 1024)) *
                  100
                } // Assuming 2GB limit
                color={
                  systemMetrics.system.totalMemoryUsage >
                  1.5 * 1024 * 1024 * 1024
                    ? "danger"
                    : "success"
                }
                size="sm"
                showValueLabel
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">CPU Usage</span>
                <span className="text-sm text-default-600">
                  {systemMetrics.system.totalCpuUsage.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={systemMetrics.system.totalCpuUsage}
                color={
                  systemMetrics.system.totalCpuUsage > 80
                    ? "danger"
                    : systemMetrics.system.totalCpuUsage > 60
                    ? "warning"
                    : "success"
                }
                size="sm"
                showValueLabel
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">System Load</span>
                <span className="text-sm text-default-600">
                  {systemMetrics.system.systemLoad.toFixed(2)}
                </span>
              </div>
              <Progress
                value={Math.min(systemMetrics.system.systemLoad * 25, 100)} // Assuming load of 4 is 100%
                color={
                  systemMetrics.system.systemLoad > 3
                    ? "danger"
                    : systemMetrics.system.systemLoad > 2
                    ? "warning"
                    : "success"
                }
                size="sm"
                showValueLabel
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Worker Status */}
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:worker" className="text-lg" />
            <h3 className="text-lg font-semibold">Worker Status</h3>
            <Chip size="sm" color="primary" variant="flat">
              {systemMetrics.workers.length} Workers
            </Chip>
          </div>
        </CardHeader>

        <CardBody>
          <div className="space-y-3">
            {systemMetrics.workers.map((worker) => (
              <div
                key={worker.workerId}
                className="flex items-center justify-between p-3 bg-content2/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Chip
                    size="sm"
                    color={getWorkerStatusColor(worker.status)}
                    variant="flat"
                  >
                    {worker.status}
                  </Chip>
                  <span className="text-sm font-medium">
                    Worker {worker.workerId.slice(-4)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-default-600">
                  <div className="text-center">
                    <div className="font-medium">{worker.jobsInProgress}</div>
                    <div className="text-xs">Active</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium">
                      {worker.jobsCompletedHour}
                    </div>
                    <div className="text-xs">Completed/h</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium">
                      {Math.round(worker.avgProcessingTime / 1000)}s
                    </div>
                    <div className="text-xs">Avg Time</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium">
                      {formatBytes(worker.memoryUsage)}
                    </div>
                    <div className="text-xs">Memory</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium">
                      {worker.cpuUsage.toFixed(1)}%
                    </div>
                    <div className="text-xs">CPU</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium">
                      {formatUptime(worker.lastHeartbeat)}
                    </div>
                    <div className="text-xs">Uptime</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDashboard;
