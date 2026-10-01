/**
 * Banner — the hero at the top of the profile.
 * Layout (top → bottom): ornament · name · gold rule · roles · tagline.
 */
import { framedPanel, goldRule, diamond, svgDocument } from '../primitives.mjs';
import { setText, measureText } from '../typography.mjs';
import { IDENTITY } from '../content.mjs';

const W = 1600;
const H = 480;
const CX = W / 2;

/**
 * Renders a row of tracked-caps items separated by small diamonds, centred.
 * @param {{ items: string[], y: number, theme: import('../tokens.mjs').Theme }} p
 */
function roleLine({ items, y, theme }) {
  const style = { font: 'sansMedium', size: 25, tracking: 0.3 };
  const gap = 34; // space either side of each diamond
  const widths = items.map((text) => measureText({ ...style, text: text.toUpperCase() }).width);
  const total = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * gap * 2;

  let x = CX - total / 2;
  return items
    .map((text, i) => {
      const run = setText({ ...style, text: text.toUpperCase(), x, y, fill: theme.gold });
      x += widths[i];
      const sep = i < items.length - 1 ? diamond({ cx: x + gap, cy: y - 9, size: 9, fill: theme.gold, opacity: 0.8 }) : '';
      x += gap * 2;
      return run.svg + sep;
    })
    .join('');
}

/** @param {import('../tokens.mjs').Theme} theme */
export function renderBanner(theme) {
  const panel = framedPanel({ id: 'banner', width: W, height: H, theme, glowCenter: [0.5, 0.3] });

  // Top ornament: diamond flanked by short fading hairlines.
  const ornament = goldRule({ id: 'orn', x1: CX - 90, x2: CX + 90, y: 96, theme });

  const name = setText({
    text: IDENTITY.name, font: 'display', size: 104, tracking: 0.08,
    x: CX, y: 232, anchor: 'middle', fill: theme.ink, maxWidth: W - 260,
  });

  const rule = goldRule({ id: 'rule', x1: CX - 300, x2: CX + 300, y: 280, theme, withDiamond: false, weight: 1.5 });

  const tagline = setText({
    text: IDENTITY.tagline, font: 'serifItalic', size: 40,
    x: CX, y: 398, anchor: 'middle', fill: theme.muted,
  });

  return svgDocument({
    width: W,
    height: H,
    title: 'Dallas Caviness — Senior Full-Stack Engineer, Black Rose Studios',
    desc: IDENTITY.tagline,
    fragments: [
      panel,
      ornament,
      { defs: '', body: name.svg },
      rule,
      { defs: '', body: roleLine({ items: IDENTITY.roles, y: 340, theme }) },
      { defs: '', body: tagline.svg },
    ],
  });
}
