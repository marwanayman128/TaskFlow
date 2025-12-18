const PALETTE_STORAGE_KEY = "ui.palette";
const DEFAULT_PALETTE = "ocean";

const PALETTE_OPTIONS = [
  "default",
  "terracotta",
  "botanical",
  "ocean",
  "spotify",
  "sunset",
  "twitter",
  "discord",
  "ember",
  "slack"
];

const paletteInitializer = `(() => {
  try {
    const storageKey = '${PALETTE_STORAGE_KEY}';
    const defaultPalette = '${DEFAULT_PALETTE}';
    const validPalettes = ${JSON.stringify(PALETTE_OPTIONS)};

    // Try cookies first, then localStorage
    const getCookie = (name) => {
      const value = \`;\${document.cookie}\`;
      const parts = value.split(\`;\${name}=\`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const storedPalette = getCookie(storageKey) || window.localStorage.getItem(storageKey);
    const palette = (storedPalette && validPalettes.includes(storedPalette)) ? storedPalette : defaultPalette;

    const root = document.documentElement;
    root.dataset.palette = palette;
  } catch (error) {
    console.warn('Palette preflight script failed', error);
  }
})();`;

export function PaletteScript() {
  return (
    <script
      // We intentionally use dangerouslySetInnerHTML to run before React hydrates
      dangerouslySetInnerHTML={{ __html: paletteInitializer }}
    />
  );
}