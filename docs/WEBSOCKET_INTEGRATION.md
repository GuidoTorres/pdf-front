# WebSocket Real-Time Integration

This document describes the WebSocket integration implemented for real-time PDF processing updates.

## Overview

The WebSocket integration provides real-time updates for:

- Job progress and status
- Queue position and estimated wait times
- System metrics and worker status (admin only)
- Push notifications for completed/failed jobs

## Architecture

### Components

1. **WebSocket Service** (`src/services/websocket.ts`)

   - Handles connection management
   - Event subscription/unsubscription
   - Auto-reconnection logic
   - Authentication handling

2. **WebSocket Store** (`src/stores/useWebSocketStore.ts`)

   - Zustand store for WebSocket state management
   - Real-time notifications
   - Connection status tracking
   - Admin event management

3. **Real-Time Components**
   - `RealTimeProgress`: Shows job progress with queue position
   - `QueueStatus`: Displays overall system queue status
   - `RealTimeNotifications`: Push notifications for job events
   - `AdminDashboard`: System metrics for administrators
   - `WebSocketStatus`: Connection status indicator

### Integration Points

1. **App.tsx**: Global WebSocket initialization
2. **DashboardPage.tsx**: Main integration point with job updates
3. **DocumentStore**: WebSocket job update handling

## Features Implemented

### 1. Real-Time Job Progress

- Live progress updates during PDF processing
- Queue position tracking
- Estimated processing time
- Step-by-step progress indicators

### 2. Queue Status Monitoring

- Real-time queue lengths for different priority levels
- Worker utilization metrics
- Average wait times per queue
- System load indicators

### 3. Push Notifications

- Browser notifications for completed jobs
- In-app notification system
- Notification history and read status
- Different notification types (success, error, alerts)

### 4. Admin Dashboard

- System performance metrics
- Worker status monitoring
- Resource usage tracking
- Error rate monitoring

### 5. Connection Management

- Auto-reconnection on connection loss
- Connection status indicators
- Graceful degradation to polling when offline
- Authentication error handling

## Usage

### Basic Setup

```typescript
import { useWebSocketStore } from "../stores/useWebSocketStore";

const MyComponent = () => {
  const { connect, isConnected, jobProgress } = useWebSocketStore();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      connect(token);
    }
  }, [connect]);

  return <div>Status: {isConnected ? "Connected" : "Disconnected"}</div>;
};
```

### Job Progress Tracking

```typescript
const { jobProgress } = useWebSocketStore();

// Access progress for specific job
const progress = jobProgress[jobId];
if (progress) {
  console.log(`Job ${jobId}: ${progress.status} - ${progress.progress}%`);
}
```

### Admin Features

```typescript
const { subscribeToAdminEvents, systemMetrics } = useWebSocketStore();

// Subscribe to admin events (requires admin privileges)
useEffect(() => {
  subscribeToAdminEvents();
  return () => unsubscribeFromAdminEvents();
}, []);
```

## WebSocket Events

### Client → Server

- `subscribe-admin`: Subscribe to admin-only events
- `unsubscribe-admin`: Unsubscribe from admin events
- `request-system-metrics`: Request current system metrics

### Server → Client

- `job-queued`: Job added to queue
- `job-started`: Job processing started
- `job-progress`: Job progress update
- `job-completed`: Job completed successfully
- `job-failed`: Job processing failed
- `queue-status`: Queue status update
- `system-metrics`: System performance metrics (admin only)
- `auth-error`: Authentication error

## Event Data Structures

### JobProgress

```typescript
interface JobProgress {
  jobId: string;
  status: "queued" | "started" | "progress" | "completed" | "failed";
  progress?: number; // 0-100
  step?: string; // Current processing step
  estimatedTime?: number; // Seconds
  queuePosition?: number;
  result?: any; // Final result for completed jobs
  error?: string; // Error message for failed jobs
}
```

### QueueStatus

```typescript
interface QueueStatus {
  premium: {
    waiting: number;
    active: number;
    avgWaitTime: number; // minutes
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
```

### SystemMetrics (Admin Only)

```typescript
interface SystemMetrics {
  timestamp: Date;
  workers: WorkerMetrics[];
  queues: QueueStatus;
  system: {
    totalMemoryUsage: number; // bytes
    totalCpuUsage: number; // percentage
    systemLoad: number;
  };
  performance: {
    totalJobsProcessed: number;
    averageProcessingTime: number; // milliseconds
    errorRate: number; // 0-1
    throughputPerHour: number;
  };
}
```

## Configuration

### Environment Variables

- `VITE_WS_URL`: WebSocket server URL (default: http://localhost:3000)

### Connection Options

```typescript
const socket = io(wsUrl, {
  auth: { token: authToken },
  transports: ["websocket", "polling"],
  timeout: 10000,
  forceNew: true,
});
```

## Error Handling

1. **Connection Errors**: Auto-retry with exponential backoff
2. **Authentication Errors**: Trigger auth refresh
3. **Network Issues**: Graceful degradation to polling
4. **Server Errors**: Display user-friendly error messages

## Browser Notifications

The system requests notification permission and shows browser notifications for:

- Completed job processing
- Failed job processing
- System alerts (for admins)

## Testing

WebSocket integration includes:

- Unit tests for store functionality
- Mock WebSocket service for testing
- Integration tests for real-time updates

## Performance Considerations

1. **Event Throttling**: Prevents excessive updates
2. **Selective Subscriptions**: Admin events only for authorized users
3. **Connection Pooling**: Efficient resource usage
4. **Graceful Degradation**: Falls back to polling when needed

## Security

1. **Token Authentication**: JWT tokens for WebSocket auth
2. **Admin Authorization**: Restricted admin events
3. **Rate Limiting**: Prevents abuse
4. **Input Validation**: All incoming data validated

## Future Enhancements

1. **Room-based Updates**: User-specific event rooms
2. **Batch Progress**: Enhanced batch processing updates
3. **File Upload Progress**: Real-time upload progress
4. **Advanced Metrics**: More detailed performance metrics
5. **Mobile Push**: Integration with mobile push notifications
