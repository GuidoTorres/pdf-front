import { useState, useCallback } from "react";

interface PageDeductionInfo {
  id: string;
  pagesDeducted: number;
  remainingPages: number;
  fileName: string;
}

export const usePageDeductionNotifications = () => {
  const [notifications, setNotifications] = useState<PageDeductionInfo[]>([]);

  const addNotification = useCallback(
    (pagesDeducted: number, remainingPages: number, fileName: string) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const notification: PageDeductionInfo = {
        id,
        pagesDeducted,
        remainingPages,
        fileName,
      };

      setNotifications((prev) => [...prev, notification]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};
