import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import { useWebSocketStore } from "../../stores/useWebSocketStore";
import { websocketService } from "../../services/websocket";

// Mock the WebSocket service
jest.mock("../../services/websocket", () => ({
  websocketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    isConnected: jest.fn(() => false),
    onJobProgress: jest.fn(() => () => {}),
    onQueueStatus: jest.fn(() => () => {}),
    onSystemMetrics: jest.fn(() => () => {}),
    onConnectionStatus: jest.fn(() => () => {}),
    subscribeToAdminEvents: jest.fn(),
    unsubscribeFromAdminEvents: jest.fn(),
    requestSystemMetrics: jest.fn(),
  },
}));

// Mock socket.io-client
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    connected: false,
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <HeroUIProvider>{children}</HeroUIProvider>
  </BrowserRouter>
);

describe("WebSocket Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("WebSocket store initializes with correct default state", () => {
    const TestComponent = () => {
      const { isConnected, isConnecting, jobProgress, queueStatus } =
        useWebSocketStore();

      return (
        <div>
          <div data-testid="connection-status">
            {isConnected ? "connected" : "disconnected"}
          </div>
          <div data-testid="connecting-status">
            {isConnecting ? "connecting" : "idle"}
          </div>
          <div data-testid="job-progress-count">
            {Object.keys(jobProgress).length}
          </div>
          <div data-testid="queue-status">
            {queueStatus ? "available" : "unavailable"}
          </div>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId("connection-status")).toHaveTextContent(
      "disconnected"
    );
    expect(screen.getByTestId("connecting-status")).toHaveTextContent("idle");
    expect(screen.getByTestId("job-progress-count")).toHaveTextContent("0");
    expect(screen.getByTestId("queue-status")).toHaveTextContent("unavailable");
  });

  test("WebSocket connect method calls service connect", async () => {
    const TestComponent = () => {
      const { connect } = useWebSocketStore();

      React.useEffect(() => {
        connect("test-token");
      }, [connect]);

      return <div>Test Component</div>;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(websocketService.connect).toHaveBeenCalledWith("test-token");
    });
  });

  test("WebSocket disconnect method calls service disconnect", async () => {
    const TestComponent = () => {
      const { disconnect } = useWebSocketStore();

      React.useEffect(() => {
        disconnect();
      }, [disconnect]);

      return <div>Test Component</div>;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(websocketService.disconnect).toHaveBeenCalled();
    });
  });

  test("WebSocket service event listeners are set up correctly", async () => {
    const TestComponent = () => {
      const { connect } = useWebSocketStore();

      React.useEffect(() => {
        connect("test-token");
      }, [connect]);

      return <div>Test Component</div>;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(websocketService.onJobProgress).toHaveBeenCalled();
      expect(websocketService.onQueueStatus).toHaveBeenCalled();
      expect(websocketService.onSystemMetrics).toHaveBeenCalled();
      expect(websocketService.onConnectionStatus).toHaveBeenCalled();
    });
  });

  test("Admin events subscription works correctly", async () => {
    const TestComponent = () => {
      const { subscribeToAdminEvents, unsubscribeFromAdminEvents } =
        useWebSocketStore();

      React.useEffect(() => {
        subscribeToAdminEvents();
        return () => unsubscribeFromAdminEvents();
      }, [subscribeToAdminEvents, unsubscribeFromAdminEvents]);

      return <div>Admin Test Component</div>;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(websocketService.subscribeToAdminEvents).toHaveBeenCalled();
      expect(websocketService.requestSystemMetrics).toHaveBeenCalled();
    });
  });
});
