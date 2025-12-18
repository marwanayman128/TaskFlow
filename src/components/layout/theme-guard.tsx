'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export function ThemeGuard({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    // Ensure theme is applied to document
    if (theme) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return <>{children}</>;
}