import React, { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Divider,
  ScrollShadow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useWebSocketStore } from "../../stores/useWebSocketStore";

const RealTimeNotifications: React.FC = () => {
  const { t } = useTranslation();
  const { notifications, markNotificationRead, clearNotifications } =
    useWebSocketStore();

  // Request notification permission on component mount
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
        /* ignore */
      });
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job-completed":
        return "mdi:check-circle";
      case "job-failed":
        return "mdi:alert-circle";
      case "queue-alert":
        return "mdi:clock-alert";
      case "system-alert":
        return "mdi:server-network";
      default:
        return "mdi:bell";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "job-completed":
        return "success";
      case "job-failed":
        return "danger";
      case "queue-alert":
        return "warning";
      case "system-alert":
        return "danger";
      default:
        return "primary";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (notifications.length === 0) {
    return (
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:bell-outline" className="text-lg" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center text-default-500 py-4">
            <Icon icon="mdi:bell-sleep" className="text-2xl mb-2" />
            <p>No notifications yet</p>
            <p className="text-sm">You'll see real-time updates here</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-divider">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:bell" className="text-lg" />
            <h3 className="text-lg font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Chip size="sm" color="primary" variant="solid">
                {unreadCount}
              </Chip>
            )}
          </div>

          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="light"
              color="default"
              onPress={clearNotifications}
              startContent={<Icon icon="mdi:delete-sweep" />}
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody className="p-0">
        <ScrollShadow className="max-h-96">
          <div className="p-4 space-y-3">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.read
                      ? "bg-content2/30 hover:bg-content2/50"
                      : "bg-primary/10 hover:bg-primary/20 border border-primary/20"
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon
                      icon={getNotificationIcon(notification.type)}
                      className={`text-lg ${
                        notification.read
                          ? "text-default-400"
                          : `text-${getNotificationColor(notification.type)}`
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-sm font-medium ${
                          notification.read
                            ? "text-default-600"
                            : "text-foreground"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <span className="text-xs text-default-400 flex-shrink-0">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>

                    <p
                      className={`text-sm mt-1 ${
                        notification.read
                          ? "text-default-500"
                          : "text-default-700"
                      }`}
                    >
                      {notification.message}
                    </p>

                    {notification.jobId && (
                      <div className="mt-2">
                        <Chip
                          size="sm"
                          color={getNotificationColor(notification.type)}
                          variant="flat"
                        >
                          Job: {notification.jobId.slice(-8)}
                        </Chip>
                      </div>
                    )}
                  </div>

                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>

                {index < notifications.length - 1 && (
                  <Divider className="my-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
};

export default RealTimeNotifications;
