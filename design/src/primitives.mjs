/**
 * Primitives — the small, reusable drawing pieces every component is built
 * from (panel, gold rule, diamond, chip, arrow). Components compose these;
 * none of them draw raw shapes themselves. That's the DRY principle applied
 * to graphics: fix the gold rule once and every file that uses it updates.
 */
import { setText, measureText, glyphDefsFor } from './typography.mjs';

/** @typedef {import('./tokens.mjs').Theme} Theme */
/** @typedef {{ defs: string, body: string }} Fragment  Markup split into <defs> and drawable body */

/** Escapes text that goes into XML attributes/elements (titles, alt text). */
export const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Wraps fragments in a standalone, accessible SVG document.
 * role="img" + <title>/<desc> let screen readers describe the artwork.
 * @param {{ width: number, height: number, title: string, desc?: string, fragments: Fragment[] }} p
 */
export function svgDocument({ width, height, title, desc = '', fragments }) {
  const body = fragments.map((f) => f.body).join('\n  ');
  // Glyph outlines are defined once per file, only for letters actually used.
  const defs = fragments.map((f) => f.defs).join('') + glyphDefsFor(body);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="t d">
  <title id="t">${escapeXml(title)}</title>
  <desc id="d">${escapeXml(desc)}</desc>
  <defs>${defs}</defs>
  ${body}
</svg>
`;
}

/** @typedef {'both' | 'left' | 'right'} Fade  Which end(s) of a rule dissolve to transparent */

/**
 * Horizontal gold gradient that dissolves to transparent at one or both ends.
 * Reused by every rule so the gold always looks the same.
 * @param {string} id
 * @param {Theme} theme
 * @param {Fade} fade
 */
function goldFadeGradient(id, theme, fade) {
  const start = fade === 'right' ? 1 : 0; // opacity at x=0
  const end = fade === 'left' ? 1 : 0; // opacity at x=1
  return `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="${theme.gold}" stop-opacity="${start}"/>
    <stop offset="0.5" stop-color="${theme.goldBright}"/>
    <stop offset="1" stop-color="${theme.gold}" stop-opacity="${end}"/>
  </linearGradient>`;
}

/** A small rotated square — the brand's recurring ornament. */
export function diamond({ cx, cy, size, fill, opacity = 1 }) {
  const h = size / 2;
  const op = opacity < 1 ? ` opacity="${opacity}"` : '';
  return `<path d="M${cx} ${cy - h}L${cx + h} ${cy}L${cx} ${cy + h}L${cx - h} ${cy}Z" fill="${fill}"${op}/>`;
}

/**
 * Hairline gold rule with an optional centre diamond.
 * @param {{ id: string, x1: number, x2: number, y: number, theme: Theme, withDiamond?: boolean, weight?: number, fade?: Fade }} p
 * @returns {Fragment}
 */
export function goldRule({ id, x1, x2, y, theme, withDiamond = true, weight = 1.5, fade = 'both' }) {
  const cx = (x1 + x2) / 2;
  const line = `<rect x="${x1}" y="${y - weight / 2}" width="${x2 - x1}" height="${weight}" fill="url(#${id})"/>`;
  const gem = withDiamond ? diamond({ cx, cy: y, size: 12, fill: theme.goldBright }) : '';
  return { defs: goldFadeGradient(id, theme, fade), body: line + gem };
}

/**
 * The framed panel used behind the banner and the project cards:
 * rounded surface → soft radial glow → hairline inner frame → corner ticks.
 * @param {{ id: string, width: number, height: number, theme: Theme, glowCenter?: [number, number], inset?: number }} p
 * @returns {Fragment}
 */
export function framedPanel({ id, width, height, theme, glowCenter = [0.5, 0.35], inset = 22 }) {
  const [gx, gy] = glowCenter;
  const defs = `
  <linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${theme.surfaceEdge}"/>
    <stop offset="1" stop-color="${theme.surface}"/>
  </linearGradient>
  <radialGradient id="${id}-glow" cx="${gx}" cy="${gy}" r="0.6">
    <stop offset="0" stop-color="${theme.glow}" stop-opacity="${theme.glowOpacity}"/>
    <stop offset="1" stop-color="${theme.glow}" stop-opacity="0"/>
  </radialGradient>`;

  // Corner ticks: short L-shapes that make the frame read as "engraved".
  const t = 30;
  const [l, r, top, bot] = [inset, width - inset, inset, height - inset];
  const ticks = [
    `M${l} ${top + t}V${top}H${l + t}`,
    `M${r - t} ${top}H${r}V${top + t}`,
    `M${r} ${bot - t}V${bot}H${r - t}`,
    `M${l + t} ${bot}H${l}V${bot - t}`,
  ]
    .map((d) => `<path d="${d}" fill="none" stroke="${theme.gold}" stroke-width="2"/>`)
    .join('');

  const body = `<rect width="${width}" height="${height}" rx="20" fill="url(#${id}-bg)"/>
  <rect width="${width}" height="${height}" rx="20" fill="url(#${id}-glow)"/>
  <rect x="${inset}" y="${inset}" width="${width - inset * 2}" height="${height - inset * 2}" rx="10" fill="none" stroke="${theme.gold}" stroke-opacity="${theme.frameOpacity}" stroke-width="1"/>
  ${ticks}`;
  return { defs, body };
}

/**
 * Outlined, tracked-caps tag ("chip") for tech stack labels.
 * @param {{ x: number, y: number, label: string, theme: Theme, size?: number }} p
 * @returns {{ svg: string, width: number }}  y is the chip's vertical centre
 */
export function chip({ x, y, label, theme, size = 20 }) {
  const padX = 20;
  const height = size * 2;
  const text = label.toUpperCase();
  const { width: textWidth } = measureText({ text, font: 'sansMedium', size, tracking: 0.14 });
  const width = textWidth + padX * 2;
  const capHeightOffset = size * 0.36; // visually centres caps on the chip's midline
  const label$ = setText({ text, font: 'sansMedium', size, tracking: 0.14, x: x + padX, y: y + capHeightOffset, fill: theme.ink, opacity: 0.86 });
  const box = `<rect x="${x}" y="${y - height / 2}" width="${width}" height="${height}" rx="${height / 2}" fill="none" stroke="${theme.gold}" stroke-opacity="0.55" stroke-width="1.25"/>`;
  return { svg: box + label$.svg, width };
}

/** "Opens externally" arrow (↗), drawn as strokes because Inter's Latin subset lacks the glyph. */
export function externalArrow({ x, y, size, stroke }) {
  return `<path d="M${x} ${y}L${x + size} ${y - size}M${x + size * 0.3} ${y - size}H${x + size}V${y - size * 0.3}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
}
