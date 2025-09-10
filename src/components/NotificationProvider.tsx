import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Alert, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNotificationStore, Notification, NotificationType } from "../stores/useNotificationStore";

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { removeNotification } = useNotificationStore();

  const getHeroUIColor = (type: NotificationType) => {
    switch (type) {
      case "success": return "success" as const;
      case "error": return "danger" as const;  
      case "warning": return "warning" as const;
      case "info": return "primary" as const;
      default: return "default" as const;
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success": return "lucide:check-circle";
      case "error": return "lucide:x-circle";
      case "warning": return "lucide:alert-triangle";
      case "info": return "lucide:info";
      default: return "lucide:bell";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <Alert
        color={getHeroUIColor(notification.type)}
        title={notification.title}
        description={notification.message}
        icon={<Icon icon={getIcon(notification.type)} />}
        variant="flat"
        className="max-w-sm bg-background/95 backdrop-blur-sm shadow-lg border"
        endContent={
          <div className="flex items-center gap-2">
            {notification.action && (
              <Button
                size="sm"
                color={getHeroUIColor(notification.type)}
                variant="flat"
                onClick={notification.action.onClick}
              >
                {notification.action.label}
              </Button>
            )}
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => removeNotification(notification.id)}
              className="min-w-0 w-6 h-6"
            >
              <Icon icon="lucide:x" className="text-xs" />
            </Button>
          </div>
        }
      />
    </motion.div>
  );
};

const NotificationProvider: React.FC = () => {
  const { notifications, clearAll } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] space-y-3">
      {/* Clear all button */}
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="flat"
            color="default"
            onClick={clearAll}
            startContent={<Icon icon="lucide:x" />}
            className="text-xs"
          >
            Clear All ({notifications.length})
          </Button>
        </div>
      )}

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationProvider;