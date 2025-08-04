import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService, User } from '../services/api';
import { supabase, signInWithGoogle as supabaseSignInWithGoogle } from '../services/supabase';
import { NavigateFunction } from 'react-router-dom';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  navigate: NavigateFunction | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  initialize: (navigate?: NavigateFunction) => () => void;
  setNavigate: (navigate: NavigateFunction) => void;
  handleSupabaseSession: (session: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      navigate: null,

      setNavigate: (navigate) => set({ navigate }),

      initialize: (navigate) => {
        if (navigate) {
          get().setNavigate(navigate);
        }
        
        const checkInitialSession = async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              await get().handleSupabaseSession(session);
            } else {
              await get().checkAuth();
            }
          } catch (error) {
            console.error('Error checking initial session:', error);
            set({ isLoading: false });
          }
        };

        checkInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN' && session) {
              await get().handleSupabaseSession(session);
            } else if (event === 'SIGNED_OUT') {
              localStorage.removeItem('auth_token');
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            } else if (event === 'TOKEN_REFRESHED' && session) {
              await get().handleSupabaseSession(session);
            }
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      },

      handleSupabaseSession: async (session: any) => {
        console.log('[AuthStore] Handling Supabase session. Calling backend...');
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              supabaseToken: session.access_token,
              user: session.user,
            }),
          });

          console.log(`[AuthStore] Backend response status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log('[AuthStore] Backend response data:', data);

            if (data.success && data.token) {
              console.log('[AuthStore] Backend login successful. Setting token and user state.');
              localStorage.setItem('auth_token', data.token);
              set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
              });
              
              const { navigate } = get();
              if (navigate) {
                const currentPath = window.location.pathname;
                if (currentPath === '/login' || currentPath === '/signup') {
                  console.log('[AuthStore] Navigate function found. Redirecting to /');
                  navigate('/');
                } else {
                  console.log('[AuthStore] User already on a protected route. No redirect needed.');
                }
              } else {
                console.error('[AuthStore] Navigate function not found!');
              }
            } else {
              console.error('[AuthStore] Backend returned an error:', data);
              set({ isLoading: false });
            }
          } else {
            const errorText = await response.text();
            console.error('[AuthStore] Backend call failed:', errorText);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('[AuthStore] Critical error in handleSupabaseSession:', error);
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiService.login(email, password);
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true });
        try {
          const response = await apiService.register(email, password, name);
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          await supabaseSignInWithGoogle();
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        supabase.auth.signOut();
        apiService.logout();
        set({
          user: null,
          isAuthenticated: false,
        });
        const { navigate } = get();
        if (navigate) {
          navigate('/login');
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('auth_token');
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
            localStorage.removeItem('auth_token');
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          localStorage.removeItem('auth_token');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);