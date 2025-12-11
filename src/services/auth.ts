import axios from "axios";
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
} from "./api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.warn("Missing Google Client ID - Google auth will not work");
}

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
// Note: Auth error handling is managed by apiService.ts to avoid conflicts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the individual services handle 401 errors to avoid conflicts
    // The apiService.ts already handles authentication expiration properly
    return Promise.reject(error);
  }
);

export const signInWithPassword = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    // Store token and user data
    setAuthToken(response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};

export const signUpWithPassword = async (
  email: string,
  password: string,
  name?: string
) => {
  try {
    const response = await api.post("/auth/register", {
      email,
      password,
      name,
    });

    // Store token and user data
    setAuthToken(response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Registration failed");
  }
};

export const signOut = async () => {
  try {
    const token = getAuthToken();
    if (token) {
      await api.post("/auth/logout");
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    clearAuthToken();
    localStorage.removeItem("user");
    window.location.href = "/";
  }
};

export const getCurrentUser = async () => {
  const token = getAuthToken();
  const user = localStorage.getItem("user");

  if (!token || !user) return null;

  try {
    // Verify token with backend
    const response = await api.get("/auth/me");

    return response.data.user;
  } catch (error) {
    // Token is invalid, clear storage
    clearAuthToken();
    localStorage.removeItem("user");
    return null;
  }
};

// Initialize Google OAuth
export const initGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error("Google Client ID not configured"));
      return;
    }

    // Load Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      resolve(true);
    };
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
};

// Handle Google OAuth callback
const handleGoogleCallback = async (response: any) => {
  try {
    // Decode JWT token from Google
    const payload = JSON.parse(atob(response.credential.split(".")[1]));

    // Send to our backend
    const result = await api.post("/auth/google-callback", {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });

    // Store token and user data
    localStorage.setItem("auth_token", result.data.token);
    localStorage.setItem("user", JSON.stringify(result.data.user));

    // Redirect or update UI
    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Google auth error:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  if (!window.google) {
    await initGoogleAuth();
  }

  return new Promise((resolve, reject) => {
    window.google?.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to popup
        window.google?.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { theme: "outline", size: "large" }
        );
      }
    });
  });
};
