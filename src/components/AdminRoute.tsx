import React from "react";
import { Navigate } from "react-router-dom";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuthStore } from "../stores/useAuthStore";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  const isAdmin = user?.isAdmin === true;

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <Card className="max-w-md w-full bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="text-center py-8">
            <Icon
              icon="mdi:shield-alert"
              className="text-6xl text-danger mb-4 mx-auto"
            />
            <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-default-600 mb-6">
              No tienes permisos de administrador para acceder a esta página.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="px-4 py-2 bg-default-100 text-default-700 rounded-lg hover:bg-default-200 transition-colors"
              >
                Ir al Dashboard
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
