import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
  variant?: "light" | "bordered" | "solid" | "flat" | "faded" | "shadow" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  variant = "light", 
  size = "md",
  className = "" 
}) => {
  const { i18n } = useTranslation();
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button 
          isIconOnly 
          variant={variant}
          size={size}
          className={className}
          aria-label="Change language"
        >
          <Icon icon="lucide:languages" className="text-xl" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language selection"
        onAction={(key) => i18n.changeLanguage(key as string)}
        selectedKeys={[i18n.language]}
        selectionMode="single"
      >
        <DropdownItem key="en">
          <div className="flex items-center gap-2">
            <Icon icon="twemoji:flag-united-states" className="w-4 h-4" />
            English
          </div>
        </DropdownItem>
        <DropdownItem key="es">
          <div className="flex items-center gap-2">
            <Icon icon="twemoji:flag-spain" className="w-4 h-4" />
            Español
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default LanguageToggle;