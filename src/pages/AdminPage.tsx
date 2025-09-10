import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Button, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/useAuthStore";
import { useWebSocketStore } from "../stores/useWebSocketStore";
import { AdminDashboard } from "../components/dashboard";
import AdminRoute from "../components/AdminRoute";

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const {
    systemMetrics,
    isConnected,
    subscribeToAdminEvents,
    unsubscribeFromAdminEvents,
  } = useWebSocketStore();

  // Check if user is admin
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
                  <span>Workers activos: {systemMetrics.workers.length}</span>
                  <span>
                    Trabajos procesados:{" "}
                    {systemMetrics.performance.totalJobsProcessed}
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
            <OverviewTab systemMetrics={systemMetrics} />
          )}
          {activeTab === "workers" && (
            <WorkersTab systemMetrics={systemMetrics} />
          )}
          {activeTab === "queues" && <QueuesTab />}
          {activeTab === "performance" && (
            <PerformanceTab systemMetrics={systemMetrics} />
          )}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "logs" && <LogsTab />}
        </div>
      </div>
    </AdminRoute>
  );
};

// Tab Components
const OverviewTab: React.FC<{ systemMetrics: any }> = ({ systemMetrics }) => {
  if (!systemMetrics) {
    return (
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardBody>
          <div className="text-center text-default-500 py-8">
            <Icon icon="mdi:loading" className="text-4xl animate-spin mb-4" />
            <p>Cargando métricas del sistema...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return <AdminDashboard />;
};

const WorkersTab: React.FC<{ systemMetrics: any }> = ({ systemMetrics }) => {
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

  return (
    <div className="space-y-6">
      {/* Workers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-primary">
              {systemMetrics.workers.length}
            </div>
            <div className="text-sm text-default-600">Total Workers</div>
          </CardBody>
        </Card>

        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-success">
              {
                systemMetrics.workers.filter((w: any) => w.status === "active")
                  .length
              }
            </div>
            <div className="text-sm text-default-600">Activos</div>
          </CardBody>
        </Card>

        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-warning">
              {
                systemMetrics.workers.filter((w: any) => w.status === "idle")
                  .length
              }
            </div>
            <div className="text-sm text-default-600">En Espera</div>
          </CardBody>
        </Card>

        <Card className="bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-danger">
              {
                systemMetrics.workers.filter((w: any) => w.status === "failed")
                  .length
              }
            </div>
            <div className="text-sm text-default-600">Con Errores</div>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Worker List */}
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader>
          <h3 className="text-lg font-semibold">Detalle de Workers</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {systemMetrics.workers.map((worker: any) => (
              <div
                key={worker.workerId}
                className="flex items-center justify-between p-4 bg-content2/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      worker.status === "active"
                        ? "bg-success"
                        : worker.status === "idle"
                        ? "bg-warning"
                        : worker.status === "failed"
                        ? "bg-danger"
                        : "bg-default"
                    }`}
                  />
                  <span className="font-medium">
                    Worker {worker.workerId.slice(-8)}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{worker.jobsInProgress}</div>
                    <div className="text-xs text-default-600">
                      Trabajos Activos
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium">
                      {worker.jobsCompletedHour}
                    </div>
                    <div className="text-xs text-default-600">
                      Completados/h
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium">
                      {worker.cpuUsage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-default-600">CPU</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium">
                      {Math.round(worker.memoryUsage / 1024 / 1024)}MB
                    </div>
                    <div className="text-xs text-default-600">Memoria</div>
                  </div>

                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    startContent={<Icon icon="mdi:stop" />}
                  >
                    Detener
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

const QueuesTab: React.FC = () => {
  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-divider">
      <CardHeader>
        <h3 className="text-lg font-semibold">Estado de las Colas</h3>
      </CardHeader>
      <CardBody>
        <div className="text-center text-default-500 py-8">
          <Icon icon="mdi:format-list-bulleted" className="text-4xl mb-4" />
          <p>Información de colas próximamente...</p>
        </div>
      </CardBody>
    </Card>
  );
};

const PerformanceTab: React.FC<{ systemMetrics: any }> = ({
  systemMetrics,
}) => {
  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-divider">
      <CardHeader>
        <h3 className="text-lg font-semibold">Métricas de Rendimiento</h3>
      </CardHeader>
      <CardBody>
        <div className="text-center text-default-500 py-8">
          <Icon icon="mdi:chart-line" className="text-4xl mb-4" />
          <p>Gráficos de rendimiento próximamente...</p>
        </div>
      </CardBody>
    </Card>
  );
};

const UsersTab: React.FC = () => {
  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-divider">
      <CardHeader>
        <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
      </CardHeader>
      <CardBody>
        <div className="text-center text-default-500 py-8">
          <Icon icon="mdi:account-group" className="text-4xl mb-4" />
          <p>Gestión de usuarios próximamente...</p>
        </div>
      </CardBody>
    </Card>
  );
};

const LogsTab: React.FC = () => {
  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-divider">
      <CardHeader>
        <h3 className="text-lg font-semibold">Logs del Sistema</h3>
      </CardHeader>
      <CardBody>
        <div className="text-center text-default-500 py-8">
          <Icon icon="mdi:text-box-multiple" className="text-4xl mb-4" />
          <p>Visualización de logs próximamente...</p>
        </div>
      </CardBody>
    </Card>
  );
};

export default AdminPage;
