const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Global handler for authentication errors
let authExpiredHandler: (() => void) | null = null;

export const setAuthExpiredHandler = (handler: () => void) => {
  authExpiredHandler = handler;
};

const handleAuthError = (hadValidTokenBefore = true) => {
  // Only trigger session expired if user had a valid session before
  if (hadValidTokenBefore && authExpiredHandler) {
    authExpiredHandler();
  } else if (hadValidTokenBefore) {
    // Fallback: remove token and redirect only if user was authenticated
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  } else {
    // Silent handling for users who weren't authenticated
    localStorage.removeItem("auth_token");
  }
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Transaction {
  id?: string;
  date: string; // Primary date field from backend
  post_date?: string; // Legacy field for compatibility
  value_date?: string; // Legacy field for compatibility
  description: string;
  amount: number; // Final calculated amount with correct sign
  balance?: number;
  reference?: string;
  category?: string;
  subcategory?: string;
  confidence?: number;
  type: "credit" | "debit"; // Calculated transaction type (now required and strongly typed)

  // New fields for debugging and validation
  original_credit?: number; // Original credit value from PDF
  original_debit?: number; // Original debit value from PDF
  original_amount?: number; // Original amount value from PDF
  sign_detection_method: "columns" | "heuristics" | "hybrid"; // Method used for sign detection
}

export interface BankStatementMeta {
  bank_name?: string;
  account_number?: string;
  currency: string;
  period?: string;
  opening_balance?: number;
  closing_balance?: number;
}

export interface ProcessingResult {
  meta: BankStatementMeta;
  transactions: Transaction[];
  originalTransactions?: any[]; // Original data from PDF processing
  originalTable?: {
    headers: string[];
    rows: any[][];
  }; // Original table structure from GROQ dual format
  quality?: {
    score: number;
    confidence: string;
    issues: string[];
  };
  provider: string;
  processing_time?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  subscription?: {
    plan: string;
    pages_remaining: number;
    expires_at?: string;
    renewed_at?: string;
    next_reset?: string;
    total_pages_used?: number;
    pages_used_this_month?: number;
  };
  plan?: string; // Legacy field for backward compatibility
  pages_remaining?: number; // Legacy field for backward compatibility
}

class ApiService {
  private isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getFormDataHeaders(): HeadersInit {
    const token = localStorage.getItem("auth_token");
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("auth_token", data.token);
        return { success: true, data };
      }

      return { success: false, error: data.error || "Login failed" };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("auth_token", data.token);
        return { success: true, data };
      }

      return { success: false, error: data.error || "Registration failed" };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.user };
      }

      // Handle authentication errors
      if (response.status === 401) {
        const hadValidToken = !!localStorage.getItem("auth_token");
        handleAuthError(hadValidToken);
        return {
          success: false,
          error: "Authentication expired. Please log in again.",
        };
      }

      return { success: false, error: data.error || "Failed to get user" };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  async processDocument(file: File): Promise<ApiResponse<ProcessingResult>> {
    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch(`${API_BASE_URL}/documents/process`, {
        method: "POST",
        headers: this.getFormDataHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      }

      // Handle authentication errors
      if (response.status === 401) {
        const hadValidToken = !!localStorage.getItem("auth_token");
        handleAuthError(hadValidToken);
        return {
          success: false,
          error: "Authentication expired. Please log in again.",
        };
      }

      return { success: false, error: data.error || "Processing failed" };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  async getJobStatus(jobId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/documents/status/${jobId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      }

      // Handle authentication errors
      if (response.status === 401) {
        const hadValidToken = !!localStorage.getItem("auth_token");
        handleAuthError(hadValidToken);
        return {
          success: false,
          error: "Authentication expired. Please log in again.",
        };
      }

      return {
        success: false,
        error: data.error || "Failed to get job status",
      };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  async getProcessingHistory(): Promise<ApiResponse<ProcessingResult[]>> {
    // Check if user is authenticated before making the request
    if (!this.isAuthenticated()) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/history`, {
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (response.ok) {
        // Handle nested data structure from backend
        const data = result.data?.data || result.data || result;
        return { success: true, data };
      }

      // Handle authentication errors
      if (response.status === 401) {
        const hadValidToken = !!localStorage.getItem("auth_token");
        handleAuthError(hadValidToken);
        return {
          success: false,
          error: "Authentication expired. Please log in again.",
        };
      }

      return { success: false, error: result.error || "Failed to get history" };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  async deleteDocument(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      }

      return {
        success: false,
        error: data.error || "Failed to delete document",
      };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  async cancelJob(jobId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${jobId}/cancel`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      }

      // Handle authentication errors
      if (response.status === 401) {
        const hadValidToken = !!localStorage.getItem("auth_token");
        handleAuthError(hadValidToken);
        return {
          success: false,
          error: "Authentication expired. Please log in again.",
        };
      }

      return {
        success: false,
        error: data.error || "Failed to cancel job",
      };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }

  async exportToExcel(documentId: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/export/excel`,
        {
          method: "GET",
          headers: {
            ...this.getAuthHeaders(),
            // Remove Content-Type for blob response
            "Content-Type": undefined,
          } as HeadersInit,
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        return { success: true, data: blob };
      }

      // Handle authentication errors
      if (response.status === 401) {
        const hadValidToken = !!localStorage.getItem("auth_token");
        handleAuthError(hadValidToken);
        return {
          success: false,
          error: "Authentication expired. Please log in again.",
        };
      }

      const errorData = await response
        .json()
        .catch(() => ({ error: "Export failed" }));
      return {
        success: false,
        error: errorData.error || "Failed to export to Excel",
      };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }
}

export const apiService = new ApiService();
