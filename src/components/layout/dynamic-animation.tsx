"use client";

import { useEffect, useState, useMemo } from "react";
import Lottie from "lottie-react";
import { Spinner } from "@/components/ui/spinner";


type DynamicAnimationProps = {
  animationUrl?: string;
};

export function DynamicAnimation({ animationUrl }: DynamicAnimationProps) {
  const [originalData, setOriginalData] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("");

  // Compute modified animation data from original data and primary color
  const animationData = useMemo(() => {
    if (!originalData || !primaryColor) return null;

    // Convert to RGB array [0-255]
    const rgbPrimary = parseColor(primaryColor);
    
    if (!rgbPrimary) {
      return null;
    }

    // Deep clone to avoid mutating original
    const dataCopy = JSON.parse(JSON.stringify(originalData));

    // Replace blues with primary color (try multiple common blue shades)
    const blueShades = [
      [0, 0, 255],      // Pure blue (found in your animation!)
      [0, 0, 100],      // Dark blue
      [64, 110, 255],   // Light blue
      [0, 123, 255],    // Bootstrap blue
      [33, 150, 243],   // Material blue
      [59, 130, 246],   // Tailwind blue
    ];

    let modifiedData = dataCopy;
    blueShades.forEach(targetBlue => {
      modifiedData = replaceColorInLottie(modifiedData, targetBlue, rgbPrimary);
    });

    return modifiedData;
  }, [originalData, primaryColor]);

  // Load the original JSON once
  useEffect(() => {
    if (!animationUrl) return;
    
    fetch(animationUrl)
      .then((res) => res.json())
      .then((data) => setOriginalData(data))
      .catch((err) => console.error("Failed to load animation:", err));
  }, [animationUrl]);

  // Watch for CSS variable changes (palette changes)
  useEffect(() => {
    const updatePrimaryColor = () => {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
      setPrimaryColor(color);
    };

    // Initial read
    updatePrimaryColor();

    // Watch for attribute changes on html element (where data-palette is set)
    const observer = new MutationObserver(updatePrimaryColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-palette", "class", "style"],
    });

    return () => observer.disconnect();
  }, []);

  if (!animationData) {
    if (animationUrl && !originalData) {
      return (
        <div className="w-64 h-64 flex items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      );
    }
    return <div className="w-64 h-64 bg-gray-200 animate-pulse rounded" />;
  }

  return (
    <div className="w-64 h-64">
      <Lottie animationData={animationData} loop autoplay />
    </div>
  );
}

// Parse various color formats (hex, rgb, hsl, lab, oklch, etc.)
function parseColor(color: string): number[] | null {
  color = color.trim();

  // Hex format
  if (color.startsWith("#")) {
    return hexToRgb(color);
  }

  // rgb() or rgba() format
  if (color.startsWith("rgb")) {
    const match = color.match(/rgba?\((\d+),?\s*(\d+),?\s*(\d+)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
  }

  // hsl() format
  if (color.startsWith("hsl")) {
    const match = color.match(/hsla?\((\d+),?\s*(\d+)%,?\s*(\d+)%/);
    if (match) {
      return hslToRgb(
        parseInt(match[1]),
        parseInt(match[2]) / 100,
        parseInt(match[3]) / 100
      );
    }
  }

  // lab() format - LAB color space
  if (color.startsWith("lab")) {
    const match = color.match(/lab\(([\d.]+)%?\s+([\d.-]+)\s+([\d.-]+)/);
    if (match) {
      return labToRgb(
        parseFloat(match[1]),
        parseFloat(match[2]),
        parseFloat(match[3])
      );
    }
  }

  // oklch() format - OKLCh color space
  if (color.startsWith("oklch")) {
    const match = color.match(/oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/);
    if (match) {
      return oklchToRgb(
        parseFloat(match[1]),
        parseFloat(match[2]),
        parseFloat(match[3])
      );
    }
  }

  // Try as direct hex without #
  if (/^[0-9A-F]{6}$/i.test(color)) {
    return hexToRgb("#" + color);
  }

  return null;
}

function hexToRgb(hex: string): number[] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

function hslToRgb(h: number, s: number, l: number): number[] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h / 360 + 1/3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// LAB to RGB conversion
function labToRgb(l: number, a: number, b: number): number[] {
  // LAB to XYZ
  let y = (l + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  const labToXyz = (t: number) => {
    return t > 0.206897 ? t * t * t : (t - 16 / 116) / 7.787;
  };

  x = 95.047 * labToXyz(x);
  y = 100.000 * labToXyz(y);
  z = 108.883 * labToXyz(z);

  // XYZ to RGB
  x /= 100;
  y /= 100;
  z /= 100;

  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let bl = x * 0.0557 + y * -0.2040 + z * 1.0570;

  const xyzToRgb = (t: number) => {
    return t > 0.0031308 ? 1.055 * Math.pow(t, 1 / 2.4) - 0.055 : 12.92 * t;
  };

  r = xyzToRgb(r);
  g = xyzToRgb(g);
  bl = xyzToRgb(bl);

  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(bl * 255)))
  ];
}

// OKLCh to RGB conversion
function oklchToRgb(l: number, c: number, h: number): number[] {
  // Convert OKLCh to OKLAB
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLAB to Linear RGB
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  // Linear RGB to sRGB
  const linearToSrgb = (c: number) => {
    return c > 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
  };

  r = linearToSrgb(r);
  g = linearToSrgb(g);
  bl = linearToSrgb(bl);

  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(bl * 255)))
  ];
}

