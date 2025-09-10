import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import EmptyState from "../components/EmptyState";

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <EmptyState
          icon="lucide:compass"
          title="404 - Page Not Found"
          description="The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL."
          size="lg"
          action={{
            label: "Go Home",
            onClick: () => window.location.href = "/",
            color: "primary",
            startContent: <Icon icon="lucide:home" />
          }}
        />
        
        {/* Additional Navigation */}
        <div className="mt-8 text-center">
          <p className="text-sm text-default-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as={Link}
              to="/dashboard"
              variant="flat"
              color="primary"
              startContent={<Icon icon="lucide:layout-dashboard" />}
            >
              Dashboard
            </Button>
            <Button
              as={Link}
              to="/history"
              variant="flat"
              color="secondary"
              startContent={<Icon icon="lucide:history" />}
            >
              History
            </Button>
            <Button
              as={Link}
              to="/settings"
              variant="flat"
              color="default"
              startContent={<Icon icon="lucide:settings" />}
            >
              Settings
            </Button>
          </div>
        </div>

        {/* Error Code Display */}
        <Card className="mt-8 bg-content1/60 backdrop-blur-md border border-divider">
          <CardBody className="text-center">
            <div className="text-6xl font-bold text-primary opacity-50 mb-2">404</div>
            <p className="text-sm text-default-500">
              If you believe this is an error, please{" "}
              <Link to="/help" className="text-primary hover:underline">
                contact support
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default NotFoundPage;