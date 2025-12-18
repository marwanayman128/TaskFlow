"use client";

import { useEffect } from 'react';

interface DirectionSetterProps {
  dir: 'ltr' | 'rtl';
  locale?: string;
}

export function DirectionSetter({ dir, locale }: DirectionSetterProps) {
  useEffect(() => {
    document.documentElement.dir = dir;
    if (locale) {
      document.documentElement.lang = locale;
    }
  }, [dir, locale]);

  return null;
}