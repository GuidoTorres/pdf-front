import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
    startContent?: React.ReactNode;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  size = "md",
  className = "",
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "py-8",
          icon: "text-4xl",
          title: "text-lg",
          description: "text-sm",
        };
      case "lg":
        return {
          container: "py-16",
          icon: "text-8xl",
          title: "text-3xl",
          description: "text-lg",
        };
      default: // md
        return {
          container: "py-12",
          icon: "text-6xl",
          title: "text-xl",
          description: "text-base",
        };
    }
  };

  const classes = getSizeClasses();

  return (
    <Card className={`bg-content1/60 backdrop-blur-md border border-divider ${className}`}>
      <CardBody className={`text-center ${classes.container}`}>
        <div className="flex flex-col items-center space-y-4">
          <Icon 
            icon={icon} 
            className={`${classes.icon} text-default-300 mb-2`} 
          />
          
          <div className="space-y-2">
            <h3 className={`${classes.title} font-semibold text-foreground`}>
              {title}
            </h3>
            <p className={`${classes.description} text-default-500 max-w-md mx-auto leading-relaxed`}>
              {description}
            </p>
          </div>

          {action && (
            <Button
              color={action.color || "primary"}
              variant={action.variant || "flat"}
              onClick={action.onClick}
              startContent={action.startContent}
              className="mt-4"
            >
              {action.label}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default EmptyState;