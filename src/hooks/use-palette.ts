"use client";

import * as React from "react";

export const PALETTE_OPTIONS = [
  {
    id: "default",
    swatch: ["#171717", "#404040", "#E5E5E5"],
  },
  {
    id: "terracotta",
    swatch: ["#E05D38", "#FDB99E", "#F6E3D4"],
  },
  {
    id: "botanical",
    swatch: ["#72E3AD", "#0F5F4C", "#E3F8EE"],
  },
  {
    id: "ocean",
    swatch: ["#2B7FFF", "#0F233B", "#E1EDFF"],
  },
  {
    id: "spotify",
    swatch: ["#1DB954", "#191414", "#E8F5E9"],
  },
  {
    id: "sunset",
    swatch: ["#D87943", "#527575", "#F3F4F6"],
  },
  {
    id: "twitter",
    swatch: ["#1E9DF1", "#0F1419", "#E3ECF6"],
  },
  {
    id: "discord",
    swatch: ["#5865F2", "#7289DA", "#DDD6FE"],
  },
  {
    id: "ember",
    swatch: ["#EA580C", "#FB923C", "#FED7AA"],
  },
  {
    id: "slack",
    swatch: ["#611f69", "#E01E5A", "#F4EDE4"],
  },
] as const;

export type PaletteId = (typeof PALETTE_OPTIONS)[number]["id"];

const PALETTE_STORAGE_KEY = "ui.palette";
const DEFAULT_PALETTE: PaletteId = "terracotta";

function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === "string" && PALETTE_OPTIONS.some((option) => option.id === value);
}

export function usePalette() {
  const [palette, setPaletteState] = React.useState<PaletteId>(DEFAULT_PALETTE);
  const [mounted, setMounted] = React.useState(false);

  const applyPalette = React.useCallback((value: PaletteId) => {
    setPaletteState(value);

    if (typeof window !== "undefined") {
      document.documentElement.dataset.palette = value;
      window.localStorage.setItem(PALETTE_STORAGE_KEY, value);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Get the current palette from the DOM (set by PaletteScript)
    const currentPalette = document.documentElement.dataset.palette;
    const stored = window.localStorage.getItem(PALETTE_STORAGE_KEY);

    // Use the stored value if it exists and is valid, otherwise use the current DOM value
    const paletteToUse = isPaletteId(stored) ? stored : (isPaletteId(currentPalette) ? currentPalette : DEFAULT_PALETTE);

    // Only apply if different from what's already set
    if (paletteToUse !== currentPalette) {
      applyPalette(paletteToUse);
    } else {
      setPaletteState(paletteToUse as PaletteId);
    }

    setMounted(true);
  }, [applyPalette]);

  return {
    palette,
    setPalette: applyPalette,
    palettes: PALETTE_OPTIONS,
    mounted,
  };
}
