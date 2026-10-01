/**
 * Design tokens — the single source of truth for every colour used in the
 * profile artwork. Components never hard-code a hex value; they read from a
 * theme object. Changing the brand = editing this file only.
 *
 * Palette is lifted from the Black Rose Studios site (:root CSS variables):
 *   --black #0a0a0a · --crimson #8b0000 · --red #c0392b · --gold #d4af37
 */

/** @typedef {'dark' | 'light'} ThemeName */

/**
 * @typedef {Object} Theme
 * @property {ThemeName} name
 * @property {string} surface      Panel background (banner, cards)
 * @property {string} surfaceEdge  Slightly lifted tone for panel gradients
 * @property {string} glow         Colour of the soft radial glow
 * @property {number} glowOpacity  Peak opacity of that glow
 * @property {string} ink          Primary text
 * @property {string} muted        Secondary text
 * @property {string} gold         Accent — rules, labels, chips
 * @property {string} goldBright   Highlight end of gold gradients
 * @property {string} goldDeep     Shadow end of gold gradients
 * @property {number} frameOpacity Opacity of the hairline inner frame
 */

/** @type {Record<ThemeName, Theme>} */
export const THEMES = {
  dark: {
    name: 'dark',
    surface: '#0a0a0a',
    surfaceEdge: '#150707',
    glow: '#8b0000',
    glowOpacity: 0.42,
    ink: '#f4efe6',
    muted: '#a8a195',
    gold: '#d4af37',
    goldBright: '#f3dc8e',
    goldDeep: '#9c7a22',
    frameOpacity: 0.32,
  },
  light: {
    name: 'light',
    surface: '#faf7f1',
    surfaceEdge: '#f1e9dc',
    glow: '#c0392b',
    glowOpacity: 0.1,
    ink: '#16130f',
    muted: '#5b5449',
    gold: '#9a7520',
    goldBright: '#c9a54a',
    goldDeep: '#6f5414',
    frameOpacity: 0.45,
  },
};

/** Per-product accent colours (used sparingly: one dot per card). */
export const ACCENTS = {
  charm: '#e0457b',
  intellabets: '#8b5cf6',
};
