"use client";

import { useEffect } from "react";

export const THEME_PRESETS = [
  { id: "default", label: "Alapértelmezett" },
  { id: "ocean",   label: "Óceán" },
  { id: "sunset",  label: "Naplemente" },
  { id: "forest",  label: "Erdő" },
  { id: "mono",    label: "Monokróm" },
] as const;

export type ThemePresetId = (typeof THEME_PRESETS)[number]["id"];
export type ExtendedPresetId = ThemePresetId | "custom";

export type RGB = { r: number; g: number; b: number };

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslVar(r: number, g: number, b: number) {
  const [h, s, l] = rgbToHsl(r, g, b);
  return `${h} ${s}% ${l}%`;
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
}

export function applyCustomColors(bg: RGB, primary: RGB, accent: RGB) {
  const root = document.documentElement;
  root.style.setProperty("--background", hslVar(bg.r, bg.g, bg.b));
  root.style.setProperty("--card",       hslVar(bg.r, bg.g, bg.b));
  root.style.setProperty("--popover",    hslVar(bg.r, bg.g, bg.b));
  root.style.setProperty("--primary",    hslVar(primary.r, primary.g, primary.b));
  root.style.setProperty("--primary-foreground", luminance(primary.r, primary.g, primary.b) > 0.35 ? "222 47% 8%" : "210 40% 98%");
  root.style.setProperty("--accent",     hslVar(accent.r, accent.g, accent.b));
  root.style.setProperty("--accent-foreground",  luminance(accent.r, accent.g, accent.b) > 0.35  ? "222 47% 8%" : "210 40% 98%");
  try {
    localStorage.setItem("unisurvive-custom-bg",      JSON.stringify(bg));
    localStorage.setItem("unisurvive-custom-primary", JSON.stringify(primary));
    localStorage.setItem("unisurvive-custom-accent",  JSON.stringify(accent));
    localStorage.setItem("unisurvive-preset", "custom");
  } catch {}
}

export function clearCustomColors() {
  const props = ["--background", "--card", "--popover", "--primary", "--primary-foreground", "--accent", "--accent-foreground"];
  props.forEach((p) => document.documentElement.style.removeProperty(p));
}

export function applyThemePreference(preset: ExtendedPresetId, isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  const basePreset: ThemePresetId = preset === "custom" ? "default" : preset;
  root.setAttribute("data-theme", `${basePreset}-${isDark ? "dark" : "light"}`);
  try {
    window.localStorage.setItem("unisurvive-theme", isDark ? "dark" : "light");
    window.localStorage.setItem("unisurvive-preset", preset);
  } catch {}
}

export function ThemeHydrator() {
  useEffect(() => {
    try {
      const savedMode   = window.localStorage.getItem("unisurvive-theme");
      const savedPreset = (window.localStorage.getItem("unisurvive-preset") ?? "default") as ExtendedPresetId;
      const isDark = savedMode
        ? savedMode === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyThemePreference(savedPreset, isDark);
      if (savedPreset === "custom") {
        const bg      = JSON.parse(window.localStorage.getItem("unisurvive-custom-bg")      ?? "null") as RGB | null;
        const primary = JSON.parse(window.localStorage.getItem("unisurvive-custom-primary") ?? "null") as RGB | null;
        const accent  = JSON.parse(window.localStorage.getItem("unisurvive-custom-accent")  ?? "null") as RGB | null;
        if (bg && primary && accent) applyCustomColors(bg, primary, accent);
      }
    } catch {}
  }, []);

  return null;
}
