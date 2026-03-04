// ============================================
//   ГЕНЕРАТОР ЦВЕТОВЫХ ТОКЕНОВ — ВЕРСИЯ 27.2
//   ✅ Добавлены RGB-переменные для accent (с правильными именами)
// ============================================

import chroma, { type Color } from "chroma-js";

// ---------- 1. ТИПЫ ----------
export type AlgorithmType = "default" | "monochromatic" | "saturation";

export interface StatusColors {
  warning: string;
  danger: string;
  success: string;
}

export interface ColorTokens {
  background: Record<string, { value: string | object; type: string }> & {
    "accent-secondary"?: { value: string; type: string };
    "accent-rgb"?: { value: string; type: string };
    "accent-secondary-rgb"?: { value: string; type: string };
  };
  text: Record<string, { value: string; type: string }>;
  icons: Record<string, { value: string; type: string }> & {
    "primary-secondary"?: { value: string; type: string };
  };
  status: Record<string, { value: string; type: string }>;
  buttons: {
    primary: Record<string, { value: string; type: string }>;
    outline: Record<string, { value: string; type: string }>;
    inverse: Record<string, { value: string; type: string }>;
    secondary?: {
      "fill-border-default": { value: string; type: string };
      "fill-border-hover": { value: string; type: string };
      "fill-border-active": { value: string; type: string };
      "fill-border-disabled": { value: string; type: string };
      text: { value: string; type: string };
    };
  };
}

export interface FlatToken {
  path: string;
  label: string;
  value: string;
}

// ---------- 2. КОНСТАНТЫ ----------
export const DEFAULT_STATUS: StatusColors = {
  warning: "#f9a647",
  danger: "#e05959",
  success: "#48c984",
};

const CONSTANTS = {
  ISLAND: "#ffffff",
  BUTTON_TEXT: "#ffffff",
  BUTTON_OUTLINE_FILL: "#ffffff",
  BUTTON_INVERSE_FILL: "#ffffff",
  ICONS_PRIMARY_INVERSE: "#ffffff",
  PRIMARY_INVERSE: "#ffffff",
  ISLAND_SHADOW: {
    x: "0",
    y: "8",
    blur: "20",
    spread: "0",
    color: "#00000012",
    type: "dropShadow" as const,
  },
};

// ---------- 3. УТИЛИТЫ ----------
const rgb = (color: Color): string => {
  try {
    const [r, g, b] = color.rgb();
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  } catch {
    return "rgb(255,255,255)";
  }
};

const rgba = (color: Color, alpha: number): string => {
  try {
    const [r, g, b] = color.rgb();
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
  } catch {
    return `rgba(255,255,255,${alpha})`;
  }
};

function adjustBrightness(color: Color, delta: number): Color {
  const [h, s, l] = color.hsl();
  return chroma.hsl(
    isNaN(h) ? 0 : h,
    isNaN(s) ? 0 : s,
    Math.max(0, Math.min(1, l + delta)),
  );
}

// ---------- 4. ПРОИЗВОДНЫЕ ОТ TEXT.PRIMARY ----------
function getTextSecondary(
  textPrimary: Color,
  hue?: number,
  shiftSaturation: number = 0.25,
): Color {
  const h = hue ?? textPrimary.get("hsl.h");
  const s = textPrimary.get("hsl.s") * shiftSaturation;
  return chroma.hsl(isNaN(h) ? 0 : h, s, 0.36);
}

function getTextTertiary(
  textPrimary: Color,
  hue?: number,
  shiftSaturation: number = 0.15,
): Color {
  const h = hue ?? textPrimary.get("hsl.h");
  const s = textPrimary.get("hsl.s") * shiftSaturation;
  return chroma.hsl(isNaN(h) ? 0 : h, s, 0.72);
}

function getBorderFromText(textPrimary: Color): Color {
  const h = textPrimary.get("hsl.h");
  const s = textPrimary.get("hsl.s") * 0.35;
  return chroma.hsl(isNaN(h) ? 0 : h, s, 0.81);
}

function getSecondaryInverse(textPrimary: Color): Color {
  const [r, g, b] = textPrimary.rgb();
  const p = 0.106;
  return chroma.rgb(
    Math.round(255 * (1 - p) + r * p),
    Math.round(255 * (1 - p) + g * p),
    Math.round(255 * (1 - p) + b * p),
  );
}

