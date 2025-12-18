'use client';

import { useEffect } from 'react';

interface LocaleSetterProps {
  locale: string;
  dir: string;
}

export function LocaleSetter({ locale, dir }: LocaleSetterProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}