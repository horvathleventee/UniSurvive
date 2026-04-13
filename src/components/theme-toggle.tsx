"use client";

import { Moon, Sun } from "lucide-react";

import { applyThemePreference, type ExtendedPresetId } from "@/components/theme-hydrator";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    const preset = (window.localStorage.getItem("unisurvive-preset") ?? "default") as ExtendedPresetId;
    applyThemePreference(preset, !isDark);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Téma váltása"
      title="Világos / sötét mód"
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </Button>
  );
}
