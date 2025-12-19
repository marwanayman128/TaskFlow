/**
 * Application Feature Configuration
 * 
 * This file centralizes feature flags that can be toggled via environment variables.
 * Add NEXT_PUBLIC_ prefix for client-side access.
 */

// Localization Configuration
// Set NEXT_PUBLIC_ENABLE_I18N=false in .env to disable locale prefixes in URLs
// When disabled: URLs will be /dashboard instead of /en/dashboard
// When enabled: URLs will be /en/dashboard, /ar/dashboard, etc.
export const ENABLE_I18N = process.env.NEXT_PUBLIC_ENABLE_I18N !== 'false';

// Default locale when i18n is disabled
export const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Integration Configuration
// Integrations default to enabled for demo. Set to 'false' to disable.
export const INTEGRATIONS = {
  // Google Calendar
  GOOGLE_CALENDAR_ENABLED: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ENABLED !== 'false',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  // WhatsApp Notifications (via SendZen)
  WHATSAPP_ENABLED: process.env.NEXT_PUBLIC_WHATSAPP_ENABLED !== 'false',
  // SendZen Configuration
  SENDZEN_API_KEY: process.env.SENDZEN_API_KEY?.trim(),
  SENDZEN_FROM_NUMBER: process.env.SENDZEN_FROM_NUMBER?.trim(),
  // Legacy Twilio (Deprecated)
  WHATSAPP_ACCOUNT_SID: process.env.WHATSAPP_ACCOUNT_SID?.trim(),
  WHATSAPP_AUTH_TOKEN: process.env.WHATSAPP_AUTH_TOKEN?.trim(),
  WHATSAPP_FROM_NUMBER: process.env.WHATSAPP_FROM_NUMBER?.trim(),
  
  // Telegram Notifications
  TELEGRAM_ENABLED: process.env.NEXT_PUBLIC_TELEGRAM_ENABLED !== 'false',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
} as const;

// Premium Features
export const PREMIUM_FEATURES = {
  AI_SUGGESTIONS: process.env.NEXT_PUBLIC_AI_SUGGESTIONS === 'true',
  LOCATION_REMINDERS: process.env.NEXT_PUBLIC_LOCATION_REMINDERS === 'true',
  GANTT_CHART: process.env.NEXT_PUBLIC_GANTT_CHART === 'true',
} as const;

// Helper function to get locale-aware URL
export function getLocalizedUrl(path: string, locale?: string): string {
  if (!ENABLE_I18N) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  const loc = locale || DEFAULT_LOCALE;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/${loc}${normalizedPath}`;
}

// Helper to check if a feature integration is available
export function isIntegrationAvailable(integration: keyof typeof INTEGRATIONS): boolean {
  return !!INTEGRATIONS[integration];
}
