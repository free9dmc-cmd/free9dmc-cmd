/**
 * Section header — tracked gold caps between two fading hairlines.
 * Transparent background, so it needs a dark and a light variant
 * (gold that reads on black is too pale on white, and vice-versa).
 */
import { goldRule, diamond, svgDocument } from '../primitives.mjs';
import { setText, measureText } from '../typography.mjs';

const W = 1600;
const H = 110;
const CY = 60;

/**
 * @param {string} label
 * @param {import('../tokens.mjs').Theme} theme
 */
export function renderSectionHeader(label, theme) {
  const style = { text: label.toUpperCase(), font: 'sansSemibold', size: 38, tracking: 0.38 };
  const { width } = measureText(style);
  const text = setText({ ...style, x: W / 2, y: CY + 14, anchor: 'middle', fill: theme.gold });

  // Hairlines stop short of the text with a diamond "cap" at the inner end.
  const gap = 44;
  const reach = 340;
  const leftEnd = W / 2 - width / 2 - gap;
  const rightStart = W / 2 + width / 2 + gap;
  // Each line is solid next to the text and dissolves outward.
  const left = goldRule({ id: 'hl', x1: leftEnd - reach, x2: leftEnd, y: CY, theme, withDiamond: false, fade: 'left' });
  const right = goldRule({ id: 'hr', x1: rightStart, x2: rightStart + reach, y: CY, theme, withDiamond: false, fade: 'right' });
  const caps = diamond({ cx: leftEnd, cy: CY, size: 10, fill: theme.gold }) + diamond({ cx: rightStart, cy: CY, size: 10, fill: theme.gold });

  return svgDocument({
    width: W,
    height: H,
    title: label,
    fragments: [left, right, { defs: '', body: caps + text.svg }],
  });
}
