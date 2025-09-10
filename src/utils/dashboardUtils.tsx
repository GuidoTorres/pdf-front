import React from "react";
import { Chip, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getStatusChip = (status: string, t: any) => {
  switch (status) {
    case "processing":
      return (
        <Chip color="warning" variant="flat" size="sm">
          {t("dashboard.jobs.processing")}
        </Chip>
      );
    case "completed":
      return (
        <Chip color="success" variant="flat" size="sm">
          {t("dashboard.jobs.completed")}
        </Chip>
      );
    case "failed":
      return (
        <Chip color="danger" variant="flat" size="sm">
          {t("dashboard.jobs.failed")}
        </Chip>
      );
    case "cancelled":
      return (
        <Chip color="default" variant="flat" size="sm">
          Cancelado
        </Chip>
      );
    default:
      return <Chip size="sm">{status}</Chip>;
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "processing":
      return <Spinner size="sm" color="warning" />;
    case "completed":
      return <Icon icon="lucide:check-circle" className="text-success" />;
    case "failed":
      return <Icon icon="lucide:x-circle" className="text-danger" />;
    case "cancelled":
      return <Icon icon="lucide:x-circle" className="text-default-400" />;
    default:
      return null;
  }
};
