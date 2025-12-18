"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { NextIntlClientProvider } from 'next-intl';

interface ProvidersProps {
  children: React.ReactNode;
  messages: Record<string, unknown>;
  locale: string;
}

const DEFAULT_TIMEZONE = "UTC";

export function Providers({ children, messages, locale }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <NextIntlClientProvider
          messages={messages}
          locale={locale}
          timeZone={DEFAULT_TIMEZONE}
        >
          {children}
        </NextIntlClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}