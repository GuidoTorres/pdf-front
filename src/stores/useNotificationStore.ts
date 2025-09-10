import { create } from "zustand";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds
  persistent?: boolean; // won't auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  success: (title: string, message?: string, options?: Partial<Notification>) => void;
  error: (title: string, message?: string, options?: Partial<Notification>) => void;
  warning: (title: string, message?: string, options?: Partial<Notification>) => void;
  info: (title: string, message?: string, options?: Partial<Notification>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      id,
      duration: 5000, // default 5 seconds
      ...notification,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-dismiss if not persistent
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  // Convenience methods
  success: (title, message, options) => {
    get().addNotification({
      type: "success",
      title,
      message,
      ...options,
    });
  },

  error: (title, message, options) => {
    get().addNotification({
      type: "error",
      title,
      message,
      persistent: true, // errors should be persistent by default
      ...options,
    });
  },

  warning: (title, message, options) => {
    get().addNotification({
      type: "warning",
      title,
      message,
      duration: 7000, // warnings last a bit longer
      ...options,
    });
  },

  info: (title, message, options) => {
    get().addNotification({
      type: "info",
      title,
      message,
      ...options,
    });
  },
}));