import React, { useEffect } from 'react';
import { HeroUIProvider } from "@heroui/react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import { ThemeProvider } from './components/theme-provider';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import PricingPage from "./pages/PricingPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPage from "./pages/RefundPage";
import { useAuthStore } from './stores/useAuthStore';

const AppInitializer: React.FC = () => {
  const navigate = useNavigate();
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    console.log('[DEBUG] Current window location on load:', window.location.href);
    const unsubscribe = initialize(navigate);
    return () => unsubscribe();
  }, [initialize, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

function App() {
  return (
    <HeroUIProvider>
      <ThemeProvider>
        <Router>
          <AppInitializer />
          <Routes>
            <Route path="/" element={<ProtectedRoute><LayoutWithOutlet /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="refund" element={<RefundPage />} />
            </Route>

            <Route path="/" element={<PublicRoute><AuthLayoutWithOutlet /></PublicRoute>}>
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignUpPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default App;
