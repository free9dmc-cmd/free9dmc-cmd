/**
 * Footer — a closing gold rule and a small maker's mark,
 * like the stamp inside a leather good.
 */
import { goldRule, svgDocument } from '../primitives.mjs';
import { setText } from '../typography.mjs';
import { FOOTER } from '../content.mjs';

const W = 1600;
const H = 130;

/** @param {import('../tokens.mjs').Theme} theme */
export function renderFooter(theme) {
  const rule = goldRule({ id: 'foot', x1: W / 2 - 420, x2: W / 2 + 420, y: 40, theme });
  const mark = setText({
    text: FOOTER.toUpperCase(), font: 'sansMedium', size: 20, tracking: 0.36,
    x: W / 2, y: 100, anchor: 'middle', fill: theme.muted,
  });
  return svgDocument({ width: W, height: H, title: FOOTER, fragments: [rule, { defs: '', body: mark.svg }] });
}