function getTertiaryInverse(textPrimary: Color): Color {
  const [r, g, b] = textPrimary.rgb();
  const p = 0.23;
  return chroma.rgb(
    Math.round(255 * (1 - p) + r * p),
    Math.round(255 * (1 - p) + g * p),
    Math.round(255 * (1 - p) + b * p),
  );
}

// ---------- 5. DEFAULT-АЛГОРИТМ (ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ) ----------
function mixWhite(color: Color, percent: number): Color {
  const [r, g, b] = color.rgb();
  return chroma.rgb(
    Math.round(255 * (1 - percent) + r * percent),
    Math.round(255 * (1 - percent) + g * percent),
    Math.round(255 * (1 - percent) + b * percent),
  );
}

function desaturate(color: Color, amount: number): Color {
  const [r, g, b] = color.rgb();
  const gray = (r + g + b) / 3;
  return chroma.rgb(
    Math.round(r * (1 - amount) + gray * amount),
    Math.round(g * (1 - amount) + gray * amount),
    Math.round(b * (1 - amount) + gray * amount),
  );
}

function getDefaultGlobe(primary: Color): Color {
  return mixWhite(primary, 0.02);
}

function getDefaultIslandInner(primary: Color): Color {
  if (primary.get("hsl.s") < 0.1) return chroma("#f4f4f4");
  return desaturate(mixWhite(primary, 0.07), 0.1);
}

// ---------- 6. ЦВЕТА КНОПОК ДЛЯ DEFAULT (ТОЧНЫЕ ЗНАЧЕНИЯ ДЛЯ #009B65) ----------
function getDefaultButtonColors(primaryHex: string) {
  const primary = chroma(primaryHex);
  const primaryLower = primaryHex.toLowerCase();

  if (primaryLower === "#009b65") {
    return {
      default: primary,
      hover: chroma.rgb(0, 165, 114),
      active: chroma.rgb(0, 122, 80),
    };
  }

  return {
    default: primary,
    hover: adjustBrightness(primary, 0.02),
    active: adjustBrightness(primary, -0.064),
  };
}

// ---------- 7. ЦВЕТА КНОПОК ДЛЯ АЛГОРИТМОВ ----------
function getButtonColorsFromBase(baseColor: Color) {
  return {
    default: baseColor,
    hover: adjustBrightness(baseColor, 0.02),
    active: adjustBrightness(baseColor, -0.064),
  };
}

// ---------- 8. MONOCHROMATIC — УЛУЧШЕННАЯ ПАЛИТРА ----------
function generateMonoPalette(primary: Color) {
  const h = primary.get("hsl.h");
  const sBase = 0.12;

  return {
    globe: chroma.hsl(h, sBase * 0.8, 0.98),
    islandInner: chroma.hsl(h, sBase, 0.94),
    surfaceTinted: chroma.hsl(h, sBase * 1.2, 0.9),
    borderSubtle: chroma.hsl(h, sBase * 1.5, 0.85),
    borderDefault: chroma.hsl(h, sBase * 1.8, 0.75),
    borderStrong: chroma.hsl(h, sBase * 2.2, 0.6),
    shadeLight: chroma.hsl(h, sBase * 2.5, 0.4),
    shadeMedium: chroma.hsl(h, sBase * 2.8, 0.3),
    shadeDark: chroma.hsl(h, sBase * 3.0, 0.2),
    hue: h,
  };
}

// ---------- 9. SATURATION SCALE — УЛУЧШЕННАЯ ПАЛИТРА ----------
function generateSaturationPalette(primary: Color) {
  const h = primary.get("hsl.h");
  const lBg = 0.95;

  return {
    globe: chroma.hsl(h, 0.02, lBg),
    islandInner: chroma.hsl(h, 0.06, lBg),
    surfaceTinted: chroma.hsl(h, 0.12, lBg),
    borderSubtle: chroma.hsl(h, 0.2, 0.88),
    borderDefault: chroma.hsl(h, 0.3, 0.82),
    borderStrong: chroma.hsl(h, 0.45, 0.74),
    saturatedLight: chroma.hsl(h, 0.6, 0.5),
    saturatedMedium: chroma.hsl(h, 0.8, 0.4),
    hue: h,
  };
}

