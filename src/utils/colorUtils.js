/**
 * Convert HSV (0-360, 0-100, 0-100) to RGB (0-255 each)
 */
export function hsvToRgb(h, s, v) {
  const hNorm = h / 60;
  const sNorm = s / 100;
  const vNorm = v / 100;

  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs((hNorm % 2) - 1));
  const m = vNorm - c;

  let r, g, b;
  if (hNorm < 1)      [r, g, b] = [c, x, 0];
  else if (hNorm < 2) [r, g, b] = [x, c, 0];
  else if (hNorm < 3) [r, g, b] = [0, c, x];
  else if (hNorm < 4) [r, g, b] = [0, x, c];
  else if (hNorm < 5) [r, g, b] = [x, 0, c];
  else                [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Convert RGB to HEX string (e.g. "#FF5733")
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

/**
 * Convert HEX string to RGB object
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 255, g: 0, b: 0 };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const l = (max + min) / 2;

  let h = 0, s = 0;
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    if (max === r)      h = 60 * (((g - b) / diff) % 6);
    else if (max === g) h = 60 * (((b - r) / diff) + 2);
    else                h = 60 * (((r - g) / diff) + 4);
  }

  return {
    h: Math.round((h + 360) % 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r)      h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * (((b - r) / delta) + 2);
    else                h = 60 * (((r - g) / delta) + 4);
  }

  return {
    h: (h + 360) % 360,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  };
}

/**
 * Given a background color (hex), return black or white for readable text
 */
export function getContrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#FFFFFF';
}

/**
 * Build the full color object from hue (0-360), saturation (0-100), brightness (0-100)
 */
export function buildColorObject(h, s, v) {
  const rgb = hsvToRgb(h, s, v);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { hex, rgb, hsl, hsv: { h: Math.round(h), s: Math.round(s), v: Math.round(v) } };
}
