type Messages = Record<string, unknown>;

type CacheEntry = {
  messages: Messages;
  expiresAt: number;
};

const API_URL = process.env.TRANSLATION_API_URL;
const API_KEY = process.env.TRANSLATION_API_KEY;
const CACHE_TTL_MS = Number(process.env.TRANSLATION_CACHE_TTL_MS ?? 1000 * 60 * 60);
const remoteCache = new Map<string, CacheEntry>();

function isRecord(value: unknown): value is Messages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getCached(locale: string): Messages | null {
  const cached = remoteCache.get(locale);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt < Date.now()) {
    remoteCache.delete(locale);
    return null;
  }

  return cached.messages;
}

function cacheMessages(locale: string, messages: Messages) {
  remoteCache.set(locale, {
    messages,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function requestTranslations(locale: string): Promise<Messages | null> {
  if (!API_URL) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}?locale=${locale}`, {
      headers: {
        ...(API_KEY ? { "x-api-key": API_KEY } : {}),
        Accept: "application/json",
      },
      cache: "no-store",
      next: { revalidate: CACHE_TTL_MS / 1000 },
    });

    if (!response.ok) {
      console.warn(`Translation API responded with ${response.status} for locale "${locale}".`);
      return null;
    }

    const payload = await response.json();

    if (!isRecord(payload)) {
      console.warn(`Translation API returned invalid payload for locale "${locale}".`);
      return null;
    }

    return payload;
  } catch (error) {
    console.error(`Failed to load remote translations for locale "${locale}":`, error);
    return null;
  }
}

export async function fetchRemoteTranslations(locale: string): Promise<Messages | null> {
  const cached = getCached(locale);

  if (cached) {
    return cached;
  }

  const remoteMessages = await requestTranslations(locale);

  if (remoteMessages) {
    cacheMessages(locale, remoteMessages);
  }

  return remoteMessages;
}
