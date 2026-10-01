# Profile artwork

Every image in [`/assets`](../assets) is generated from code in this folder. Nothing is hand-drawn, so a change of wording or colour is a one-line edit followed by a rebuild.

```bash
npm install
npm run build   # writes ../assets/*-dark.svg and *-light.svg
```

## How it's organised

| File | Responsibility |
| --- | --- |
| `src/tokens.mjs` | Colour themes (dark / light). The only place hex values live. |
| `src/content.mjs` | Every word shown in the artwork. Data only, no layout. |
| `src/typography.mjs` | Converts text to vector outlines, with kerning and letter-spacing. |
| `src/primitives.mjs` | Reusable pieces: framed panel, gold rule, diamond, chip, arrow. |
| `src/components/*` | Banner, project card, section header, footer. Each is built only from primitives. |
| `build.mjs` | Renders every component in every theme. |

## Why the text is outlined

GitHub displays README images inside a sandboxed `<img>`, and an SVG in that context cannot load web fonts. Any live `<text>` falls back to the viewer's system font. Outlining the glyphs keeps Cinzel, Cormorant Garamond and Inter pixel-identical everywhere.

Each unique glyph is defined once per file and placed with `<use>`. That roughly halves the file size compared with drawing every letter separately.

Fonts: Cinzel, Cormorant Garamond and Inter, used under the SIL Open Font License via `@fontsource`.
