import { notFound } from "next/navigation";

import { fetchRemoteTranslations } from "./lib/remote-translations";

export const locales = ["en", "ar"] as const;
const FALLBACK_LOCALE = "en";
const messageCache = new Map<string, Record<string, unknown>>();

type Messages = Record<string, unknown>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(target: Messages, source: Messages): Messages {
  const output = { ...target };

  Object.entries(source).forEach(([key, value]) => {
    if (isObject(value) && isObject(output[key])) {
      output[key] = deepMerge(output[key] as Messages, value);
    } else {
      output[key] = value;
    }
  });

  return output;
}

// Import function for modular translation files
async function importModularMessages(locale: string): Promise<Messages> {
  const messages: Messages = {};

  try {
    // Common translations
    const common = await import(`../messages/${locale}/common.json`);
    messages.common = common.default;
  } catch (e) {
    console.warn(`Missing common.json for locale "${locale}"`);
  }

  try {
    // Error translations
    const errors = await import(`../messages/${locale}/errors.json`);
    messages.errors = errors.default;
  } catch (e) {
    console.warn(`Missing errors.json for locale "${locale}"`);
  }

  // Layout translations
  try {
    const sidebar = await import(`../messages/${locale}/layout/sidebar.json`);
    messages.sidebar = sidebar.default;
  } catch (e) {
    console.warn(`Missing layout/sidebar.json for locale "${locale}"`);
  }

  try {
    const header = await import(`../messages/${locale}/layout/header.json`);
    messages.header = header.default;
  } catch (e) {
    console.warn(`Missing layout/header.json for locale "${locale}"`);
  }

  try {
    const notifications = await import(`../messages/${locale}/layout/notifications.json`);
    messages.notifications = notifications.default;
  } catch (e) {
    console.warn(`Missing layout/notifications.json for locale "${locale}"`);
  }

  try {
    const navigation = await import(`../messages/${locale}/layout/navigation.json`);
    messages.navigation = navigation.default;
  } catch (e) {
    console.warn(`Missing layout/navigation.json for locale "${locale}"`);
  }

  // Auth translations
  try {
    const login = await import(`../messages/${locale}/auth/login.json`);
    messages.login = login.default;
  } catch (e) {
    console.warn(`Missing auth/login.json for locale "${locale}"`);
  }

  try {
    const register = await import(`../messages/${locale}/auth/register.json`);
    messages.register = register.default;
  } catch (e) {
    console.warn(`Missing auth/register.json for locale "${locale}"`);
  }

  // Pages translations
  try {
    const dashboard = await import(`../messages/${locale}/pages/dashboard.json`);
    messages.dashboard = dashboard.default;
  } catch (e) {
    console.warn(`Missing pages/dashboard.json for locale "${locale}"`);
  }

  try {
    const users = await import(`../messages/${locale}/pages/users.json`);
    messages.users = users.default;
  } catch (e) {
    console.warn(`Missing pages/users.json for locale "${locale}"`);
  }

  try {
    const settings = await import(`../messages/${locale}/pages/settings.json`);
    messages.settings = settings.default;
  } catch (e) {
    console.warn(`Missing pages/settings.json for locale "${locale}"`);
  }

  try {
    const profile = await import(`../messages/${locale}/pages/profile.json`);
    messages.profile = profile.default;
  } catch (e) {
    console.warn(`Missing pages/profile.json for locale "${locale}"`);
  }

  // Components translations
  try {
    const table = await import(`../messages/${locale}/components/table.json`);
    messages.table = table.default;
  } catch (e) {
    console.warn(`Missing components/table.json for locale "${locale}"`);
  }

  try {
    const dialog = await import(`../messages/${locale}/components/dialog.json`);
    messages.dialog = dialog.default;
  } catch (e) {
    console.warn(`Missing components/dialog.json for locale "${locale}"`);
  }

  try {
    const form = await import(`../messages/${locale}/components/form.json`);
    messages.form = form.default;
  } catch (e) {
    console.warn(`Missing components/form.json for locale "${locale}"`);
  }

  return messages;
}

async function getMessages(locale: string): Promise<Messages> {
  if (messageCache.has(locale)) {
    return messageCache.get(locale)!;
  }

  const messages = await importModularMessages(locale);
  messageCache.set(locale, messages);
  return messages;
}

export async function loadMessages(locale: string) {
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const baseMessages = await getMessages(FALLBACK_LOCALE);

  if (locale === FALLBACK_LOCALE) {
    return baseMessages;
  }

  const cached = messageCache.get(locale);

  if (cached) {
    return cached;
  }

  const remoteMessages = await fetchRemoteTranslations(locale);
  const localeOverrides = remoteMessages ?? (await importModularMessages(locale));
  const merged = deepMerge(baseMessages, localeOverrides);
  messageCache.set(locale, merged);
  return merged;
}