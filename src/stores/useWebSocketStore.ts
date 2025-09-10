import { create } from "zustand";
import {
  websocketService,
  JobProgress,
  QueueStatus,
  SystemMetrics,
  WorkerMetrics,
} from "../services/websocket";

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

  // Actions
  connect: (token?: string) => Promise<void>;
  disconnect: () => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  subscribeToAdminEvents: () => void;
  unsubscribeFromAdminEvents: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  // Initial state
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  jobProgress: {},
  queueStatus: null,
  systemMetrics: null,
  notifications: [],

  connect: async (token?: string) => {
    set({ isConnecting: true, connectionError: null });

    try {
      await websocketService.connect(token);

      // Set up event listeners
      const unsubscribeJobProgress = websocketService.onJobProgress(
        (progress) => {
          console.log("[WebSocket Store] Job progress update received:", {
            jobId: progress.jobId,
            status: progress.status,
            progress: progress.progress,
            hasResult: !!progress.result,
            hasError: !!progress.error,
            timestamp: new Date().toISOString()
          });
          
          set((state) => ({
            jobProgress: {
              ...state.jobProgress,
              [progress.jobId]: progress,
            },
          }));

          // Update document store with job progress
          console.log("[WebSocket Store] About to update document store for job:", progress.jobId);
          import("./useDocumentStore").then(({ useDocumentStore }) => {
            const documentStore = useDocumentStore.getState();
            console.log("[WebSocket Store] Calling handleWebSocketJobUpdate:", {
              jobId: progress.jobId,
              status: progress.status,
              currentDocuments: documentStore.documents.length
            });
            documentStore.handleWebSocketJobUpdate(
              progress.jobId,
              progress.status,
              progress.progress,
              progress.step,
              progress.result,
              progress.error
            );
            console.log("[WebSocket Store] handleWebSocketJobUpdate completed for job:", progress.jobId);
          }).catch(error => {
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
          if (metrics && metrics.performance && metrics.performance.errorRate > 0.1) {
            // 10% error rate
            const notification = {
              id: `system-alert-${Date.now()}`,
              type: "system-alert" as const,
              title: "High Error Rate",
              message: `System error rate is ${(
                metrics.performance.errorRate * 100
              ).toFixed(1)}%`,
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
      (window as any).__wsUnsubscribers = [
        unsubscribeJobProgress,
        unsubscribeQueueStatus,
        unsubscribeSystemMetrics,
        unsubscribeConnectionStatus,
      ];

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

    // Clean up event listeners
    if ((window as any).__wsUnsubscribers) {
      (window as any).__wsUnsubscribers.forEach((unsubscribe: () => void) =>
        unsubscribe()
      );
      delete (window as any).__wsUnsubscribers;
    }

    set({
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      jobProgress: {},
      queueStatus: null,
      systemMetrics: null,
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
}));
