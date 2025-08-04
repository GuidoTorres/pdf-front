import React from "react";
import { useTheme } from "@heroui/use-theme";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      isIconOnly
      variant="light"
      onPress={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Icon
        icon={theme === "light" ? "lucide:moon" : "lucide:sun"}
        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Icon
        icon="lucide:sun"
        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}