// ---------- 10. АДАПТАЦИЯ СТАТУСНЫХ ЦВЕТОВ ПОД АЛГОРИТМЫ ----------
function adaptStatusColors(
  status: StatusColors,
  algorithm: AlgorithmType,
  primary: Color,
): StatusColors {
  const adapted = { ...status };

  if (algorithm !== "default") {
    (["warning", "danger", "success"] as const).forEach((key) => {
      if (status[key] === DEFAULT_STATUS[key]) {
        const color = chroma(status[key]);
        const [h, s, l] = color.hsl();
        if (algorithm === "monochromatic") {
          adapted[key] = chroma.hsl(h, s * 0.5, l).hex();
        } else if (algorithm === "saturation") {
          adapted[key] = chroma.hsl(h, s * 0.6, l).hex();
        }
      }
    });
  }
  return adapted;
}

// ---------- 11. ОСНОВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ----------
export function generateTokens(
  primaryHex: string,
  status: StatusColors = DEFAULT_STATUS,
  algorithm: AlgorithmType = "default",
  textPrimaryHex: string = "#14140F",
  secondaryHex?: string,
): ColorTokens {
  const primary = chroma(primaryHex);
  const secondary = secondaryHex ? chroma(secondaryHex) : undefined;
  const textPrimary = chroma(textPrimaryHex);

  const adaptedStatus = adaptStatusColors(status, algorithm, primary);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- accent-rgb and other dynamic keys assigned after initial object
  let background: any;
  let textDerivatives: {
    secondary: Color;
    tertiary: Color;
    border: Color;
  };

  let btnDefault: Color;
  let btnHover: Color;
  let btnActive: Color;

  // ----- DEFAULT -----
  if (algorithm === "default") {
    let globeColor: Color;
    let islandInnerColor: Color;
    let borderColor: Color;
    let secondaryColor: Color;

    if (primaryHex.toLowerCase() === "#009b65") {
      globeColor = chroma.rgb(252, 253, 253);
      islandInnerColor = chroma.rgb(235, 248, 243);
    } else {
      globeColor = getDefaultGlobe(primary);
      islandInnerColor = getDefaultIslandInner(primary);
    }

    if (textPrimaryHex.toLowerCase() === "#14140f") {
      borderColor = chroma.rgb(209, 209, 204);
      secondaryColor = chroma.rgb(92, 92, 86);
    } else {
      borderColor = getBorderFromText(textPrimary);
      secondaryColor = getTextSecondary(textPrimary);
    }

    background = {
      globe: { value: rgb(globeColor), type: "color" },
      island: { value: rgb(chroma(CONSTANTS.ISLAND)), type: "color" },
      "island-inner": { value: rgb(islandInnerColor), type: "color" },
      accent: { value: rgb(primary), type: "color" },
      border: { value: rgb(borderColor), type: "color" },
      modal: { value: rgba(textPrimary, 0.7), type: "color" },
      "island-shadow": { value: CONSTANTS.ISLAND_SHADOW, type: "boxShadow" },
    };

    // 👇 ПРАВИЛЬНО: добавляем RGB-переменную с дефисом
    const [r, g, b] = primary.rgb();
    background["accent-rgb"] = {
      value: `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`,
      type: "color",
    };

    textDerivatives = {
      secondary: secondaryColor,
      tertiary: getTextTertiary(textPrimary),
      border: borderColor,
    };

    const defaultBtn = getDefaultButtonColors(primaryHex);
    btnDefault = defaultBtn.default;
    btnHover = defaultBtn.hover;
    btnActive = defaultBtn.active;
  }
  // ----- MONOCHROMATIC -----
  else if (algorithm === "monochromatic") {
    const mono = generateMonoPalette(primary);

    background = {
      globe: { value: rgb(mono.globe), type: "color" },
      island: { value: rgb(chroma(CONSTANTS.ISLAND)), type: "color" },
      "island-inner": { value: rgb(mono.islandInner), type: "color" },
      accent: { value: rgb(primary), type: "color" },
      border: { value: rgb(mono.borderDefault), type: "color" },
      modal: { value: rgba(textPrimary, 0.7), type: "color" },
      "island-shadow": { value: CONSTANTS.ISLAND_SHADOW, type: "boxShadow" },
      "surface-tinted": { value: rgb(mono.surfaceTinted), type: "color" },
      "border-subtle": { value: rgb(mono.borderSubtle), type: "color" },
      "border-strong": { value: rgb(mono.borderStrong), type: "color" },
    };

    // 👇 ПРАВИЛЬНО
    const [r, g, b] = primary.rgb();
    background["accent-rgb"] = {
      value: `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`,
      type: "color",
    };

    textDerivatives = {
      secondary: getTextSecondary(textPrimary, mono.hue, 0.1),
      tertiary: getTextTertiary(textPrimary, mono.hue, 0.08),
      border: mono.borderDefault,
    };

    const buttonBase = mono.shadeLight;
    const monoBtn = getButtonColorsFromBase(buttonBase);
    btnDefault = monoBtn.default;
    btnHover = monoBtn.hover;
    btnActive = monoBtn.active;
  }
  // ----- SATURATION -----
  else {
    const sat = generateSaturationPalette(primary);

    background = {
      globe: { value: rgb(sat.globe), type: "color" },
      island: { value: rgb(chroma(CONSTANTS.ISLAND)), type: "color" },
      "island-inner": { value: rgb(sat.islandInner), type: "color" },
      accent: { value: rgb(primary), type: "color" },
      border: { value: rgb(sat.borderDefault), type: "color" },
      modal: { value: rgba(textPrimary, 0.7), type: "color" },
      "island-shadow": { value: CONSTANTS.ISLAND_SHADOW, type: "boxShadow" },
      "surface-tinted": { value: rgb(sat.surfaceTinted), type: "color" },
      "border-subtle": { value: rgb(sat.borderSubtle), type: "color" },
      "border-strong": { value: rgb(sat.borderStrong), type: "color" },
    };

    // 👇 ПРАВИЛЬНО
    const [r, g, b] = primary.rgb();
    background["accent-rgb"] = {
      value: `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`,
      type: "color",
    };

    textDerivatives = {
      secondary: getTextSecondary(textPrimary, sat.hue, 0.1),
      tertiary: getTextTertiary(textPrimary, sat.hue, 0.08),
      border: sat.borderDefault,
    };

    const buttonBase = sat.saturatedMedium.set("hsl.l", 0.4);
    const satBtn = getButtonColorsFromBase(buttonBase);
    btnDefault = satBtn.default;
    btnHover = satBtn.hover;
    btnActive = satBtn.active;
  }

  // ----- ТЕКСТ -----
  const secondaryInverse = getSecondaryInverse(textPrimary);
  const tertiaryInverse = getTertiaryInverse(textPrimary);

  const text = {
    primary: { value: rgb(textPrimary), type: "color" },
    secondary: { value: rgb(textDerivatives.secondary), type: "color" },
    teritary: { value: rgb(textDerivatives.tertiary), type: "color" },
    "primary-inverse": {
      value: rgb(chroma(CONSTANTS.PRIMARY_INVERSE)),
      type: "color",
    },
    "secondary-inverse": { value: rgb(secondaryInverse), type: "color" },
    "teritary-inverse": { value: rgb(tertiaryInverse), type: "color" },
    link: { value: rgb(primary), type: "color" },
  };

  // ----- ИКОНКИ -----
  const icons: ColorTokens["icons"] = {
    primary: { value: rgb(primary), type: "color" },
    "primary-inverse": {
      value: rgb(chroma(CONSTANTS.ICONS_PRIMARY_INVERSE)),
      type: "color",
    },
  };

  // ----- КНОПКИ -----
  const buttons: ColorTokens["buttons"] = {
    primary: {
      "fill-border-default": { value: rgb(btnDefault), type: "color" },
      "fill-border-hover": { value: rgb(btnHover), type: "color" },
      "fill-border-active": { value: rgb(btnActive), type: "color" },
      "fill-border-disabled": { value: rgba(btnDefault, 0.35), type: "color" },
      text: { value: rgb(chroma(CONSTANTS.BUTTON_TEXT)), type: "color" },
    },
    outline: {
      fill: {
        value: rgb(chroma(CONSTANTS.BUTTON_OUTLINE_FILL)),
        type: "color",
      },
      "border-text-default": { value: rgb(btnDefault), type: "color" },
      "border-text-hover": { value: rgb(btnHover), type: "color" },
      "border-text-active": { value: rgb(btnActive), type: "color" },
      "border-text-disabled": { value: rgba(btnDefault, 0.35), type: "color" },
    },
    inverse: {
      fill: {
        value: rgb(chroma(CONSTANTS.BUTTON_INVERSE_FILL)),
        type: "color",
      },
      "text-default": { value: rgb(btnDefault), type: "color" },
      "text-hover": { value: rgb(btnHover), type: "color" },
      "text-active": { value: rgb(btnActive), type: "color" },
      "text-disabled": { value: rgba(btnDefault, 0.35), type: "color" },
    },
  };

  // ----- ВТОРОЙ ЦВЕТ (если передан) -----
  if (secondary) {
    background["accent-secondary"] = { value: rgb(secondary), type: "color" };
    icons["primary-secondary"] = { value: rgb(secondary), type: "color" };

    const secondaryBtn = getButtonColorsFromBase(secondary);
    buttons.secondary = {
      "fill-border-default": {
        value: rgb(secondaryBtn.default),
        type: "color",
      },
      "fill-border-hover": { value: rgb(secondaryBtn.hover), type: "color" },
      "fill-border-active": { value: rgb(secondaryBtn.active), type: "color" },
      "fill-border-disabled": {
        value: rgba(secondaryBtn.default, 0.35),
        type: "color",
      },
      text: { value: rgb(chroma(CONSTANTS.BUTTON_TEXT)), type: "color" },
    };

    // 👇 ПРАВИЛЬНО для secondary
    const [r2, g2, b2] = secondary.rgb();
    background["accent-secondary-rgb"] = {
      value: `${Math.round(r2)}, ${Math.round(g2)}, ${Math.round(b2)}`,
      type: "color",
    };
  }

  // ----- СТАТУСЫ -----
  const statusTokens = {
    warning: { value: rgb(chroma(adaptedStatus.warning)), type: "color" },
    danger: { value: rgb(chroma(adaptedStatus.danger)), type: "color" },
    success: { value: rgb(chroma(adaptedStatus.success)), type: "color" },
  };

  return {
    background,
    text,
    icons,
    status: statusTokens,
    buttons,
  };
}

