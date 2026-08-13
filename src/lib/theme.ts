export const DEFAULT_ACCENT_COLOR = "#8B5CF6";

export const ACCENT_COLOR_PRESETS = [
  { name: "Roxo", value: DEFAULT_ACCENT_COLOR },
  { name: "Azul", value: "#3B82F6" },
  { name: "Ciano", value: "#06B6D4" },
  { name: "Verde", value: "#10B981" },
  { name: "Âmbar", value: "#F59E0B" },
  { name: "Rosa", value: "#EC4899" },
] as const;

const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/;

export function isValidAccentColor(value: string) {
  return HEX_COLOR_PATTERN.test(value.toUpperCase());
}

export function normalizeAccentColor(value?: string | null) {
  const normalized = value?.trim().toUpperCase();
  return normalized && isValidAccentColor(normalized) ? normalized : DEFAULT_ACCENT_COLOR;
}

function hexToRgb(hex: string) {
  const value = normalizeAccentColor(hex).slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHslTriplet({ r, g, b }: ReturnType<typeof hexToRgb>) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
  }

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return `${hue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

function mixColors(baseHex: string, accentHex: string, accentWeight: number) {
  const base = hexToRgb(baseHex);
  const accent = hexToRgb(accentHex);
  const mix = (baseValue: number, accentValue: number) =>
    Math.round(baseValue * (1 - accentWeight) + accentValue * accentWeight);

  return {
    r: mix(base.r, accent.r),
    g: mix(base.g, accent.g),
    b: mix(base.b, accent.b),
  };
}

function getForegroundTriplet(accentHex: string) {
  const { r, g, b } = hexToRgb(accentHex);
  const channels = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.44 ? "225 17% 8%" : "0 0% 100%";
}

export function applyAccentTheme(element: HTMLElement, accentColor?: string | null) {
  const accent = normalizeAccentColor(accentColor);
  const variables = {
    "--primary": rgbToHslTriplet(hexToRgb(accent)),
    "--primary-hover": rgbToHslTriplet(mixColors(accent, "#FFFFFF", 0.12)),
    "--primary-active": rgbToHslTriplet(mixColors(accent, "#000000", 0.14)),
    "--primary-subtle": rgbToHslTriplet(mixColors("#21242B", accent, 0.16)),
    "--primary-soft": rgbToHslTriplet(mixColors("#21242B", accent, 0.28)),
    "--primary-border": rgbToHslTriplet(mixColors("#313641", accent, 0.48)),
    "--primary-foreground": getForegroundTriplet(accent),
    "--glow-primary": `0 18px 60px ${accent}2E`,
  };

  Object.entries(variables).forEach(([property, value]) => element.style.setProperty(property, value));
}
