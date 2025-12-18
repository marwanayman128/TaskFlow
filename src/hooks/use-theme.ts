"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  const mounted = useIsClient();

  const currentTheme = theme === "system" ? systemTheme : theme;

  return {
    theme: currentTheme,
    setTheme,
    isDark: mounted ? currentTheme === "dark" : false,
    isLight: mounted ? currentTheme === "light" : false,
    toggleTheme: () => setTheme(currentTheme === "dark" ? "light" : "dark"),
    mounted,
  };
}