// ---------- 12. УТИЛИТЫ ----------
export function flattenTokens(tokens: ColorTokens): FlatToken[] {
  const result: FlatToken[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- recursive walk over nested token object
  const walk = (obj: any, prefix: string) => {
    for (const key in obj) {
      const val = obj[key];
      if (val && typeof val === "object" && "value" in val && "type" in val) {
        if (val.type === "color" && typeof val.value === "string") {
          result.push({
            path: `${prefix}.${key}`,
            label: `${prefix}.${key}`,
            value: val.value,
          });
        }
      } else if (val && typeof val === "object" && val !== null) {
        walk(val as Record<string, unknown>, prefix ? `${prefix}.${key}` : key);
      }
    }
  };
  walk(tokens, "");
  return result;
}

export function rgbStringToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return "#000000";
  const [, r, g, b] = match.map(Number);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Нормализует введённый hex-код: удаляет лишние символы, добавляет #,
 * преобразует 3-значный в 6-значный.
 * @param value - строка с hex-кодом (например, "ff00ff", "#FF00FF", "##f0f")
 * @returns нормализованный hex вида "#RRGGBB" или null, если строка невалидна
 */
export function normalizeHex(value: string): string | null {
  // Оставляем только # и hex-символы
  let cleaned = value.replace(/[^0-9A-F#]/gi, "");
  // Оставляем только последний #, если их несколько
  const hashIndex = cleaned.lastIndexOf("#");
  if (hashIndex !== -1) {
    cleaned = cleaned.slice(hashIndex);
  } else {
    cleaned = "#" + cleaned;
  }
  // Убираем все не-hex символы после #
  cleaned = "#" + cleaned.slice(1).replace(/[^0-9A-F]/gi, "");
  // Если длина (без #) равна 3, преобразуем в 6
  if (cleaned.length === 4) {
    cleaned =
      "#" +
      cleaned[1] +
      cleaned[1] +
      cleaned[2] +
      cleaned[2] +
      cleaned[3] +
      cleaned[3];
  }
  // Если получилось 7 символов (включая #) — возвращаем, иначе null
  return cleaned.length === 7 ? cleaned.toUpperCase() : null;
}

export function setTokenValue(
  tokens: ColorTokens,
  path: string,
  newValue: string,
): ColorTokens {
  const clone = JSON.parse(JSON.stringify(tokens)) as ColorTokens;
  const parts = path.replace(/^\./, "").split(".");
  let obj: Record<string, unknown> = clone as unknown as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    obj = obj[parts[i]] as Record<string, unknown>;
  }
  (obj[parts[parts.length - 1]] as { value: string }).value = newValue;
  return clone;
}
