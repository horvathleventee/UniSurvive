"use client";

import { useEffect, useState } from "react";
import { Check, Moon, Palette, Sun, RotateCcw } from "lucide-react";

import {
  applyCustomColors,
  applyThemePreference,
  clearCustomColors,
  THEME_PRESETS,
  type ExtendedPresetId,
  type RGB,
  type ThemePresetId,
} from "@/components/theme-hydrator";

// ── Preset preview swatches ────────────────────────────────────────────────
const PRESET_PALETTE: Record<
  ThemePresetId,
  { light: { bg: string; primary: string; accent: string }; dark: { bg: string; primary: string; accent: string } }
> = {
  default: {
    light: { bg: "#f9f7f2", primary: "#1e3a5f", accent: "#fbbf24" },
    dark:  { bg: "#111827", primary: "#94a3b8", accent: "#92400e" },
  },
  ocean: {
    light: { bg: "#eff6ff", primary: "#1e3a8a", accent: "#67e8f9" },
    dark:  { bg: "#0a1628", primary: "#38bdf8", accent: "#0e7490" },
  },
  sunset: {
    light: { bg: "#fff7ed", primary: "#7c2d12", accent: "#c084fc" },
    dark:  { bg: "#1a0a06", primary: "#fb923c", accent: "#7e22ce" },
  },
  forest: {
    light: { bg: "#f0fdf4", primary: "#14532d", accent: "#bef264" },
    dark:  { bg: "#071a0e", primary: "#4ade80", accent: "#3f6212" },
  },
  mono: {
    light: { bg: "#f8f8f8", primary: "#171717", accent: "#d4d4d4" },
    dark:  { bg: "#111111", primary: "#e5e5e5", accent: "#404040" },
  },
};

const CUSTOM_DEFAULTS: { bg: RGB; primary: RGB; accent: RGB } = {
  bg:      { r: 240, g: 245, b: 255 },
  primary: { r: 30,  g: 64,  b: 175 },
  accent:  { r: 251, g: 191, b: 36  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function rgbToHex({ r, g, b }: RGB) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): RGB | null {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m || m.length < 3) return null;
  return { r: parseInt(m[0]!, 16), g: parseInt(m[1]!, 16), b: parseInt(m[2]!, 16) };
}

