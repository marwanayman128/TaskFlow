import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './src/i18n';

// Check if i18n is enabled via environment variable
const ENABLE_I18N = process.env.NEXT_PUBLIC_ENABLE_I18N !== 'false';
const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: DEFAULT_LOCALE as 'en' | 'ar',
  localePrefix: 'always', // When i18n enabled, always show locale prefix
});

// Simple middleware that doesn't add locale prefix
function noI18nMiddleware(request: NextRequest) {
  return NextResponse.next();
}

export default function middleware(request: NextRequest) {
  // If i18n is disabled, just pass through without locale handling
  if (!ENABLE_I18N) {
    return noI18nMiddleware(request);
  }
  
  // Otherwise, use the intl middleware for locale handling
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - if they start with `/api`, `/_next` or `/_vercel`
    // - the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)' 
  ]
};