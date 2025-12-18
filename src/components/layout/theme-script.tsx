const THEME_STORAGE_KEY = "dashboard-theme";

const themeInitializer = `(() => {
  try {
    const storageKey = '${THEME_STORAGE_KEY}';
    const storedTheme = window.localStorage.getItem(storageKey);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemPreference = mediaQuery.matches ? 'dark' : 'light';
    const theme = storedTheme || systemPreference;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  } catch (error) {
    console.warn('Theme preflight script failed', error);
  }
})();`;

export function ThemeScript() {
  return (
    <script
      // We intentionally use dangerouslySetInnerHTML to run before React hydrates
      dangerouslySetInnerHTML={{ __html: themeInitializer }}
    />
  );
}
