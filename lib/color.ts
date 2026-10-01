// Color helpers ported from the Python version.
// Hue is in degrees (0-360), s / v / l are 0-1, rgb channels are 0-1.

type RGB = [number, number, number];

const mod = (n: number, m: number) => ((n % m) + m) % m;

export function rgbToHex([r, g, b]: RGB): string {
  const to = (c: number) =>
    Math.round(Math.min(1, Math.max(0, c)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function hexToRgb01(hex: string): RGB {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
}

function hsvToRgb(h: number, s: number, v: number): RGB {
  const hh = mod(h, 360) / 60;
  const i = Math.floor(hh);
  const f = hh - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    default: return [v, p, q];
  }
}

export function hsvToHex(h: number, s: number, v: number): string {
  return rgbToHex(hsvToRgb(h, s, v));
}

export function hexToHsv(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb01(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return [mod(h * 60, 360), max === 0 ? 0 : d / max, max];
}

// HLS <-> RGB (same maths as Python's colorsys) — used for the shade picker
function rgbToHls([r, g, b]: RGB): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, l, 0];
  const d = max - min;
  const s = l <= 0.5 ? d / (max + min) : d / (2 - max - min);
  let h: number;
  if (max === r) h = (g - b) / d;
  else if (max === g) h = 2 + (b - r) / d;
  else h = 4 + (r - g) / d;
  return [mod(h / 6, 1), l, s];
}

function hlsToRgb(h: number, l: number, s: number): RGB {
  if (s === 0) return [l, l, l];
  const m2 = l <= 0.5 ? l * (1 + s) : l + s - l * s;
  const m1 = 2 * l - m2;
  const channel = (hue: number) => {
    const x = mod(hue, 1);
    if (x < 1 / 6) return m1 + (m2 - m1) * x * 6;
    if (x < 0.5) return m2;
    if (x < 2 / 3) return m1 + (m2 - m1) * (2 / 3 - x) * 6;
    return m1;
  };
  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3)];
}

/** Black or white text, whichever is readable on this background. */
export function textColorFor(hex: string): string {
  const [r, g, b] = hexToRgb01(hex).map((c) => c * 255);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#111111" : "#ffffff";
}

// Hue offsets (degrees) from the selected color
export const HARMONIES = {
  "Complementary": [0, 180],
  "Split-complementary": [0, 150, 210],
  "Triadic": [0, 120, 240],
  "Tetradic (square)": [0, 90, 180, 270],
  "Analogous": [-30, 0, 30],
} as const;

export type HarmonyName = keyof typeof HARMONIES;
export const HARMONY_NAMES = Object.keys(HARMONIES) as HarmonyName[];

export function harmonyColors(hex: string, offsets: readonly number[]): string[] {
  const [h, s, v] = hexToHsv(hex);
  return offsets.map((off) => hsvToHex(h + off, s, v));
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Random base hue + random harmony, with varied saturation/value. */
export function generatePalette(n = 5): string[] {
  const base = rand(0, 360);
  const sets = Object.values(HARMONIES);
  const offsets = sets[Math.floor(Math.random() * sets.length)];
  return Array.from({ length: n }, (_, i) =>
    hsvToHex(base + offsets[i % offsets.length] + rand(-8, 8), rand(0.45, 0.9), rand(0.6, 1.0)),
  );
}

export const SHADE_STEPS = 10; // 10 lighter + current + 10 darker = 21 rows

/** 21 shades: lightest at the top, darkest at the bottom, current color in the middle. */
export function makeShades(hex: string, steps = SHADE_STEPS): string[] {
  const [h, l, s] = rgbToHls(hexToRgb01(hex));
  const shades: string[] = [];
  for (let k = steps; k >= -steps; k--) {
    if (k === 0) shades.push(hex.toLowerCase());
    else if (k > 0) shades.push(rgbToHex(hlsToRgb(h, l + ((1 - l) * k) / (steps + 1), s)));
    else shades.push(rgbToHex(hlsToRgb(h, l * (1 - -k / (steps + 1)), s)));
  }
  return shades;
}
