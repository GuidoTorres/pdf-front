import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import Layout from './Layout';
import LandingLayout from './LandingLayout';

/**
 * ConditionalLayout - Layout that switches between authenticated and public layouts
 * based on user authentication status. Used for legal pages that should be accessible
 * from both authenticated and non-authenticated states.
 */
const ConditionalLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // User is authenticated - use the dashboard layout
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }

  // User is not authenticated - use the landing layout
  return (
    <LandingLayout>
      <Outlet />
    </LandingLayout>
  );
};

export default ConditionalLayout;