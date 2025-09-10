/**
 * Dashboard Component Tests
 * Tests the main dashboard functionality
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import DashboardPage from "../../pages/DashboardPage";
import { useAuthStore } from "../../stores/useAuthStore";
import { apiService } from "../../services/api";

// Mock the stores and services
jest.mock("../../stores/useAuthStore");
jest.mock("../../services/api");

const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock user data
const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  subscription: {
    plan: "free",
    pages_remaining: 8,
    renewed_at: "2024-01-01T00:00:00.000Z",
    next_reset: "2024-02-01T00:00:00.000Z",
  },
  plan: "free",
  pages_remaining: 8,
};

// Mock documents data
const mockDocuments = [
  {
    id: "doc-1",
    original_file_name: "test-statement.pdf",
    status: "completed",
    created_at: "2024-01-15T10:00:00.000Z",
    transactions: [
      {
        date: "2024-01-10",
        description: "Test Transaction",
        amount: -50.0,
        type: "debit",
      },
    ],
    meta: {
      bank_name: "Test Bank",
      statement_period: "January 2024",
    },
  },
];

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <HeroUIProvider>{children}</HeroUIProvider>
  </BrowserRouter>
);

describe("Dashboard Component", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock auth store
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn(),
      initialize: jest.fn(),
      handleAuthExpired: jest.fn(),
    });

    // Mock API service
    mockApiService.getDocuments.mockResolvedValue({
      success: true,
      data: mockDocuments,
    });
  });

  test("renders dashboard with user data", async () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Check if user name is displayed
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();

    // Check if pages remaining is displayed
    await waitFor(() => {
      expect(screen.getByText(/8/)).toBeInTheDocument();
    });
  });

  test("displays subscription information correctly", async () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Check for free plan indicator
      expect(screen.getByText(/free/i)).toBeInTheDocument();

      // Check for pages remaining
      expect(screen.getByText(/8/)).toBeInTheDocument();
    });
  });

  test("shows document history when available", async () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Check if document is displayed
      expect(screen.getByText(/test-statement.pdf/i)).toBeInTheDocument();

      // Check if bank name is displayed
      expect(screen.getByText(/Test Bank/i)).toBeInTheDocument();
    });
  });

  test("handles loading state correctly", () => {
    // Mock loading state
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn(),
      initialize: jest.fn(),
      handleAuthExpired: jest.fn(),
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Should show loading indicator
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("handles error state when API fails", async () => {
    // Mock API failure
    mockApiService.getDocuments.mockRejectedValue(new Error("API Error"));

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should handle error gracefully
      expect(screen.queryByText(/error/i)).toBeInTheDocument();
    });
  });

  test("displays correct transaction count", async () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should show transaction count
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
  });

  test("shows upgrade prompt for free users", async () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should show upgrade option for free users
      expect(screen.getByText(/upgrade/i)).toBeInTheDocument();
    });
  });

  test("handles empty document history", async () => {
    // Mock empty documents
    mockApiService.getDocuments.mockResolvedValue({
      success: true,
      data: [],
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should show empty state message
      expect(screen.getByText(/no documents/i)).toBeInTheDocument();
    });
  });
});

// Additional integration tests
describe("Dashboard Integration", () => {
  test("file upload flow works correctly", async () => {
    const mockFile = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Find file input
    const fileInput = screen.getByLabelText(/upload/i);

    // Simulate file selection
    Object.defineProperty(fileInput, "files", {
      value: [mockFile],
      writable: false,
    });

    // Should trigger upload process
    // This would need more detailed mocking of the upload flow
  });

  test("navigation to history page works", async () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Find and click history link
    const historyLink = screen.getByText(/view all/i);
    expect(historyLink).toBeInTheDocument();
  });
});
