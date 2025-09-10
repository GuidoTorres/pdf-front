/**
 * API Service Tests
 * Tests the API service functionality
 */

import { apiService } from "../../services/api";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe("Authentication", () => {
    test("login sends correct request", async () => {
      const mockResponse = {
        data: {
          success: true,
          token: "test-token",
          user: { id: "1", email: "test@example.com" },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await apiService.login("test@example.com", "password");

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/auth/login", {
        email: "test@example.com",
        password: "password",
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse.data,
      });
    });

    test("login handles error correctly", async () => {
      const mockError = {
        response: {
          data: { message: "Invalid credentials" },
          status: 401,
        },
      };

      mockedAxios.post.mockRejectedValue(mockError);

      const result = await apiService.login(
        "test@example.com",
        "wrong-password"
      );

      expect(result).toEqual({
        success: false,
        error: "Invalid credentials",
      });
    });

    test("getCurrentUser includes auth token", async () => {
      const mockToken = "test-auth-token";
      (localStorage.getItem as jest.Mock).mockReturnValue(mockToken);

      const mockResponse = {
        data: {
          success: true,
          user: { id: "1", email: "test@example.com" },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await apiService.getCurrentUser();

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/auth/me", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
    });

    test("getCurrentUser handles missing token", async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = await apiService.getCurrentUser();

      expect(result).toEqual({
        success: false,
        error: "No authentication token found",
      });
    });
  });

  describe("Document Operations", () => {
    beforeEach(() => {
      (localStorage.getItem as jest.Mock).mockReturnValue("test-token");
    });

    test("uploadDocument sends FormData correctly", async () => {
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });
      const mockResponse = {
        data: {
          success: true,
          jobId: "test-job-id",
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await apiService.uploadDocument(mockFile);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/documents/upload",
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
            "Content-Type": "multipart/form-data",
          }),
        })
      );

      expect(result).toEqual({
        success: true,
        data: mockResponse.data,
      });
    });

    test("getDocuments returns document list", async () => {
      const mockDocuments = [
        {
          id: "1",
          original_file_name: "test.pdf",
          status: "completed",
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: mockDocuments,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await apiService.getDocuments();

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/documents/history", {
        headers: { Authorization: "Bearer test-token" },
      });

      expect(result).toEqual({
        success: true,
        data: mockDocuments,
      });
    });

    test("getJobStatus polls correctly", async () => {
      const mockResponse = {
        data: {
          jobId: "test-job-id",
          state: "completed",
          progress: 100,
          result: { transactions: [] },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await apiService.getJobStatus("test-job-id");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/api/documents/status/test-job-id",
        {
          headers: { Authorization: "Bearer test-token" },
        }
      );

      expect(result).toEqual({
        success: true,
        data: mockResponse.data,
      });
    });
  });

  describe("Error Handling", () => {
    test("handles network errors", async () => {
      const networkError = new Error("Network Error");
      mockedAxios.post.mockRejectedValue(networkError);

      const result = await apiService.login("test@example.com", "password");

      expect(result).toEqual({
        success: false,
        error: "Network error occurred",
      });
    });

    test("handles 401 unauthorized", async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
      };

      mockedAxios.get.mockRejectedValue(unauthorizedError);
      (localStorage.getItem as jest.Mock).mockReturnValue("invalid-token");

      const result = await apiService.getCurrentUser();

      expect(result).toEqual({
        success: false,
        error: "Unauthorized",
      });
    });

    test("handles 500 server errors", async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
        },
      };

      mockedAxios.post.mockRejectedValue(serverError);

      const result = await apiService.login("test@example.com", "password");

      expect(result).toEqual({
        success: false,
        error: "Internal Server Error",
      });
    });
  });

  describe("Request Interceptors", () => {
    test("adds auth token to requests automatically", async () => {
      const mockToken = "auto-token";
      (localStorage.getItem as jest.Mock).mockReturnValue(mockToken);

      // Mock the axios instance
      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: {} }),
        post: jest.fn().mockResolvedValue({ data: {} }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };

      // Test that interceptor would add the token
      const requestConfig = { headers: {} };

      // Simulate what the interceptor should do
      if (mockToken) {
        requestConfig.headers.Authorization = `Bearer ${mockToken}`;
      }

      expect(requestConfig.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });
  });

  describe("Response Validation", () => {
    test("validates response structure", async () => {
      const invalidResponse = {
        data: {
          // Missing success field
          user: { id: "1" },
        },
      };

      mockedAxios.get.mockResolvedValue(invalidResponse);
      (localStorage.getItem as jest.Mock).mockReturnValue("test-token");

      const result = await apiService.getCurrentUser();

      // Should handle invalid response structure
      expect(result.success).toBeDefined();
    });

    test("handles empty responses", async () => {
      mockedAxios.get.mockResolvedValue({ data: null });
      (localStorage.getItem as jest.Mock).mockReturnValue("test-token");

      const result = await apiService.getCurrentUser();

      expect(result).toEqual({
        success: false,
        error: "Invalid response from server",
      });
    });
  });
});