function replaceColorInLottie(data: Record<string, unknown>, targetRgb: number[], newRgb: number[]): Record<string, unknown> {
  const clonedData = JSON.parse(JSON.stringify(data));
  
  function traverse(obj: unknown, path = '') {
    if (obj && typeof obj === "object" && obj !== null) {
      const record = obj as Record<string, unknown>;
      // Replace in color property 'c'
      if (record.c && Array.isArray(record.c) && record.c.length >= 3 && typeof record.c[0] === 'number') {
        if (colorsMatchLottie(record.c, targetRgb)) {
          const normalized = denormalizeColor(newRgb, record.c);
          record.c[0] = normalized[0];
          record.c[1] = normalized[1];
          record.c[2] = normalized[2];
        }
      }
      
      // Replace in keyframe values 'k' (can be a single value or array of keyframes)
      if (record.k) {
        if (Array.isArray(record.k)) {
          // Check if it's a color array directly
          if (record.k.length >= 3 && typeof record.k[0] === 'number') {
            if (colorsMatchLottie(record.k, targetRgb)) {
              const normalized = denormalizeColor(newRgb, record.k);
              record.k[0] = normalized[0];
              record.k[1] = normalized[1];
              record.k[2] = normalized[2];
            }
          } else {
            // Array of keyframe objects
            record.k.forEach((keyframe: unknown) => {
              if (keyframe && typeof keyframe === "object" && keyframe !== null) {
                const kf = keyframe as Record<string, unknown>;
                if (kf.s && Array.isArray(kf.s) && kf.s.length >= 3) {
                  if (colorsMatchLottie(kf.s, targetRgb)) {
                    const normalized = denormalizeColor(newRgb, kf.s);
                    kf.s[0] = normalized[0];
                    kf.s[1] = normalized[1];
                    kf.s[2] = normalized[2];
                  }
                }
                if (kf.e && Array.isArray(kf.e) && kf.e.length >= 3) {
                  if (colorsMatchLottie(kf.e, targetRgb)) {
                    const normalized = denormalizeColor(newRgb, kf.e);
                    kf.e[0] = normalized[0];
                    kf.e[1] = normalized[1];
                    kf.e[2] = normalized[2];
                  }
                }
              }
            });
          }
        }
      }
      
      // Replace in keyframe start values 's'
      if (record.s && Array.isArray(record.s) && record.s.length >= 3 && typeof record.s[0] === 'number') {
        if (colorsMatchLottie(record.s, targetRgb)) {
          const normalized = denormalizeColor(newRgb, record.s);
          record.s[0] = normalized[0];
          record.s[1] = normalized[1];
          record.s[2] = normalized[2];
        }
      }
      
      // Replace in keyframe end values 'e'
      if (record.e && Array.isArray(record.e) && record.e.length >= 3 && typeof record.e[0] === 'number') {
        if (colorsMatchLottie(record.e, targetRgb)) {
          const normalized = denormalizeColor(newRgb, record.e);
          record.e[0] = normalized[0];
          record.e[1] = normalized[1];
          record.e[2] = normalized[2];
        }
      }
      
      Object.entries(record).forEach(([key, value]) => traverse(value, path + '.' + key));
    }
  }
  
  traverse(clonedData);
  return clonedData;
}

// Normalize color from Lottie format to RGB [0-255]
function normalizeColor(color: number[]): number[] {
  // Check the scale - Lottie can use 0-1 or 0-100 scale
  const maxVal = Math.max(Math.abs(color[0]), Math.abs(color[1]), Math.abs(color[2]));
  
  if (maxVal > 1) {
    // Values are in 0-100 scale (stored as 0-25500 when multiplied by 255)
    return [
      Math.round((color[0] / 100) * 255),
      Math.round((color[1] / 100) * 255),
      Math.round((color[2] / 100) * 255)
    ];
  } else {
    // Values are in 0-1 scale
    return [
      Math.round(color[0] * 255),
      Math.round(color[1] * 255),
      Math.round(color[2] * 255)
    ];
  }
}

// Convert RGB [0-255] back to Lottie format
function denormalizeColor(rgb: number[], originalColor: number[]): number[] {
  const maxVal = Math.max(Math.abs(originalColor[0]), Math.abs(originalColor[1]), Math.abs(originalColor[2]));
  
  if (maxVal > 1) {
    // Values are in 0-100 scale
    return [
      (rgb[0] / 255) * 100,
      (rgb[1] / 255) * 100,
      (rgb[2] / 255) * 100
    ];
  } else {
    // Values are in 0-1 scale
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
  }
}

function colorsMatchLottie(lottieColor: number[], targetRgb: number[], tolerance = 15): boolean {
  const normalized = normalizeColor(lottieColor);
  const r = Math.abs(normalized[0] - targetRgb[0]);
  const g = Math.abs(normalized[1] - targetRgb[1]);
  const b = Math.abs(normalized[2] - targetRgb[2]);
  const matches = r < tolerance && g < tolerance && b < tolerance;
  

  
  return matches;
}

export default DynamicAnimation;