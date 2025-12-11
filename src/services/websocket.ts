import { io, Socket } from "socket.io-client";

export interface JobProgress {
  jobId: string;
  status: "queued" | "started" | "progress" | "completed" | "failed";
  progress?: number;
  step?: string;
  estimatedTime?: number;
  queuePosition?: number;
  result?: any;
  error?: string;
}

export interface QueueStatus {
  premium: {
    waiting: number;
    active: number;
    avgWaitTime: number;
  };
  normal: {
    waiting: number;
    active: number;
    avgWaitTime: number;
  };
  large: {
    waiting: number;
    active: number;
    avgWaitTime: number;
  };
  totalWorkers: number;
  activeWorkers: number;
}

type AdminQueueMetrics = Record<
  string,
  {
    waiting: number;
    active: number;
    completed?: number;
  }
>;

export interface WorkerMetrics {
  workerId: string;
  status: "idle" | "processing" | "stalled" | "error" | "offline";
  queueName?: string;
  currentJob?: string | null;
  jobsCompleted?: number;
  jobsFailed?: number;
  avgProcessingTime?: number;
  lastProcessingTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  lastHeartbeat?: number;
  lastUpdated?: number;
}

export interface SystemMetrics {
  timestamp: string;
  workers: WorkerMetrics[];
  queues: AdminQueueMetrics;
  performance: {
    totalJobsLastHour: number;
    successfulJobs: number;
    failedJobs: number;
    successRate: number;
    averageProcessingTime: number;
    totalActiveJobs: number;
    totalWaitingJobs: number;
  };
  system: {
    connectedUsers: number;
    connectedAdmins: number;
    activeWorkers: number;
    uptime: number;
  };
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  // Event handlers
  private jobProgressHandlers: ((progress: JobProgress) => void)[] = [];
  private queueStatusHandlers: ((status: QueueStatus) => void)[] = [];
  private systemMetricsHandlers: ((metrics: SystemMetrics) => void)[] = [];
  private connectionStatusHandlers: ((connected: boolean) => void)[] = [];

  connect(token?: string): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:3000";

    return new Promise((resolve, reject) => {
      this.socket = io(wsUrl, {
        auth: {
          token: token || localStorage.getItem("auth_token"),
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        forceNew: true,
      });

      this.socket.on("connect", () => {
        // Authenticate with the server ONLY if we have a token
        import('./api').then(({ getAuthToken }) => {
          const authToken = token || getAuthToken();
          if (authToken) {
            this.socket?.emit("authenticate", { token: authToken });
          }
        });
        
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.connectionStatusHandlers.forEach((handler) => handler(true));
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        this.isConnecting = false;
        this.connectionStatusHandlers.forEach((handler) => handler(false));

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.connect(token);
          }, this.reconnectDelay * this.reconnectAttempts);
        } else {
          reject(error);
        }
      });

      this.socket.on("disconnect", (reason) => {
        this.connectionStatusHandlers.forEach((handler) => handler(false));

        // Auto-reconnect unless it was a manual disconnect
        if (reason !== "io client disconnect") {
          setTimeout(() => {
            this.connect(token);
          }, this.reconnectDelay);
        }
      });

      // Job progress events
      this.socket.on("job-queued", (data: JobProgress) => {
        this.jobProgressHandlers.forEach((handler) => handler(data));
      });

      this.socket.on("job-started", (data: any) => {
        const jobProgress: JobProgress = {
          jobId: data.jobId,
          status: "started",
          progress: 0,
          step: "Job started processing",
          estimatedTime: data.estimatedTime || null,
          queuePosition: data.queuePosition || null
        };
        this.jobProgressHandlers.forEach((handler) => handler(jobProgress));
      });

      this.socket.on("job-progress", (data: any) => {
        const jobProgress: JobProgress = {
          jobId: data.jobId,
          status: "progress",
          progress: data.progress || 50,
          step: data.stage || data.step || "Processing...",
          estimatedTime: data.estimatedTimeRemaining || null
        };
        this.jobProgressHandlers.forEach((handler) => handler(jobProgress));
      });

      this.socket.on("job-completed", (data: any) => {
        const jobProgress: JobProgress = {
          jobId: data.jobId,
          status: "completed",
          progress: 100,
          step: "Processing completed",
          result: data.result || null
        };
        
        this.jobProgressHandlers.forEach((handler) => {
          handler(jobProgress);
        });
      });

      this.socket.on("job-failed", (data: any) => {
        const jobProgress: JobProgress = {
          jobId: data.jobId,
          status: "failed",
          progress: 0,
          step: "Processing failed",
          error: data.error || "Processing failed"
        };
        this.jobProgressHandlers.forEach((handler) => handler(jobProgress));
      });

      // Queue status events
      this.socket.on("queue-status", (data: QueueStatus) => {
        this.queueStatusHandlers.forEach((handler) => handler(data));
      });

      // System metrics events (for admin users)
      this.socket.on("system-metrics", (data: SystemMetrics) => {
        this.systemMetricsHandlers.forEach((handler) => handler(data));
      });

      // Authentication events
      this.socket.on("authenticated", (data) => {
        // WebSocket authenticated successfully
      });

      this.socket.on("auth-error", (error) => {
        console.error("WebSocket auth error:", error);
        
        // Check if user is actually authenticated in the auth store before triggering logout
        Promise.all([
          import('../stores/useAuthStore'),
          import('./api')
        ])
          .then(([{ useAuthStore }, { getAuthToken }]) => {
            const authState = useAuthStore.getState();
            const authToken = token || getAuthToken();

            if (authState.isAuthenticated && authState.user && authToken) {
              this.disconnect();
              authState.handleAuthExpired();
            } else {
              this.disconnect();
            }
          })
          .catch((err) => {
            console.error("Error handling auth expiry:", err);
            this.disconnect();
          });
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.connectionStatusHandlers.forEach((handler) => handler(false));
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event subscription methods
  onJobProgress(handler: (progress: JobProgress) => void): () => void {
    this.jobProgressHandlers.push(handler);
    return () => {
      const index = this.jobProgressHandlers.indexOf(handler);
      if (index > -1) {
        this.jobProgressHandlers.splice(index, 1);
      }
    };
  }

  onQueueStatus(handler: (status: QueueStatus) => void): () => void {
    this.queueStatusHandlers.push(handler);
    return () => {
      const index = this.queueStatusHandlers.indexOf(handler);
      if (index > -1) {
        this.queueStatusHandlers.splice(index, 1);
      }
    };
  }

  onSystemMetrics(handler: (metrics: SystemMetrics) => void): () => void {
    this.systemMetricsHandlers.push(handler);
    return () => {
      const index = this.systemMetricsHandlers.indexOf(handler);
      if (index > -1) {
        this.systemMetricsHandlers.splice(index, 1);
      }
    };
  }

  onConnectionStatus(handler: (connected: boolean) => void): () => void {
    this.connectionStatusHandlers.push(handler);
    return () => {
      const index = this.connectionStatusHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionStatusHandlers.splice(index, 1);
      }
    };
  }

  // Admin methods
  requestSystemMetrics(): void {
    if (this.socket?.connected) {
      this.socket.emit("request-system-metrics");
    }
  }

  subscribeToAdminEvents(): void {
    if (this.socket?.connected) {
      this.socket.emit("subscribe-admin");
    }
  }

  unsubscribeFromAdminEvents(): void {
    if (this.socket?.connected) {
      this.socket.emit("unsubscribe-admin");
    }
  }
}

export const websocketService = new WebSocketService();
