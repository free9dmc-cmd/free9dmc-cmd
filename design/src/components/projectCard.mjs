/**
 * Project card — one per flagship product.
 * Left: category label → product name → one-line summary → stack chips.
 * Right: live URL. Background: an oversized, faint editorial ordinal ("01").
 */
import { framedPanel, chip, externalArrow, svgDocument } from '../primitives.mjs';
import { setText, measureText } from '../typography.mjs';
import { ACCENTS } from '../tokens.mjs';

const W = 1600;
const H = 420;
const PAD_X = 92;

/** Baselines (y) of each row, top to bottom — tweak spacing here only. */
const ROW = { label: 120, name: 214, summary: 272, chips: 346 };

/**
 * @param {import('../content.mjs').Project} project
 * @param {import('../tokens.mjs').Theme} theme
 */
export function renderProjectCard(project, theme) {
  const panel = framedPanel({ id: `card-${project.slug}`, width: W, height: H, theme, glowCenter: [0.12, 0.2] });

  // Giant ordinal sits behind everything, bottom-right, barely visible.
  const ordinal = setText({
    text: project.index, font: 'display', size: 300,
    x: W - 70, y: H - 46, anchor: 'end', fill: theme.gold, opacity: 0.07,
  });

  // Category label with a single accent dot — the only product colour used.
  const dot = `<circle cx="${PAD_X + 6}" cy="${ROW.label - 8}" r="7" fill="${ACCENTS[project.accent]}"/>`;
  const category = setText({
    text: `${project.index}  ·  ${project.category}`.toUpperCase(), font: 'sansSemibold', size: 21, tracking: 0.28,
    x: PAD_X + 28, y: ROW.label, fill: theme.gold,
  });

  const name = setText({ text: project.name, font: 'display', size: 84, tracking: 0.04, x: PAD_X - 4, y: ROW.name, fill: theme.ink });

  const summary = setText({ text: project.summary, font: 'sans', size: 31, x: PAD_X, y: ROW.summary, fill: theme.muted, maxWidth: W - PAD_X * 2 - 40 });

  // Chips flow left-to-right; each call reports its width so the next one knows where to start.
  let chipX = PAD_X;
  const chips = project.stack
    .map((label) => {
      const c = chip({ x: chipX, y: ROW.chips, label, theme, size: 20 });
      chipX += c.width + 14;
      return c.svg;
    })
    .join('');

  // Live URL, top-right, with an external-link arrow.
  const linkStyle = { text: project.host, font: 'sansMedium', size: 24, tracking: 0.06 };
  const arrowSize = 15;
  const linkRight = W - PAD_X;
  const { width: linkWidth } = measureText(linkStyle);
  const link = setText({ ...linkStyle, x: linkRight - arrowSize - 14, y: ROW.label, anchor: 'end', fill: theme.gold });
  const arrow = externalArrow({ x: linkRight - arrowSize, y: ROW.label - 2, size: arrowSize, stroke: theme.gold });
  const underline = `<rect x="${linkRight - arrowSize - 14 - linkWidth}" y="${ROW.label + 12}" width="${linkWidth}" height="1.2" fill="${theme.gold}" opacity="0.5"/>`;

  return svgDocument({
    width: W,
    height: H,
    title: `${project.name} — ${project.category}`,
    desc: `${project.summary} Built with ${project.stack.join(', ')}. ${project.url}`,
    fragments: [
      panel,
      { defs: '', body: ordinal.svg },
      { defs: '', body: dot + category.svg },
      { defs: '', body: name.svg + summary.svg },
      { defs: '', body: chips },
      { defs: '', body: link.svg + arrow + underline },
    ],
  });
}
