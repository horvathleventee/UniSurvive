"use client";

import { useEffect } from "react";

export function ThemeHydrator() {
  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("unisurvive-theme");
      const theme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.classList.toggle("dark", theme === "dark");
    } catch {}
  }, []);

  return null;
}
