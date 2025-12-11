import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/useAuthStore";
import { useWebSocketStore } from "../stores/useWebSocketStore";
import { AdminDashboard } from "../components/dashboard";
import AdminRoute from "../components/AdminRoute";
import { apiService } from "../services/api";
import { formatMs, formatDateTime } from "../utils/formatters";

type JobTimingEntry = {
  jobId: string;
  timings: {
    enqueuedAt?: number;
    workerStartedAt?: number;
    pythonStartAt?: number;
    firstProgressAt?: number;
    pythonCompletedAt?: number;
    completedAt?: number;
    failedAt?: number;
  };
  loggedAt: string;
};

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [timingMetrics, setTimingMetrics] = useState<JobTimingEntry[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [metricsFilter, setMetricsFilter] = useState<"all" | "completed" | "failed">("all");
  const {
    systemMetrics,
    isConnected,
    subscribeToAdminEvents,
    unsubscribeFromAdminEvents,
    setSystemMetrics,
  } = useWebSocketStore();
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Check if user is admin
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

  useEffect(() => {
    if (!isAdmin) return;

    const controller = new AbortController();

    const loadSystemMetrics = async () => {
      try {
        const response = await fetch(`${apiService.baseUrl}/admin/system/health`, {
          headers: apiService.getAuthHeaders(),
          signal: controller.signal,
        });
        const data = await response.json();
        if (response.ok && data.success) {
          const metrics = data.data?.metrics || data.data;
          setSystemMetrics(metrics || null);
        }
      } catch (error) {
        if ((error as any).name !== "AbortError") {
          console.error("Error loading system metrics:", error);
        }
      }
    };

    loadSystemMetrics();
    const interval = setInterval(loadSystemMetrics, 15000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [isAdmin, setSystemMetrics]);

  useEffect(() => {
    if (!isAdmin) return;

    const controller = new AbortController();

    const loadDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const response = await fetch(`${apiService.baseUrl}/admin/dashboard`, {
          headers: apiService.getAuthHeaders(),
          signal: controller.signal,
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setDashboardData(data.data);
        } else {
          setDashboardError(data.error || "Error al obtener el resumen");
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setDashboardError(error.message || "Error al cargar el resumen");
        }
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboard();
    const interval = setInterval(loadDashboard, 60000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [isAdmin]);

  useEffect(() => {
    const controller = new AbortController();

    const loadMetrics = async () => {
      setMetricsLoading(true);
      setMetricsError(null);
      try {
        const response = await fetch(
          `${apiService.baseUrl}/admin/system/metrics-processing`,
          {
            headers: apiService.getAuthHeaders(),
            signal: controller.signal,
          }
        );
        const data = await response.json();
        if (response.ok && data.success) {
          setTimingMetrics(data.data || []);
        } else {
          setMetricsError(data.error || "Error al obtener métricas");
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setMetricsError(error.message || "Error al cargar métricas");
        }
      } finally {
        setMetricsLoading(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 15000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const filteredMetrics: JobTimingEntry[] = useMemo(() => {
    if (metricsFilter === "all") return timingMetrics;
    return timingMetrics.filter((entry: JobTimingEntry) => {
      const hasFailed = !!entry.timings.failedAt;
      const hasCompleted = !!entry.timings.completedAt && !hasFailed;
      return metricsFilter === "completed" ? hasCompleted : hasFailed;
    });
  }, [timingMetrics, metricsFilter]);

  const restartWorkers = async () => {
    try {
      // TODO: Implement restart workers API call
      console.log("Restarting workers...");
    } catch (error) {
      console.error("Error restarting workers:", error);
    }
  };

  const clearCache = async () => {
    try {
      // TODO: Implement clear cache API call
      console.log("Clearing cache...");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  return (
    <AdminRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Icon icon="mdi:shield-crown" className="text-warning" />
              Panel de Administración
            </h1>
            <p className="text-default-600">
              Monitoreo y control del sistema de procesamiento
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="mdi:refresh" />}
              onPress={() => window.location.reload()}
            >
              Actualizar
            </Button>

            <Button
              color="warning"
              variant="flat"
              startContent={<Icon icon="mdi:restart" />}
              onPress={restartWorkers}
            >
              Reiniciar Workers
            </Button>

            <Button
              color="secondary"
              variant="flat"
              startContent={<Icon icon="mdi:delete-sweep" />}
              onPress={clearCache}
            >
              Limpiar Cache
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon
                  icon={isConnected ? "mdi:wifi" : "mdi:wifi-off"}
                  className={`text-lg ${
                    isConnected ? "text-success" : "text-danger"
                  }`}
                />
                <span className="font-medium">
                  Estado de Conexión:{" "}
                  {isConnected ? "Conectado" : "Desconectado"}
                </span>
              </div>

              {systemMetrics && (
                <div className="flex items-center gap-4 text-sm text-default-600">
                  <span>
                    Última actualización: {new Date().toLocaleTimeString()}
                  </span>
                  <span>
                    Workers activos: {systemMetrics.system?.activeWorkers ?? systemMetrics.workers?.length ?? 0}
                  </span>
                  <span>
                    Trabajos (últ. hora): {systemMetrics.performance?.totalJobsLastHour ?? 0}
                  </span>
                  <span>
                    Éxito: {systemMetrics.performance?.successRate?.toFixed(1) ?? "0.0"}%
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Navigation Tabs */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          variant="underlined"
          classNames={{
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary",
          }}
        >
          <Tab
            key="overview"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:view-dashboard" />
                <span>Resumen General</span>
              </div>
            }
          />

          <Tab
            key="workers"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:worker" />
                <span>Workers</span>
              </div>
            }
          />

          <Tab
            key="queues"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:format-list-bulleted" />
                <span>Colas</span>
              </div>
            }
          />

          <Tab
            key="performance"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:chart-line" />
                <span>Rendimiento</span>
              </div>
            }
          />

          <Tab
            key="users"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:account-group" />
                <span>Usuarios</span>
              </div>
            }
          />

          <Tab
            key="logs"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:text-box-multiple" />
                <span>Logs</span>
              </div>
            }
          />
        </Tabs>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === "overview" && (
            <OverviewTab
              dashboard={dashboardData}
              systemMetrics={systemMetrics}
              loading={dashboardLoading}
              error={dashboardError}
            />
          )}
          {activeTab === "workers" && (
            <WorkersTab systemMetrics={systemMetrics} />
          )}
          {activeTab === "queues" && <QueuesTab systemMetrics={systemMetrics} />}
          {activeTab === "performance" && (
            <PerformanceTab
              systemMetrics={systemMetrics}
              metrics={filteredMetrics}
              metricsFilter={metricsFilter}
              onFilterChange={setMetricsFilter}
              metricsLoading={metricsLoading}
              metricsError={metricsError}
            />
          )}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "logs" && <LogsTab />}
        </div>
      </div>
    </AdminRoute>
  );
};

// Tab Components
const OverviewTab: React.FC<{
  dashboard: any;
  systemMetrics: any;
  loading: boolean;
  error: string | null;
}> = ({ dashboard, systemMetrics, loading, error }) => {
  if (loading) {
    return (
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardBody>
          <div className="text-center text-default-500 py-8">
            <Icon icon="mdi:loading" className="text-4xl animate-spin mb-4" />
            <p>Cargando resumen...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardBody>
          <div className="text-center text-danger py-8">
            <Icon icon="mdi:alert" className="text-3xl mb-4" />
            <p>{error}</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!dashboard) {
    return null;
  }

  const formatBytesValue = (bytes?: number) => {
    if (bytes === undefined) return "—";
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
      units.length - 1,
      Math.floor(Math.log(bytes) / Math.log(1024))
    );
    const value = bytes / Math.pow(1024, index);
    return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[index]}`;
  };

  const formatUptimeValue = (seconds?: number) => {
    if (!seconds && seconds !== 0) return "—";
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const systemSummary = dashboard.system;
  const systemSummaryMetrics = systemSummary?.metrics;
  const systemPerformance = systemSummaryMetrics?.performance;
  const systemInfo = systemSummaryMetrics?.system;
  const uptimeLabel = formatUptimeValue(
    systemSummary?.uptime ?? systemInfo?.uptime
  );
  const connectedUsers =
    systemSummary?.connectedUsers ?? systemInfo?.connectedUsers ?? 0;
  const connectedAdmins = systemInfo?.connectedAdmins ?? 0;
  const activeWorkers =
    systemInfo?.activeWorkers ?? systemSummaryMetrics?.workers?.length ?? 0;
  const waitingJobs = systemPerformance?.totalWaitingJobs ?? 0;
  const successRate = systemPerformance?.successRate ?? 0;
  const lastCheck = systemSummary?.lastCheck;
  const memoryUsedLabel = formatBytesValue(systemSummary?.memory?.heapUsed);
  const memoryTotalLabel = formatBytesValue(systemSummary?.memory?.heapTotal);
  const lastDashboardUpdate = dashboard.lastUpdated;

  return (
    <div className="space-y-6">
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader>
          <h3 className="text-lg font-semibold">Resumen General</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Usuarios totales"
              value={dashboard.users.total}
              subtitle={`30d: ${dashboard.users.new30Days} • 7d: ${dashboard.users.new7Days} • Hoy: ${dashboard.users.newToday} • Crecimiento: ${dashboard.users.growthRate}%`}
              icon="mdi:account-group"
            />
            <StatCard
              title="Documentos procesados"
              value={dashboard.documents.total}
              subtitle={`30d: ${dashboard.documents.processed30Days} • 7d: ${dashboard.documents.processed7Days} • Hoy: ${dashboard.documents.processedToday} • Crecimiento: ${dashboard.documents.growthRate}%`}
              icon="mdi:file-chart"
            />
            <StatCard
              title="Planes activos"
              value={dashboard.subscriptions.active}
              subtitle={`Gratis: ${dashboard.subscriptions.free} • Conversión: ${dashboard.subscriptions.conversionRate}%`}
              icon="mdi:credit-card"
            />
            <StatCard
              title="Ingresos totales"
              value={`$${Number(dashboard.revenue.total).toFixed(2)}`}
              subtitle={`Mensual: $${Number(dashboard.revenue.monthly).toFixed(2)} • Promedio usuario: $${Number(dashboard.revenue.averagePerUser ?? 0).toFixed(2)}`}
              icon="mdi:currency-usd"
            />
          </div>
        </CardBody>
      </Card>

      {systemSummary && (
        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Salud del Sistema</h3>
              {lastDashboardUpdate && (
                <p className="text-sm text-default-500">
                  Resumen actualizado: {formatDateTime(lastDashboardUpdate)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {systemSummary.dashboardActive !== undefined && (
                <Chip
                  size="sm"
                  color={systemSummary.dashboardActive ? "success" : "warning"}
                  variant="flat"
                >
                  {systemSummary.dashboardActive
                    ? "Monitoreo activo"
                    : "Monitoreo pausado"}
                </Chip>
              )}
              {systemSummary.status && (
                <Chip
                  size="sm"
                  color={systemSummary.status === "healthy" ? "success" : "danger"}
                  variant="flat"
                >
                  {systemSummary.status === "healthy"
                    ? "Estable"
                    : systemSummary.status}
                </Chip>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-default-600">
              <div>
                <div className="text-xs uppercase tracking-wide text-default-400">
                  Tiempo activo
                </div>
                <div className="text-lg font-semibold text-default-900">
                  {uptimeLabel}
                </div>
                {lastCheck && (
                  <div className="text-[11px] text-default-400">
                    Último chequeo: {formatDateTime(lastCheck)}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-default-400">
                  Usuarios conectados
                </div>
                <div className="text-lg font-semibold text-default-900">
                  {connectedUsers}
                </div>
                <div className="text-[11px] text-default-400">
                  Admins: {connectedAdmins}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-default-400">
                  Workers activos
                </div>
                <div className="text-lg font-semibold text-default-900">
                  {activeWorkers}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-default-400">
                  Trabajos en cola
                </div>
                <div className="text-lg font-semibold text-default-900">
                  {waitingJobs}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-default-400">
                  Tasa de éxito
                </div>
                <div className={`text-lg font-semibold ${successRate < 80 ? "text-danger" : "text-success"}`}>
                  {successRate.toFixed(1)}%
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-default-400">
                  Memoria (heap)
                </div>
                <div className="text-lg font-semibold text-default-900">
                  {memoryUsedLabel}
                </div>
                <div className="text-[11px] text-default-400">
                  Total: {memoryTotalLabel}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <AdminDashboard systemMetrics={systemMetrics} />
    </div>
  );
};

const WorkersTab: React.FC<{ systemMetrics: any }> = ({ systemMetrics }) => {
  const formatBytesLocal = (bytes: number) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
      units.length - 1,
      Math.floor(Math.log(bytes) / Math.log(1024))
    );
    const value = bytes / Math.pow(1024, index);
    return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[index]}`;
  };

  if (!systemMetrics) {
    return (
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardBody>
          <div className="text-center text-default-500 py-8">
            <Icon icon="mdi:loading" className="text-4xl animate-spin mb-4" />
            <p>Cargando información de workers...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const workers: any[] = Array.isArray(systemMetrics.workers)
    ? systemMetrics.workers
    : [];

  const statusSummary = workers.reduce(
    (acc, worker) => {
      const status = worker.status;
      if (status === "processing" || status === "active") {
        acc.processing += 1;
      } else if (status === "idle") {
        acc.idle += 1;
      } else if (status === "stalled") {
        acc.stalled += 1;
      } else if (status === "error" || status === "failed") {
        acc.error += 1;
      } else {
        acc.other += 1;
      }
      return acc;
    },
    { processing: 0, idle: 0, stalled: 0, error: 0, other: 0 }
  );

  const incidents = statusSummary.error + statusSummary.stalled;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
      case "active":
        return "bg-primary";
      case "idle":
        return "bg-success";
      case "stalled":
        return "bg-warning";
      case "error":
      case "failed":
        return "bg-danger";
      default:
        return "bg-default";
    }
  };

  const getJobsInProgress = (worker: any) => {
    if (typeof worker.jobsInProgress === "number") {
      return worker.jobsInProgress;
    }
    return worker.currentJob ? 1 : 0;
  };

  const getJobsCompleted = (worker: any) =>
    worker.jobsCompleted ?? worker.jobsCompletedHour ?? 0;

  const getAvgProcessing = (worker: any) => {
    const value = worker.avgProcessingTime ?? worker.lastProcessingTime;
    if (!value) return "—";
    return `${(value / 1000).toFixed(1)}s`;
  };

  const getCpuDisplay = (worker: any) => {
    const raw =
      typeof worker.cpuUsagePercent === "number"
        ? worker.cpuUsagePercent
        : typeof worker.cpuUsage === "number"
        ? worker.cpuUsage
        : null;
    if (raw === null) return "—";
    const value = raw <= 1 ? raw * 100 : raw;
    return `${value.toFixed(1)}%`;
  };

  const getMemoryDisplay = (worker: any) => {
    if (typeof worker.memoryUsageMb === "number") {
      return `${Math.round(worker.memoryUsageMb)} MB`;
    }
    if (typeof worker.memoryUsage === "number") {
      return formatBytesLocal(worker.memoryUsage);
    }
    return "—";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-primary">{workers.length}</div>
            <div className="text-sm text-default-600">Workers totales</div>
          </CardBody>
        </Card>

        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-success">
              {statusSummary.processing}
            </div>
            <div className="text-sm text-default-600">En proceso</div>
          </CardBody>
        </Card>

        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-warning">
              {statusSummary.idle}
            </div>
            <div className="text-sm text-default-600">En espera</div>
          </CardBody>
        </Card>

        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-danger">{incidents}</div>
            <div className="text-sm text-default-600">Incidencias</div>
          </CardBody>
        </Card>
      </div>

      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader>
          <h3 className="text-lg font-semibold">Detalle de Workers</h3>
        </CardHeader>
        <CardBody>
          {workers.length === 0 ? (
            <div className="text-center text-default-500 text-sm py-4">
              No hay workers registrados en este momento.
            </div>
          ) : (
            <div className="space-y-3">
              {workers.map((worker) => (
                <div
                  key={worker.workerId}
                  className="space-y-3 p-4 bg-content2/30 rounded-lg border border-divider"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full ${getStatusColor(worker.status)}`}
                      />
                      <span className="font-medium">
                        Worker {worker.workerId.slice(-8)}
                      </span>
                      {worker.queueName && (
                        <Chip size="sm" color="secondary" variant="dot">
                          {worker.queueName}
                        </Chip>
                      )}
                    </div>
                    <span className="text-xs text-default-500">
                      Último latido: {formatHeartbeat(worker.lastHeartbeat ?? worker.lastUpdated)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-default-600">
                    <div className="text-center">
                      <div className="font-medium text-default-900">
                        {getJobsInProgress(worker)}
                      </div>
                      <div className="text-xs">Activos</div>
                    </div>

                    <div className="text-center">
                      <div className="font-medium text-default-900">
                        {getJobsCompleted(worker)}
                      </div>
                      <div className="text-xs">Completados</div>
                      <div className="text-[10px] text-default-400">
                        Fallos: {worker.jobsFailed ?? 0}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="font-medium text-default-900">
                        {getAvgProcessing(worker)}
                      </div>
                      <div className="text-xs">Tiempo prom.</div>
                    </div>

                    <div className="text-center">
                      <div className="font-medium text-default-900">
                        {getCpuDisplay(worker)}
                      </div>
                      <div className="text-xs">CPU</div>
                    </div>

                    <div className="text-center">
                      <div className="font-medium text-default-900">
                        {getMemoryDisplay(worker)}
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
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const QueuesTab: React.FC<{ systemMetrics: any }> = ({ systemMetrics }) => {
  const queues = systemMetrics?.queues || {};
  const queueEntries = Object.entries(queues);

  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-divider">
      <CardHeader>
        <h3 className="text-lg font-semibold">Estado de las Colas</h3>
      </CardHeader>
      <CardBody>
        {queueEntries.length === 0 ? (
          <div className="text-center text-default-500 py-8">
            <Icon icon="mdi:format-list-bulleted" className="text-4xl mb-4" />
            <p>No hay datos de colas disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {queueEntries.map(([queueName, stats]: any) => (
              <Card key={queueName} className="bg-content2/40 border border-divider">
                <CardBody className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize">{queueName}</span>
                    <Chip size="sm" color="primary" variant="flat">
                      Total: {stats.waiting + stats.active + (stats.completed || 0)}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-3 text-center text-sm">
                    <div>
                      <div className="text-lg font-semibold text-warning">
                        {stats.waiting}
                      </div>
                      <div className="text-xs text-default-500">En cola</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-primary">
                        {stats.active}
                      </div>
                      <div className="text-xs text-default-500">Activos</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-success">
                        {stats.completed || 0}
                      </div>
                      <div className="text-xs text-default-500">Completados</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

const PerformanceTab: React.FC<{
  systemMetrics: any;
  metrics: JobTimingEntry[];
  metricsFilter: "all" | "completed" | "failed";
  onFilterChange: (value: "all" | "completed" | "failed") => void;
  metricsLoading: boolean;
  metricsError: string | null;
}> = ({
  systemMetrics,
  metrics,
  metricsFilter,
  onFilterChange,
  metricsLoading,
  metricsError,
}) => {
  return (
    <div className="space-y-6">
      {systemMetrics && (
        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardHeader>
            <h3 className="text-lg font-semibold">Resumen de Rendimiento</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {systemMetrics.performance.totalJobsLastHour ?? 0}
                </div>
                <div className="text-sm text-default-600">Procesados (últ. hora)</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {((systemMetrics.performance.averageProcessingTime ?? 0) / 1000).toFixed(1)}s
                </div>
                <div className="text-sm text-default-600">Tiempo Promedio</div>
              </div>

              <div className="text-center">
                <div className={`text-2xl font-bold ${((systemMetrics.performance.successRate ?? 0) < 80) ? "text-danger" : "text-success"}`}>
                  {(systemMetrics.performance.successRate ?? 0).toFixed(1)}%
                </div>
                <div className="text-sm text-default-600">Tasa de Éxito</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {systemMetrics.performance.totalWaitingJobs ?? 0}
                </div>
                <div className="text-sm text-default-600">En cola</div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="mdi:chart-timeline-variant" />
              Métricas de Procesamiento Recientes
            </h3>
            <p className="text-sm text-default-500">
              Últimos {metrics.length} trabajos. Monitoriza tiempos en cola y ejecución.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              size="sm"
              label="Estado"
              selectedKeys={[metricsFilter]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as "all" | "completed" | "failed";
                onFilterChange(value);
              }}
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="completed">Completados</SelectItem>
              <SelectItem key="failed">Fallidos</SelectItem>
            </Select>
          </div>
        </CardHeader>
        <CardBody>
          {metricsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner label="Cargando métricas..." />
            </div>
          ) : metricsError ? (
            <div className="text-danger text-sm">{metricsError}</div>
          ) : metrics.length === 0 ? (
            <div className="text-default-500 text-sm">No hay métricas recientes.</div>
          ) : (
            <Table aria-label="Job timing metrics" removeWrapper>
              <TableHeader>
                <TableColumn>Job</TableColumn>
                <TableColumn>En cola</TableColumn>
                <TableColumn>Primer progreso</TableColumn>
                <TableColumn>Python</TableColumn>
                <TableColumn>Total</TableColumn>
                <TableColumn>Registrado</TableColumn>
              </TableHeader>
              <TableBody>
                {metrics.map((entry) => {
                  const queueMs = entry.timings.workerStartedAt && entry.timings.enqueuedAt
                    ? entry.timings.workerStartedAt - entry.timings.enqueuedAt
                    : undefined;
                  const firstProgressMs = entry.timings.firstProgressAt && entry.timings.pythonStartAt
                    ? entry.timings.firstProgressAt - entry.timings.pythonStartAt
                    : undefined;
                  const pythonMs = entry.timings.pythonCompletedAt && entry.timings.pythonStartAt
                    ? entry.timings.pythonCompletedAt - entry.timings.pythonStartAt
                    : undefined;
                  const totalMs = entry.timings.completedAt && entry.timings.workerStartedAt
                    ? entry.timings.completedAt - entry.timings.workerStartedAt
                    : entry.timings.failedAt && entry.timings.workerStartedAt
                    ? entry.timings.failedAt - entry.timings.workerStartedAt
                    : undefined;

                  return (
                    <TableRow key={`${entry.jobId}-${entry.loggedAt}`}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{entry.jobId}</span>
                          <span className="text-xs text-default-500">
                            {formatDateTime(entry.loggedAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatMs(queueMs)}</TableCell>
                      <TableCell>{formatMs(firstProgressMs)}</TableCell>
                      <TableCell>{formatMs(pythonMs)}</TableCell>
                      <TableCell>{formatMs(totalMs)}</TableCell>
                      <TableCell>{formatDateTime(entry.loggedAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string; icon: string }> = ({
  title,
  value,
  subtitle,
  icon,
}) => (
  <Card className="bg-content1/50 border border-divider">
    <CardBody className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-default-500">{title}</span>
        <Icon icon={icon} className="text-lg text-primary" />
      </div>
      <div className="text-2xl font-semibold text-default-900">{value}</div>
      {subtitle && <div className="text-xs text-default-600">{subtitle}</div>}
    </CardBody>
  </Card>
);

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });
        if (search) {
          params.append("search", search);
        }

        const response = await fetch(`${apiService.baseUrl}/admin/users?${params.toString()}`, {
          headers: apiService.getAuthHeaders(),
          signal: controller.signal,
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setUsers(data.data.users || []);
          setTotalPages(data.data.pagination?.totalPages || 1);
        } else {
          setError(data.error || "Error al cargar usuarios");
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setError(error.message || "Error al cargar usuarios");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    return () => controller.abort();
  }, [page, search]);

  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-divider">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
          <p className="text-sm text-default-500">
            Visualiza los usuarios recientes y su estado de suscripción.
          </p>
        </div>
        <input
          className="px-3 py-2 border border-divider rounded-md bg-content1 text-sm"
          placeholder="Buscar por email"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner label="Cargando usuarios..." />
          </div>
        ) : error ? (
          <div className="text-danger text-sm">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-default-500 text-sm">No se encontraron usuarios.</div>
        ) : (
          <Table aria-label="Lista de usuarios" removeWrapper>
            <TableHeader>
              <TableColumn>Email</TableColumn>
              <TableColumn>Nombre</TableColumn>
              <TableColumn>Plan</TableColumn>
              <TableColumn>Páginas restantes</TableColumn>
              <TableColumn>Creado</TableColumn>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name || "-"}</TableCell>
                  <TableCell>{user.subscription?.plan || user.plan || "-"}</TableCell>
                  <TableCell>
                    {user.subscription?.pages_remaining ?? user.pages_remaining ?? "-"}
                  </TableCell>
                  <TableCell>{formatDateTime(user.createdAt || user.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex items-center justify-between mt-4 text-sm text-default-500">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              isDisabled={page <= 1}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="flat"
              isDisabled={page >= totalPages}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const LogsTab: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiService.baseUrl}/admin/system/logs?limit=50`, {
          headers: apiService.getAuthHeaders(),
          signal: controller.signal,
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setLogs(data.data.logs || []);
        } else {
          setError(data.error || "Error al cargar logs");
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setError(error.message || "Error al cargar logs");
        }
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
    const interval = setInterval(loadLogs, 20000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-divider">
      <CardHeader>
        <h3 className="text-lg font-semibold">Logs del Sistema</h3>
      </CardHeader>
      <CardBody className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner label="Cargando logs..." />
          </div>
        ) : error ? (
          <div className="text-danger text-sm">{error}</div>
        ) : logs.length === 0 ? (
          <div className="text-default-500 text-sm">No hay logs recientes.</div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border border-divider rounded-md p-3 bg-content1/40"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{log.level?.toUpperCase()}</span>
                  <span className="text-default-500">
                    {formatDateTime(log.createdAt || log.created_at)}
                  </span>
                </div>
                <div className="mt-1 text-sm text-default-700">{log.message}</div>
                {log.details && (
                  <pre className="mt-2 text-xs bg-content2/40 p-2 rounded">
                    {typeof log.details === "string"
                      ? log.details
                      : JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AdminPage;
