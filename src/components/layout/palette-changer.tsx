"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

const PALETTE_STORAGE_KEY = "ui.palette";
const PALETTE_OPTIONS = [
  {
    id: "default",
    label: "Default",
    swatch: ["#171717"]
  },
  {
    id: "ocean",
    label: "Ocean",
    swatch: ["#0ea5e9"]
  },
  {
    id: "terracotta",
    label: "Terracotta",
    swatch: ["#dc2626"]
  },
  {
    id: "botanical",
    label: "Botanical",
    swatch: ["#16a34a"]
  },
  {
    id: "spotify",
    label: "Spotify",
    swatch: ["#1DB954"]
  },
  {
    id: "sunset",
    label: "Sunset",
    swatch: ["rgb(216 121 67)"]
  },
  {
    id: "twitter",
    label: "Twitter",
    swatch: ["rgb(30 157 241)"]
  },
  {
    id: "discord",
    label: "Discord",
    swatch: ["#5865F2"]
  },
  {
    id: "ember",
    label: "Ember",
    swatch: ["#EA580C"]
  },
  {
    id: "slack",
    label: "Slack",
    swatch: ["#611f69"]
  },
];

export function PaletteChanger() {
  const t = useTranslations("theme");
  const [palette, setPalette] = React.useState("ocean");
  const [paletteMounted, setPaletteMounted] = React.useState(false);

  React.useEffect(() => {
    // Get current palette from cookies or localStorage or data attribute
    const getCookie = (name: string) => {
      const value = `;${document.cookie}`;
      const parts = value.split(`;${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const storedPalette = getCookie(PALETTE_STORAGE_KEY) || window.localStorage.getItem(PALETTE_STORAGE_KEY);
    const rootPalette = document.documentElement.dataset.palette;
    const currentPalette = storedPalette || rootPalette || "ocean";
    setPalette(currentPalette);
    setPaletteMounted(true);
  }, []);

  const handlePaletteChange = (newPalette: string) => {
    try {
      // Set cookie (expires in 1 year)
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `${PALETTE_STORAGE_KEY}=${newPalette};expires=${expires.toUTCString()};path=/`;

      // Also set localStorage for backward compatibility
      window.localStorage.setItem(PALETTE_STORAGE_KEY, newPalette);

      // Update DOM data attribute
      document.documentElement.setAttribute('data-palette', newPalette);

      // Update state
      setPalette(newPalette);
    } catch (error) {
      console.warn('Failed to change palette', error);
    }
  };

  return (
    <Select
      value={palette}
      onValueChange={handlePaletteChange}
      disabled={!paletteMounted}
    >
      <SelectTrigger
        size="sm"
        className="w-full justify-between rounded-xl border border-border/70 bg-background/60 text-xs font-medium"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            {PALETTE_OPTIONS.find(option => option.id === palette)?.swatch.map((color) => (
              <span
                key={`trigger-${palette}-${color}`}
                className="h-3 w-3 rounded-full border border-border/60"
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
          <span className="text-sm font-medium">
            {PALETTE_OPTIONS.find(option => option.id === palette)?.label || t("palette")}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent align="end" className="w-48 rounded-2xl">
        {PALETTE_OPTIONS.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                {option.swatch.map((color) => (
                  <span
                    key={`${option.id}-${color}`}
                    className="h-3 w-3 rounded-full border border-border/60"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
              <span className="text-sm font-medium">{option.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}