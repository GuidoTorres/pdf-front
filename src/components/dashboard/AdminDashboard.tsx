import React, { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Divider,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useWebSocketStore } from "../../stores/useWebSocketStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { formatDateTime } from "../../utils/formatters";

const AdminDashboard: React.FC<{ systemMetrics?: any }> = ({ systemMetrics: metricsProp }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    systemMetrics,
    isConnected,
    subscribeToAdminEvents,
    unsubscribeFromAdminEvents,
  } = useWebSocketStore();

  const metrics = metricsProp || systemMetrics;
  const isAdmin = user?.isAdmin === true;

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

  if (!metrics) {
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
      case "processing":
        return "primary";
      case "idle":
        return "success";
      case "stalled":
      case "overloaded":
        return "warning";
      case "error":
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

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || Number.isNaN(seconds)) {
      return "—";
    }

    const totalSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }

    return `${minutes}m`;
  };

  const formatHeartbeat = (value?: number | string) => {
    if (!value && value !== 0) {
      return "—";
    }

    const date = new Date(typeof value === "number" ? value : value);
    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return formatDateTime(date.toISOString());
  };

  const performance = metrics.performance || {};
  const systemInfo = metrics.system || {};
  const totalJobsLastHour = performance.totalJobsLastHour ?? 0;
  const averageProcessingSeconds = performance.averageProcessingTime
    ? (performance.averageProcessingTime / 1000).toFixed(1)
    : "0.0";
  const successRate = performance.successRate ?? 0;
  const failureRate = Math.max(0, 100 - successRate);
  const totalWaitingJobs = performance.totalWaitingJobs ?? 0;
  const totalActiveJobs = performance.totalActiveJobs ?? 0;
  const connectedUsers = systemInfo.connectedUsers ?? 0;
  const connectedAdmins = systemInfo.connectedAdmins ?? 0;
  const activeWorkers = systemInfo.activeWorkers ?? metrics.workers?.length ?? 0;
  const systemUptime = formatDuration(systemInfo.uptime);

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

        <CardBody className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {totalJobsLastHour}
              </div>
              <div className="text-sm text-default-600">
                Procesados (últ. hora)
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {averageProcessingSeconds}s
              </div>
              <div className="text-sm text-default-600">Tiempo promedio</div>
            </div>

            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  failureRate > 10 ? "text-danger" : "text-success"
                }`}
              >
                {successRate.toFixed(1)}%
              </div>
              <div className="text-sm text-default-600">Tasa de éxito</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {totalWaitingJobs}
              </div>
              <div className="text-sm text-default-600">Trabajos en cola</div>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {totalActiveJobs}
              </div>
              <div className="text-sm text-default-600">Trabajos activos</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {activeWorkers}
              </div>
              <div className="text-sm text-default-600">Workers activos</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {connectedUsers}
              </div>
              <div className="text-sm text-default-600">
                Usuarios conectados
                <span className="block text-xs text-default-500">
                  Admins: {connectedAdmins}
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-default-900">
                {systemUptime}
              </div>
              <div className="text-sm text-default-600">Tiempo activo</div>
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
              {metrics.workers.length} Workers
            </Chip>
          </div>
        </CardHeader>

        <CardBody>
          {metrics.workers.length === 0 ? (
            <div className="text-sm text-default-500 text-center py-4">
              No hay métricas de workers disponibles.
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.workers.map((worker) => {
                const jobsInProgress =
                  typeof worker.jobsInProgress === "number"
                    ? worker.jobsInProgress
                    : worker.currentJob
                    ? 1
                    : 0;
                const jobsCompleted =
                  worker.jobsCompleted ?? worker.jobsCompletedHour ?? 0;
                const avgProcessing =
                  worker.avgProcessingTime ?? worker.lastProcessingTime ?? 0;
                const avgProcessingDisplay =
                  avgProcessing > 0
                    ? `${(avgProcessing / 1000).toFixed(1)}s`
                    : "—";
                const memoryMb =
                  typeof worker.memoryUsageMb === "number"
                    ? worker.memoryUsageMb
                    : undefined;
                const memoryBytes =
                  typeof worker.memoryUsage === "number"
                    ? worker.memoryUsage
                    : undefined;
                const memoryDisplay =
                  memoryMb !== undefined
                    ? `${Math.round(memoryMb)} MB`
                    : memoryBytes !== undefined
                    ? formatBytes(memoryBytes)
                    : "—";
                const rawCpu =
                  typeof worker.cpuUsagePercent === "number"
                    ? worker.cpuUsagePercent
                    : typeof worker.cpuUsage === "number"
                    ? worker.cpuUsage
                    : null;
                const cpuDisplay =
                  rawCpu === null
                    ? "—"
                    : `${(rawCpu <= 1 ? rawCpu * 100 : rawCpu).toFixed(1)}%`;
                const lastHeartbeat = worker.lastHeartbeat ?? worker.lastUpdated;
                const statusLabel = worker.status
                  ? worker.status.replace(/_/g, " ")
                  : "-";

                return (
                  <div
                    key={worker.workerId}
                    className="space-y-3 p-3 bg-content2/30 rounded-lg border border-divider"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          color={getWorkerStatusColor(worker.status)}
                          variant="flat"
                        >
                          {statusLabel}
                        </Chip>
                        <span className="text-sm font-medium">
                          Worker {worker.workerId.slice(-4)}
                        </span>
                        {worker.queueName && (
                          <Chip size="sm" color="secondary" variant="dot">
                            {worker.queueName}
                          </Chip>
                        )}
                      </div>
                      <span className="text-xs text-default-500">
                        Último latido: {formatHeartbeat(lastHeartbeat)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-default-600">
                      <div className="text-center">
                        <div className="font-medium text-default-900">
                          {jobsInProgress}
                        </div>
                        <div className="text-xs">Activos</div>
                      </div>

                      <div className="text-center">
                        <div className="font-medium text-default-900">
                          {jobsCompleted}
                        </div>
                        <div className="text-xs">Completados</div>
                        <div className="text-[10px] text-default-400">
                          Fallos: {worker.jobsFailed ?? 0}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="font-medium text-default-900">
                          {avgProcessingDisplay}
                        </div>
                        <div className="text-xs">Tiempo prom.</div>
                      </div>

                      <div className="text-center">
                        <div className="font-medium text-default-900">
                          {cpuDisplay}
                        </div>
                        <div className="text-xs">CPU</div>
                      </div>

                      <div className="text-center">
                        <div className="font-medium text-default-900">
                          {memoryDisplay}
                        </div>
                        <div className="text-xs">Memoria</div>
                      </div>
                    </div>

                    {worker.currentJob && (
                      <div className="text-xs text-default-500">
                        Trabajo actual: {worker.currentJob}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDashboard;
