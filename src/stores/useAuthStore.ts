import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  signInWithPassword,
  signUpWithPassword,
  signOut,
} from "../services/auth";
import {
  apiService,
  setAuthExpiredHandler,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
} from "../services/api";
import { NavigateFunction } from "react-router-dom";
import { useNotificationStore } from "./useNotificationStore";

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
  plan?: string;
  pages_remaining?: number;
  subscription?: {
    plan: string;
    pages_remaining: number;
    expires_at?: string;
    renewed_at?: string;
    next_reset?: string;
    total_pages_used?: number;
    pages_used_this_month?: number;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRehydrated: boolean;
  navigate: NavigateFunction | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  initialize: (navigate?: NavigateFunction) => () => void;
  setNavigate: (navigate: NavigateFunction) => void;
  handleAuthExpired: () => void;
  handleGoogleLoginSuccess: (data: { user: User; token: string }) => void;
  updateUserPages: (pagesDeducted: number, remainingPages?: number) => void;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isRehydrated: false, // Add this
      navigate: null,

      setNavigate: (navigate) => set({ navigate }),

      initialize: (navigate) => {
        if (navigate) {
          get().setNavigate(navigate);
        }

        // Configure API service auth expired handler
        setAuthExpiredHandler(() => {
          get().handleAuthExpired();
        });

        const checkInitialSession = async () => {
          try {
            await new Promise<void>((resolve) => {
              const unsubscribe = useAuthStore.subscribe((state) => {
                if (state.isRehydrated) {
                  unsubscribe();
                  resolve();
                }
              });
            });

            const token = getAuthToken();
            const currentState = get();

            if (currentState.isAuthenticated && currentState.user && !token) {
              console.warn("[AUTH] Persisted auth without token; clearing state");
              clearAuthToken();
              set({ isLoading: false, isAuthenticated: false, user: null });
              return;
            }

            if (token) {
              await get().checkAuth();
            } else {
              set({ isLoading: false, isAuthenticated: false, user: null });
            }
          } catch (error) {
            console.error("Error checking initial session:", error);
            set({ isLoading: false, isAuthenticated: false, user: null });
          }
        };

        checkInitialSession();

        return () => {
          // No cleanup needed for JWT-based auth
        };
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const data = await signInWithPassword(email, password);
          if (data.success && data.user) {
            if (data.token) {
              setAuthToken(data.token);
            }
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true });
        try {
          const data = await signUpWithPassword(email, password, name);
          if (data.success && data.user) {
            if (data.token) {
              setAuthToken(data.token);
            }
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error("Register error:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          // Google auth is handled by the GoogleSignInButton component
          // This method is kept for compatibility
          return true;
        } catch (error) {
          console.error("Google login error:", error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await signOut();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          clearAuthToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          const { navigate } = get();
          if (navigate) {
            navigate("/login");
          }
        }
      },

      checkAuth: async () => {
        const token = getAuthToken();
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await apiService.getCurrentUser();
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            clearAuthToken();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          clearAuthToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      handleAuthExpired: () => {
        // Show notification
        useNotificationStore
          .getState()
          .warning(
            "Session Expired",
            "Your session has expired. Please log in again."
          );

        clearAuthToken();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        const { navigate } = get();
        if (navigate) {
          navigate("/login");
        }
      },

      handleGoogleLoginSuccess: (data) => {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        setAuthToken(data.token);
      },

      // Add method to update user pages in real-time
      updateUserPages: (pagesDeducted: number, remainingPages?: number) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = {
          ...currentUser,
          pages_remaining:
            remainingPages ??
            (currentUser.pages_remaining || 0) - pagesDeducted,
          subscription: currentUser.subscription
            ? {
                ...currentUser.subscription,
                pages_remaining:
                  remainingPages ??
                  (currentUser.subscription.pages_remaining || 0) -
                    pagesDeducted,
              }
            : undefined,
        };

        set({ user: updatedUser });
        localStorage.setItem("user", JSON.stringify(updatedUser));
      },

      // Add method to refresh user data
      refreshUserData: async () => {
        try {
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            set({ user: response.data });
            localStorage.setItem("user", JSON.stringify(response.data));
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isRehydrated = true;
        }
      },
    }
  )
);
