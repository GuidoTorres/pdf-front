import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

interface PageDeductionNotificationProps {
  pagesDeducted: number;
  remainingPages: number;
  fileName: string;
  onClose: () => void;
}

const PageDeductionNotification: React.FC<PageDeductionNotificationProps> = ({
  pagesDeducted,
  remainingPages,
  fileName,
  onClose,
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 5000); // Show for 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
    >
      <Card className="bg-gradient-to-r from-success-50 to-primary-50 border border-success-200 shadow-lg max-w-sm">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-success-200 rounded-lg flex-shrink-0">
              <Icon
                icon="lucide:check-circle"
                className="text-success text-xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-success-800">
                  Document Processed Successfully
                </h4>
                <button
                  onClick={handleClose}
                  className="text-default-400 hover:text-default-600 transition-colors"
                >
                  <Icon icon="lucide:x" className="text-sm" />
                </button>
              </div>
              <p
                className="text-xs text-default-600 mb-2 truncate"
                title={fileName}
              >
                {fileName}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Icon
                    icon="lucide:minus-circle"
                    className="text-warning text-sm"
                  />
                  <span className="text-warning-700">
                    -{pagesDeducted} {pagesDeducted === 1 ? "page" : "pages"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon
                    icon="lucide:file-text"
                    className="text-primary text-sm"
                  />
                  <span className="text-primary-700">
                    {remainingPages} remaining
                  </span>
                </div>
              </div>
              {remainingPages <= 5 && (
                <div className="mt-2 p-2 bg-warning-100 rounded-md">
                  <p className="text-xs text-warning-800 flex items-center gap-1">
                    <Icon icon="lucide:alert-triangle" className="text-sm" />
                    Low pages remaining! Consider upgrading your plan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PageDeductionNotification;
