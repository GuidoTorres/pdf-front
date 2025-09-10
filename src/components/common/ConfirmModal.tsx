import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
}) => {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return "lucide:trash-2";
      case "warning":
        return "lucide:alert-triangle";
      case "info":
        return "lucide:info";
      default:
        return "lucide:help-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "danger":
        return "text-danger";
      case "warning":
        return "text-warning";
      case "info":
        return "text-primary";
      default:
        return "text-default-500";
    }
  };

  const getConfirmColor = () => {
    switch (type) {
      case "danger":
        return "danger";
      case "warning":
        return "warning";
      case "info":
        return "primary";
      default:
        return "default";
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="sm"
      backdrop="opaque"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-default-100 ${getIconColor()}`}>
              <Icon icon={getIcon()} className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-default-600 leading-relaxed">{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="default" 
            variant="light" 
            onPress={onClose}
            className="font-medium"
          >
            {cancelText}
          </Button>
          <Button 
            color={getConfirmColor() as any} 
            onPress={handleConfirm}
            className="font-medium"
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;