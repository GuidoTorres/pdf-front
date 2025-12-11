import React, { useEffect } from "react";
import { HeroUIProvider } from "@heroui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import PricingPage from "./pages/PricingPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPage from "./pages/RefundPage";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import LandingLayout from "./components/LandingLayout";
import ConditionalLayout from "./components/ConditionalLayout";
import NotificationProvider from "./components/NotificationProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuthStore } from "./stores/useAuthStore";
import { useWebSocketStore } from "./stores/useWebSocketStore";

const AppInitializer: React.FC = () => {
  const navigate = useNavigate();
  const { initialize, isLoading, isAuthenticated } =
    useAuthStore();
  const { connect: connectWebSocket, disconnect: disconnectWebSocket } =
    useWebSocketStore();

  useEffect(() => {
    const unsubscribe = initialize(navigate);
    return () => unsubscribe();
  }, [initialize, navigate]);

  // Initialize WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const connectTimeout = setTimeout(() => {
        import("./services/api").then(({ getAuthToken }) => {
          const token = getAuthToken();
          if (token) {
            connectWebSocket(token);
          } else {
            disconnectWebSocket();
          }
        });
      }, 200);

      return () => clearTimeout(connectTimeout);
    }

    disconnectWebSocket();
  }, [isAuthenticated, isLoading, connectWebSocket, disconnectWebSocket]);

  useEffect(() => {
    if (typeof Notification === "undefined") {
      return;
    }

    if (isAuthenticated && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
        /* ignore */
      });
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <HeroUIProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <AppInitializer />
          <ErrorBoundary>
            <Routes>
            {/* Public Routes with LandingLayout */}
            <Route
              element={
                <LandingLayout>
                  <Outlet />
                </LandingLayout>
              }
            >
              <Route path="/" element={<LandingPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/pricing" element={<PricingPage />} />
            </Route>

            {/* Legal Routes with ConditionalLayout (accessible to both authenticated and non-authenticated users) */}
            <Route element={<ConditionalLayout />}>
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/refund" element={<RefundPage />} />
            </Route>

            {/* Auth Routes with AuthLayout */}
            <Route
              element={
                <PublicRoute>
                  <AuthLayoutWithOutlet />
                </PublicRoute>
              }
            >
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Route>

            {/* Protected Routes with Main Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <LayoutWithOutlet />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* 404 Page for unmatched routes */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>

          {/* Global Notification System */}
          <NotificationProvider />
        </Router>
      </ThemeProvider>
    </HeroUIProvider>
  );
}

const LayoutWithOutlet: React.FC = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const AuthLayoutWithOutlet: React.FC = () => (
  <AuthLayout>
    <Outlet />
  </AuthLayout>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default App;