// ── RgbPicker sub-component ────────────────────────────────────────────────
function RgbPicker({
  label,
  badge,
  value,
  onChange,
}: {
  label: string;
  badge: string;
  value: RGB;
  onChange: (v: RGB) => void;
}) {
  const hex = rgbToHex(value);

  const channels: { ch: keyof RGB; label: string; grad: string }[] = [
    {
      ch: "r",
      label: "R",
      grad: `linear-gradient(to right, rgb(0,${value.g},${value.b}), rgb(255,${value.g},${value.b}))`,
    },
    {
      ch: "g",
      label: "G",
      grad: `linear-gradient(to right, rgb(${value.r},0,${value.b}), rgb(${value.r},255,${value.b}))`,
    },
    {
      ch: "b",
      label: "B",
      grad: `linear-gradient(to right, rgb(${value.r},${value.g},0), rgb(${value.r},${value.g},255))`,
    },
  ];

  const channelColors = { r: "#ef4444", g: "#22c55e", b: "#3b82f6" };

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm">
      {/* Header: swatch + label + hex */}
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-xl border border-black/10 shadow-sm transition-all duration-150"
          style={{ backgroundColor: hex }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{badge}</p>
          <p className="text-sm font-semibold">{label}</p>
        </div>
      </div>

      {/* Hex input + native color picker */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">#</span>
          <input
            type="text"
            value={hex.slice(1).toUpperCase()}
            onChange={(e) => {
              const rgb = hexToRgb("#" + e.target.value);
              if (rgb) onChange(rgb);
            }}
            maxLength={6}
            className="w-full rounded-xl border border-border/60 bg-background py-2 pl-7 pr-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="F0F5FF"
          />
        </div>
        <label
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm transition-all hover:border-primary/40"
          title="Szín kiválasztása"
        >
          <input
            type="color"
            value={hex}
            onChange={(e) => {
              const rgb = hexToRgb(e.target.value);
              if (rgb) onChange(rgb);
            }}
            className="h-8 w-8 cursor-pointer border-0 bg-transparent p-0.5 opacity-0 absolute"
          />
          <div className="h-5 w-5 rounded-md border border-black/10" style={{ backgroundColor: hex }} />
        </label>
      </div>

      {/* RGB sliders */}
      <div className="space-y-3">
        {channels.map(({ ch, label: chLabel, grad }) => (
          <div key={ch} className="flex items-center gap-3">
            <span
              className="w-4 shrink-0 text-center text-[11px] font-bold"
              style={{ color: channelColors[ch] }}
            >
              {chLabel}
            </span>
            <input
              type="range"
              min={0}
              max={255}
              value={value[ch]}
              onChange={(e) => onChange({ ...value, [ch]: Number(e.target.value) })}
              className="rgb-slider flex-1"
              style={{ "--slider-track": grad } as React.CSSProperties}
            />
            <span className="w-7 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
              {value[ch]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ThemeCustomizer ───────────────────────────────────────────────────
export function ThemeCustomizer() {
  const [activePreset, setActivePreset] = useState<ExtendedPresetId>("default");
  const [isDark, setIsDark] = useState(false);
  const [tab, setTab] = useState<"presets" | "custom">("presets");
  const [custom, setCustom] = useState(CUSTOM_DEFAULTS);

  useEffect(() => {
    try {
      const savedPreset = (localStorage.getItem("unisurvive-preset") ?? "default") as ExtendedPresetId;
      const savedMode = localStorage.getItem("unisurvive-theme");
      setActivePreset(savedPreset);
      setIsDark(
        savedMode === "dark" ||
          (!savedMode && window.matchMedia("(prefers-color-scheme: dark)").matches),
      );
      if (savedPreset === "custom") {
        setTab("custom");
        const bg = JSON.parse(localStorage.getItem("unisurvive-custom-bg") ?? "null") as RGB | null;
        const primary = JSON.parse(localStorage.getItem("unisurvive-custom-primary") ?? "null") as RGB | null;
        const accent = JSON.parse(localStorage.getItem("unisurvive-custom-accent") ?? "null") as RGB | null;
        if (bg && primary && accent) setCustom({ bg, primary, accent });
      }
    } catch {}
  }, []);

  function selectPreset(preset: ThemePresetId) {
    setActivePreset(preset);
    clearCustomColors();
    applyThemePreference(preset, isDark);
  }

  function activateCustom(colors = custom) {
    setActivePreset("custom");
    applyThemePreference("custom", isDark);
    applyCustomColors(colors.bg, colors.primary, colors.accent);
  }

  function toggleMode(dark: boolean) {
    setIsDark(dark);
    if (activePreset === "custom") {
      applyThemePreference("custom", dark);
      applyCustomColors(custom.bg, custom.primary, custom.accent);
    } else {
      applyThemePreference(activePreset, dark);
    }
  }

  function updateCustom(key: keyof typeof custom, value: RGB) {
    const next = { ...custom, [key]: value };
    setCustom(next);
    if (activePreset === "custom") {
      applyCustomColors(next.bg, next.primary, next.accent);
    }
  }

  function resetCustom() {
    setCustom(CUSTOM_DEFAULTS);
    if (activePreset === "custom") {
      applyCustomColors(CUSTOM_DEFAULTS.bg, CUSTOM_DEFAULTS.primary, CUSTOM_DEFAULTS.accent);
    }
  }

  const modeKey = isDark ? "dark" : "light";

  // Colors to use in the 60-30-10 preview bar
  const previewColors =
    activePreset === "custom"
      ? {
          bg: rgbToHex(custom.bg),
          primary: rgbToHex(custom.primary),
          accent: rgbToHex(custom.accent),
        }
      : (PRESET_PALETTE[activePreset as ThemePresetId]?.[modeKey] ??
        PRESET_PALETTE.default[modeKey]);

  return (
    <div className="space-y-8">
      {/* ── Mode toggle ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Megjelenési mód</p>
        <div className="grid max-w-xs grid-cols-2 gap-3">

          {/* Light card */}
          <button
            type="button"
            onClick={() => toggleMode(false)}
            className={`group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
              !isDark
                ? "border-yellow-400/80 shadow-[0_0_22px_rgba(250,204,21,0.3)]"
                : "border-transparent hover:border-yellow-300/40"
            }`}
            style={{
              background: "linear-gradient(145deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
            }}
          >
            <div className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full bg-yellow-300/50 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-70" />
            <div className="relative space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/40">
                <Sun className="h-5 w-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-yellow-900">Nappali</p>
                <p className="text-[11px] text-yellow-700/70">Világos felületek</p>
              </div>
            </div>
            {!isDark && (
              <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 shadow-sm">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </button>

          {/* Dark card */}
          <button
            type="button"
            onClick={() => toggleMode(true)}
            className={`group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isDark
                ? "border-indigo-500/80 shadow-[0_0_22px_rgba(99,102,241,0.28)]"
                : "border-transparent hover:border-indigo-400/30"
            }`}
            style={{
              background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 55%, #2d2a8a 100%)",
            }}
          >
            {/* star dots */}
            {[
              [18, 16], [52, 26], [36, 52], [70, 12], [10, 60], [82, 40],
            ].map(([x, y], i) => (
              <div
                key={i}
                className="absolute h-[3px] w-[3px] rounded-full bg-white/80"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            ))}
            <div className="pointer-events-none absolute -left-5 -bottom-5 h-20 w-20 rounded-full bg-indigo-600/30 blur-2xl" />
            <div className="relative space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/30">
                <Moon className="h-5 w-5 text-indigo-200" />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-100">Éjjeli</p>
                <p className="text-[11px] text-indigo-300/70">Sötét felületek</p>
              </div>
            </div>
            {isDark && (
              <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 shadow-sm">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex gap-1 w-fit rounded-xl border border-border/60 bg-muted/30 p-1">
          {[
            { id: "presets" as const, label: "Sémák" },
            { id: "custom"  as const, label: "Egyedi", icon: Palette },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon && <t.icon className="h-3.5 w-3.5" />}
              {t.label}
              {t.id === "custom" && activePreset === "custom" && (
                <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* ── Presets tab ──────────────────────────────────────────── */}
        {tab === "presets" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {THEME_PRESETS.map((preset) => {
              const palette = PRESET_PALETTE[preset.id][modeKey];
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset.id)}
                  className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "border-primary shadow-[0_0_16px_rgba(0,0,0,0.12)]"
                      : "border-border/50 hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  {/* color preview */}
                  <div className="relative h-20 w-full" style={{ backgroundColor: palette.bg }}>
                    <div className="absolute bottom-0 left-0 right-0 h-full"
                      style={{
                        background: `linear-gradient(135deg, ${palette.bg} 40%, ${palette.primary}33 100%)`,
                      }}
                    />
                    {/* color circles */}
                    <div className="absolute bottom-3 right-3 flex gap-1.5">
                      <div
                        className="h-5 w-5 rounded-full border-2 border-white/40 shadow"
                        style={{ backgroundColor: palette.primary }}
                      />
                      <div
                        className="h-4 w-4 rounded-full border-2 border-white/40 shadow self-end"
                        style={{ backgroundColor: palette.accent }}
                      />
                    </div>
                  </div>

                  {/* label + mini bar */}
                  <div
                    className="flex items-center justify-between border-t px-3 py-2.5"
                    style={{
                      backgroundColor: palette.bg,
                      borderColor: `${palette.primary}22`,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: palette.primary }}>
                      {preset.label}
                    </span>
                    <div className="flex h-2 w-8 overflow-hidden rounded-full border border-black/10">
                      <div className="w-[60%]" style={{ backgroundColor: palette.bg }} />
                      <div className="w-[30%]" style={{ backgroundColor: palette.primary }} />
                      <div className="w-[10%]" style={{ backgroundColor: palette.accent }} />
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Custom tab ───────────────────────────────────────────── */}
        {tab === "custom" && (
          <div className="space-y-5">
            {/* Live preview + apply */}
            <div className="flex items-center gap-4">
              <div className="flex-1 overflow-hidden rounded-xl border border-border/60 shadow-sm">
                <div className="flex h-12">
                  <div
                    className="flex w-[60%] items-center justify-center text-xs font-semibold"
                    style={{
                      backgroundColor: rgbToHex(custom.bg),
                      color: rgbToHex(custom.primary),
                    }}
                  >
                    60%
                  </div>
                  <div
                    className="flex w-[30%] items-center justify-center text-xs font-semibold"
                    style={{
                      backgroundColor: rgbToHex(custom.primary),
                      color: rgbToHex(custom.bg),
                    }}
                  >
                    30%
                  </div>
                  <div
                    className="w-[10%]"
                    style={{ backgroundColor: rgbToHex(custom.accent) }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={resetCustom}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                  title="Visszaállítás alapértékre"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => activateCustom()}
                  className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                    activePreset === "custom"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 text-foreground hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  {activePreset === "custom" ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Aktív
                    </>
                  ) : (
                    "Alkalmaz"
                  )}
                </button>
              </div>
            </div>

            {activePreset !== "custom" && (
              <p className="text-xs text-muted-foreground">
                Állítsd be a színeket, majd kattints az{" "}
                <span className="font-semibold text-foreground">Alkalmaz</span> gombra.
              </p>
            )}

            {/* 3 RGB pickers */}
            <div className="grid gap-4 md:grid-cols-3">
              <RgbPicker
                label="Háttér"
                badge="60% — Fő szín"
                value={custom.bg}
                onChange={(v) => updateCustom("bg", v)}
              />
              <RgbPicker
                label="Elsődleges"
                badge="30% — Gombok"
                value={custom.primary}
                onChange={(v) => updateCustom("primary", v)}
              />
              <RgbPicker
                label="Hangsúly"
                badge="10% — Kiemelés"
                value={custom.accent}
                onChange={(v) => updateCustom("accent", v)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 60-30-10 rule explanation ────────────────────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
        <p className="mb-4 text-sm font-semibold">60 – 30 – 10 szabály</p>
        <div className="mb-4 overflow-hidden rounded-xl shadow-sm">
          <div className="flex h-14">
            {[
              { w: "60%", bg: previewColors.bg,      fg: previewColors.primary, label: "60%" },
              { w: "30%", bg: previewColors.primary,  fg: previewColors.bg,      label: "30%" },
              { w: "10%", bg: previewColors.accent,   fg: previewColors.primary, label: "10%" },
            ].map((seg) => (
              <div
                key={seg.w}
                className="flex items-center justify-center text-xs font-semibold"
                style={{ width: seg.w, backgroundColor: seg.bg, color: seg.fg }}
              >
                {seg.label}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div>
            <p className="mb-1 font-semibold text-foreground">Fő szín (60%)</p>
            <p>Háttér és felületek — semleges, könnyű a szemnek.</p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-foreground">Másodlagos (30%)</p>
            <p>Szövegek, gombok — kontrasztot teremtenek.</p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-foreground">Hangsúly (10%)</p>
            <p>Kiemelések, ikonok — figyelemfelkeltő.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


const PREVIEW_COLORS: Record<
  string,
  { light: { bg: string; primary: string; accent: string }; dark: { bg: string; primary: string; accent: string } }
> = {
  default: {
    light: { bg: "#f8f6f1", primary: "#1a2540", accent: "#fde68a" },
    dark:  { bg: "#111827", primary: "#e2e8f0", accent: "#78350f" },
  },
  ocean: {
    light: { bg: "#f0f7ff", primary: "#1a3a6b", accent: "#a5f3fc" },
    dark:  { bg: "#0d1829", primary: "#67d8f5", accent: "#164e63" },
  },
  sunset: {
    light: { bg: "#fff7ef", primary: "#7c2d12", accent: "#e9d5ff" },
    dark:  { bg: "#180d08", primary: "#fb923c", accent: "#581c87" },
  },
  forest: {
    light: { bg: "#f2faf4", primary: "#14532d", accent: "#d9f99d" },
    dark:  { bg: "#071a0f", primary: "#4ade80", accent: "#365314" },
  },
  mono: {
    light: { bg: "#f7f7f7", primary: "#1a1a1a", accent: "#d4d4d4" },
    dark:  { bg: "#141414", primary: "#ebebeb", accent: "#3a3a3a" },
  },
};

export function ThemeCustomizer() {
  const [activePreset, setActivePreset] = useState<ThemePresetId>("default");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const savedPreset = (window.localStorage.getItem("unisurvive-preset") ?? "default") as ThemePresetId;
      const savedMode = window.localStorage.getItem("unisurvive-theme");
      setActivePreset(savedPreset);
      setIsDark(savedMode === "dark" || (!savedMode && window.matchMedia("(prefers-color-scheme: dark)").matches));
    } catch {}
  }, []);

  function selectPreset(preset: ThemePresetId) {
    setActivePreset(preset);
    applyThemePreference(preset, isDark);
  }

  function toggleMode(dark: boolean) {
    setIsDark(dark);
    applyThemePreference(activePreset, dark);
  }

  return (
    <div className="space-y-8">
      {/* mode switcher */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Megjelenési mód</p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={!isDark ? "default" : "outline"}
            size="sm"
            onClick={() => toggleMode(false)}
            className="gap-2"
          >
            <Sun className="h-4 w-4" />
            Világos
          </Button>
          <Button
            type="button"
            variant={isDark ? "default" : "outline"}
            size="sm"
            onClick={() => toggleMode(true)}
            className="gap-2"
          >
            <Moon className="h-4 w-4" />
            Sötét
          </Button>
        </div>
      </div>

      {/* preset grid */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Színséma</p>
        <p className="text-xs text-muted-foreground">
          A 60-30-10 arány szerint: a háttér (60%), az elsődleges szín (30%) és a hangsúlyszín (10%) változik.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {THEME_PRESETS.map((preset) => {
            const colors = PREVIEW_COLORS[preset.id];
            const modeColors = isDark ? colors.dark : colors.light;
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset.id)}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${
                  isActive ? "border-primary shadow-md" : "border-border/60 hover:border-primary/40"
                }`}
              >
                {/* 60-30-10 visual bar */}
                <div className="flex h-20 w-full">
                  <div className="w-[60%]" style={{ backgroundColor: modeColors.bg }} />
                  <div className="w-[30%]" style={{ backgroundColor: modeColors.primary }} />
                  <div className="w-[10%]" style={{ backgroundColor: modeColors.accent }} />
                </div>

                {/* label */}
                <div
                  className="border-t p-2 text-center text-xs font-medium"
                  style={{
                    backgroundColor: modeColors.bg,
                    color: modeColors.primary,
                    borderColor: `${modeColors.primary}30`,
                  }}
                >
                  {preset.label}
                </div>

                {/* active checkmark */}
                {isActive && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 60-30-10 explanation */}
      <div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
        <p className="mb-3 text-sm font-medium">60 – 30 – 10 szabály</p>
        <div className="flex gap-0 overflow-hidden rounded-xl">
          <div className="flex h-12 w-[60%] items-center justify-center text-xs font-medium" style={{ backgroundColor: PREVIEW_COLORS[activePreset]?.[isDark ? "dark" : "light"].bg, color: PREVIEW_COLORS[activePreset]?.[isDark ? "dark" : "light"].primary }}>
            60%
          </div>
          <div className="flex h-12 w-[30%] items-center justify-center text-xs font-medium" style={{ backgroundColor: PREVIEW_COLORS[activePreset]?.[isDark ? "dark" : "light"].primary, color: PREVIEW_COLORS[activePreset]?.[isDark ? "dark" : "light"].bg }}>
            30%
          </div>
          <div className="flex h-12 w-[10%] items-center justify-center text-xs font-medium" style={{ backgroundColor: PREVIEW_COLORS[activePreset]?.[isDark ? "dark" : "light"].accent }}>
            10%
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <p><span className="font-medium text-foreground">Fő szín (60%)</span><br />Háttér és felületek — semleges, könnyű a szemnek.</p>
          <p><span className="font-medium text-foreground">Másodlagos (30%)</span><br />Szövegek, gombok — kontrasztot teremtenek.</p>
          <p><span className="font-medium text-foreground">Hangsúly (10%)</span><br />Kiemelések, ikonok — figyelemfelkeltő.</p>
        </div>
      </div>
    </div>
  );
}
