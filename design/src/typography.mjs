/**
 * Typography — turns strings into SVG <path> outlines.
 *
 * WHY: GitHub shows README images through a sandboxed <img> tag, and an SVG
 * inside <img> is not allowed to load web fonts. Live <text> would fall back
 * to whatever serif the viewer's OS has (usually Times). Converting every
 * glyph to vector outlines means the lettering renders identically on every
 * device — the same trick print designers use when they "outline" type.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);

/** Font files shipped by @fontsource (SIL Open Font License). */
const FONT_FILES = {
  display: '@fontsource/cinzel/files/cinzel-latin-600-normal.woff',
  serifItalic: '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff',
  sans: '@fontsource/inter/files/inter-latin-400-normal.woff',
  sansMedium: '@fontsource/inter/files/inter-latin-500-normal.woff',
  sansSemibold: '@fontsource/inter/files/inter-latin-600-normal.woff',
};

/** @typedef {keyof typeof FONT_FILES} FontName */

/** Parsed fonts are cached — parsing a font file is the slow part. */
const fontCache = new Map();

/** @param {FontName} name */
function loadFont(name) {
  if (!fontCache.has(name)) {
    const bytes = readFileSync(require.resolve(FONT_FILES[name]));
    // opentype.parse wants a standalone ArrayBuffer, not a Node Buffer view.
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    fontCache.set(name, opentype.parse(buffer));
  }
  return fontCache.get(name);
}

/**
 * @typedef {Object} TextOptions
 * @property {string} text
 * @property {FontName} font
 * @property {number} size              Font size in SVG user units
 * @property {number} [tracking=0]      Letter-spacing in em (0.1 = 10%)
 * @property {number} x
 * @property {number} y                 Baseline position
 * @property {'start'|'middle'|'end'} [anchor='start']
 * @property {string} fill
 * @property {number} [opacity=1]
 * @property {number} [maxWidth]        Shrinks the size until the line fits
 */

/**
 * Lays out glyph-by-glyph so we can apply kerning AND tracking — opentype's
 * built-in getPath() ignores letter-spacing, which luxury type relies on.
 * @param {Omit<TextOptions,'x'|'y'|'anchor'|'fill'|'opacity'>} opts
 * @returns {{ width: number, size: number, glyphs: Array<{glyph: any, x: number}> }}
 */
export function measureText({ text, font, size, tracking = 0, maxWidth }) {
  const face = loadFont(font);
  const layout = (fontSize) => {
    const scale = fontSize / face.unitsPerEm;
    // Map characters one-to-one instead of stringToGlyphs(): we control the
    // spacing ourselves, and tracked Latin caps don't want ligatures anyway.
    // (Pinned to opentype.js 1.3.4 — 2.0 emits NaN coordinates for some
    // composite glyphs in these fonts.)
    const glyphs = Array.from(text, (ch) => face.charToGlyph(ch));
    const placed = [];
    let cursor = 0;
    glyphs.forEach((glyph, i) => {
      placed.push({ glyph, x: cursor });
      const kern = i < glyphs.length - 1 ? face.getKerningValue(glyph, glyphs[i + 1]) : 0;
      const isLast = i === glyphs.length - 1;
      cursor += (glyph.advanceWidth + kern) * scale + (isLast ? 0 : tracking * fontSize);
    });
    return { width: cursor, size: fontSize, glyphs: placed };
  };

  let result = layout(size);
  if (maxWidth && result.width > maxWidth) {
    result = layout(size * (maxWidth / result.width));
  }
  return result;
}

/*
 * PERFORMANCE: glyph reuse.
 * Drawing every letter as its own path repeats the outline of "S" each time
 * it appears. Instead, each unique glyph is defined ONCE (at 1 unit = 1 font
 * unit) and every occurrence is a tiny <use> that positions and scales it.
 * svgDocument() collects the ids a file actually uses and emits only those.
 * This cut the artwork from ~540 KB to a fraction of that.
 */

/** id → outline path data, shared by every document rendered in this run. */
const glyphRegistry = new Map();

const GLYPH_REF = /#(g-[a-zA-Z]+-\d+)/g;

/** Registers a glyph's outline (in font units, y pointing down) and returns its id. */
function registerGlyph(font, glyph) {
  const id = `g-${font}-${glyph.index}`;
  if (!glyphRegistry.has(id)) {
    const face = loadFont(font);
    glyphRegistry.set(id, glyph.getPath(0, 0, face.unitsPerEm).toPathData(0));
  }
  return id;
}

/**
 * Builds <defs> entries for every glyph referenced in `markup`.
 * @param {string} markup
 */
export function glyphDefsFor(markup) {
  const ids = new Set(Array.from(markup.matchAll(GLYPH_REF), (m) => m[1]));
  return [...ids].map((id) => `<path id="${id}" d="${glyphRegistry.get(id)}"/>`).join('');
}

const round = (n) => Math.round(n * 10) / 10;

/**
 * Renders text as a group of glyph references. Returns the markup and the
 * final width so callers can position neighbouring elements (chips, dots).
 * @param {TextOptions} opts
 * @returns {{ svg: string, width: number }}
 */
export function setText(opts) {
  const { font, x, y, anchor = 'start', fill, opacity = 1 } = opts;
  const { width, size, glyphs } = measureText(opts);
  const scale = +(size / loadFont(font).unitsPerEm).toFixed(5);

  const originX = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  const uses = glyphs
    .filter(({ glyph }) => glyph.path.commands.length > 0) // spaces have no outline
    .map(({ glyph, x: gx }) => {
      const id = registerGlyph(font, glyph);
      return `<use xlink:href="#${id}" transform="translate(${round(originX + gx)} ${round(y)}) scale(${scale})"/>`;
    })
    .join('');

  const opacityAttr = opacity < 1 ? ` opacity="${opacity}"` : '';
  const svg = uses ? `<g fill="${fill}"${opacityAttr}>${uses}</g>` : '';
  return { svg, width };
}
