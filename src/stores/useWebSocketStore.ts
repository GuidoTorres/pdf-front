import { create } from "zustand";
import {
  websocketService,
  JobProgress,
  QueueStatus,
  SystemMetrics,
  WorkerMetrics,
} from "../services/websocket";

let documentStoreModule: { useDocumentStore: typeof import("./useDocumentStore")["useDocumentStore"] } | null = null;

const getDocumentStore = async () => {
  if (!documentStoreModule) {
    documentStoreModule = await import("./useDocumentStore");
  }
  return documentStoreModule.useDocumentStore;
};

interface WebSocketState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Job progress tracking
  jobProgress: Record<string, JobProgress>;

  // Queue status
  queueStatus: QueueStatus | null;

  // System metrics (for admin)
  systemMetrics: SystemMetrics | null;

  // Real-time notifications
  notifications: Array<{
    id: string;
    type: "job-completed" | "job-failed" | "queue-alert" | "system-alert";
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    jobId?: string;
  }>;

  unsubscribers: Array<() => void>;

  // Actions
  connect: (token?: string) => Promise<void>;
  disconnect: () => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  subscribeToAdminEvents: () => void;
  unsubscribeFromAdminEvents: () => void;
  setSystemMetrics: (metrics: SystemMetrics | null) => void;
}

const baseState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  jobProgress: {},
  queueStatus: null,
  systemMetrics: null,
  notifications: [],
};

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  ...baseState,
  unsubscribers: [] as Array<() => void>,

  connect: async (token?: string) => {
    set({
      isConnecting: true,
      connectionError: null,
    });

    try {
      await websocketService.connect(token);

      // Set up event listeners
      const unsubscribeJobProgress = websocketService.onJobProgress(
        (progress) => {
          set((state) => ({
            jobProgress: {
              ...state.jobProgress,
              [progress.jobId]: progress,
            },
          }));

          getDocumentStore()
            .then((useDocumentStore) => {
              const documentStore = useDocumentStore.getState();
              documentStore.handleWebSocketJobUpdate(
                progress.jobId,
                progress.status,
                progress.progress,
                progress.step,
                progress.result,
                progress.error
              );
            })
            .catch((error) => {
              console.error("Error updating document store:", error);
            });

          // Create notifications for completed/failed jobs
          if (progress.status === "completed" || progress.status === "failed") {
            // Check if it's a page limit error
            const isPageLimitError = progress.error && (
              progress.error.includes('Insufficient pages') ||
              progress.error.includes('Páginas insuficientes') ||
              progress.error.includes('pages remaining')
            );

            const notification = {
              id: `job-${progress.jobId}-${Date.now()}`,
              type:
                progress.status === "completed"
                  ? ("job-completed" as const)
                  : ("job-failed" as const),
              title:
                progress.status === "completed"
                  ? "Processing Complete"
                  : isPageLimitError
                  ? "Page Limit Exceeded"
                  : "Processing Failed",
              message:
                progress.status === "completed"
                  ? "Your document has been processed successfully"
                  : isPageLimitError
                  ? "You have reached your monthly page limit. Please upgrade your plan or wait for your monthly reset to continue processing documents."
                  : progress.error || "Document processing failed",
              timestamp: new Date(),
              read: false,
              jobId: progress.jobId,
            };

            set((state) => ({
              notifications: [notification, ...state.notifications],
            }));

            // Show browser notification if permission granted
            if (Notification.permission === "granted") {
              new Notification(notification.title, {
                body: notification.message,
                icon: "/favicon.ico",
              });
            }

            // For page limit errors, also trigger a toast notification like session expiry
            if (isPageLimitError) {
              import("./useNotificationStore").then(({ useNotificationStore }) => {
                useNotificationStore
                  .getState()
                  .error(
                    "Page Limit Exceeded",
                    "You have reached your monthly page limit. Please upgrade your plan or wait for your monthly reset."
                  );
              });
            }
          }
        }
      );

      const unsubscribeQueueStatus = websocketService.onQueueStatus(
        (status) => {
          set({ queueStatus: status });

          // Create alerts for high queue lengths - with validation
          if (status && status.premium && status.normal && status.large) {
            const totalWaiting =
              (status.premium.waiting || 0) +
              (status.normal.waiting || 0) +
              (status.large.waiting || 0);
            if (totalWaiting > 50) {
              const notification = {
                id: `queue-alert-${Date.now()}`,
                type: "queue-alert" as const,
                title: "High Queue Volume",
                message: `${totalWaiting} documents waiting in queue. Estimated wait time: ${Math.max(
                  status.premium.avgWaitTime || 0,
                  status.normal.avgWaitTime || 0
                )} minutes`,
                timestamp: new Date(),
                read: false,
              };

              set((state) => ({
                notifications: [notification, ...state.notifications.slice(0, 9)], // Keep only 10 notifications
              }));
            }
          }
        }
      );

      const unsubscribeSystemMetrics = websocketService.onSystemMetrics(
        (metrics) => {
          set({ systemMetrics: metrics });

          // Create system alerts for critical issues - with validation
          const successRate = metrics?.performance?.successRate;
          if (typeof successRate === "number" && successRate < 85) {
            const notification = {
              id: `system-alert-${Date.now()}`,
              type: "system-alert" as const,
              title: "Tasa de éxito baja",
              message: `La tasa de éxito cayó a ${successRate.toFixed(1)}% en la última hora`,
              timestamp: new Date(),
              read: false,
            };

            set((state) => ({
              notifications: [notification, ...state.notifications.slice(0, 9)],
            }));
          }
        }
      );

      const unsubscribeConnectionStatus = websocketService.onConnectionStatus(
        (connected) => {
          set({
            isConnected: connected,
            isConnecting: false,
            connectionError: connected ? null : "Connection lost",
          });
        }
      );

      // Store unsubscribe functions for cleanup
      set((state) => ({
        unsubscribers: [
          unsubscribeJobProgress,
          unsubscribeQueueStatus,
          unsubscribeSystemMetrics,
          unsubscribeConnectionStatus,
          ...state.unsubscribers,
        ],
        isConnected: true,
      }));

      set({ isConnecting: false });
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      set({
        isConnecting: false,
        connectionError:
          error instanceof Error ? error.message : "Connection failed",
      });
    }
  },

  disconnect: () => {
    websocketService.disconnect();

    const { unsubscribers = [] } = get();
    unsubscribers.forEach((unsubscribe) => unsubscribe());

    set({
      ...baseState,
      unsubscribers: [],
    });
  },

  markNotificationRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  subscribeToAdminEvents: () => {
    websocketService.subscribeToAdminEvents();
    websocketService.requestSystemMetrics();
  },

  unsubscribeFromAdminEvents: () => {
    websocketService.unsubscribeFromAdminEvents();
    set({ systemMetrics: null });
  },
  setSystemMetrics: (metrics) => {
    set({ systemMetrics: metrics });
  },
}));
