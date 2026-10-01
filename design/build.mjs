/**
 * Build script — renders every artwork file for every theme into ../assets.
 *
 *   npm run build
 *
 * Output naming: <component>-<theme>.svg, e.g. banner-dark.svg. The README
 * picks the right one per visitor with <picture> + prefers-color-scheme.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { THEMES } from './src/tokens.mjs';
import { PROJECTS, SECTIONS } from './src/content.mjs';
import { renderBanner } from './src/components/banner.mjs';
import { renderProjectCard } from './src/components/projectCard.mjs';
import { renderSectionHeader } from './src/components/sectionHeader.mjs';
import { renderFooter } from './src/components/footer.mjs';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');

/** Every artwork = a name stem + a function of the theme. */
const ARTWORK = [
  { stem: 'banner', render: renderBanner },
  ...PROJECTS.map((p) => ({ stem: `card-${p.slug}`, render: (t) => renderProjectCard(p, t) })),
  ...Object.entries(SECTIONS).map(([slug, label]) => ({ stem: `section-${slug}`, render: (t) => renderSectionHeader(label, t) })),
  { stem: 'footer', render: renderFooter },
];

mkdirSync(OUT_DIR, { recursive: true });

let totalBytes = 0;
for (const theme of Object.values(THEMES)) {
  for (const { stem, render } of ARTWORK) {
    const svg = render(theme);
    const file = join(OUT_DIR, `${stem}-${theme.name}.svg`);
    writeFileSync(file, svg);
    totalBytes += Buffer.byteLength(svg);
    console.log(`  ✓ ${stem}-${theme.name}.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
  }
}
console.log(`\n${ARTWORK.length * Object.keys(THEMES).length} files · ${(totalBytes / 1024).toFixed(0)} KB total`);
