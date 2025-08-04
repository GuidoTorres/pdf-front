const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Transaction {
  id: string;
  post_date: string;
  value_date: string;
  description: string;
  amount: number;
  balance?: number;
  reference?: string;
  category?: string;
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
  };
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private getFormDataHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('auth_token', data.token);
        return { success: true, data };
      }
      
      return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async register(email: string, password: string, name?: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('auth_token', data.token);
        return { success: true, data };
      }
      
      return { success: false, error: data.error || 'Registration failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      }
      
      return { success: false, error: data.error || 'Failed to get user' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async processDocument(file: File, provider: 'docling' | 'traditional' = 'docling'): Promise<ApiResponse<ProcessingResult>> {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('provider', provider);
      
      const response = await fetch(`${API_BASE_URL}/documents/process`, {
        method: 'POST',
        headers: this.getFormDataHeaders(),
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      }
      
      return { success: false, error: data.error || 'Processing failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async getJobStatus(jobId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/status/${jobId}`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      }
      
      return { success: false, error: data.error || 'Failed to get job status' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async getProcessingHistory(): Promise<ApiResponse<ProcessingResult[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/history`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      }
      
      return { success: false, error: data.error || 'Failed to get history' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async deleteDocument(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      }
      
      return { success: false, error: data.error || 'Failed to delete document' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }
}

export const apiService = new ApiService();