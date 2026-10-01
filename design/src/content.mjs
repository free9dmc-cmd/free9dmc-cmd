/**
 * Content — every word that appears in the artwork lives here, separate from
 * the drawing code. Updating a job title or a tech chip never means touching
 * layout logic (the "separate data from UI" rule, applied to graphics).
 *
 * Rule for this file: only verifiable facts. Nothing aspirational.
 */

export const IDENTITY = {
  name: 'DALLAS CAVINESS',
  roles: ['Senior Full-Stack Engineer', 'Black Rose Studios'],
  tagline: 'I design, build and run production software, end to end.',
};

/**
 * @typedef {Object} Project
 * @property {string} slug         File name stem, e.g. "charm" → card-charm-dark.svg
 * @property {string} index        Editorial ordinal shown on the card
 * @property {string} category
 * @property {string} name
 * @property {string} summary      One line; details live in the README body
 * @property {string} url
 * @property {string} host         Display form of the URL
 * @property {'charm'|'intellabets'} accent
 * @property {string[]} stack
 */

/** @type {Project[]} */
export const PROJECTS = [
  {
    slug: 'charm',
    index: '01',
    category: 'AI Messaging Platform',
    name: 'CHARM AI',
    summary: 'AI replies to inbound customer texts, built for independent sellers.',
    url: 'https://charm-ai.app',
    host: 'charm-ai.app',
    accent: 'charm',
    stack: ['Next.js', 'TypeScript', 'Prisma · Neon', 'Expo', 'Android SMS Gateway'],
  },
  {
    slug: 'intellabets',
    index: '02',
    category: 'Sports Analytics Engine',
    name: 'INTELLABETS',
    summary: 'Finds prices that beat the market consensus across 10+ sportsbooks.',
    url: 'https://intellabets.com',
    host: 'intellabets.com',
    accent: 'intellabets',
    stack: ['Next.js', 'NestJS', 'BullMQ', 'PostgreSQL', 'Docker'],
  },
];

/** Section headers rendered as artwork (slug → label). */
export const SECTIONS = {
  shipping: 'Currently Shipping',
  principles: 'How I Work',
  stack: 'Toolkit',
};

export const FOOTER = 'Black Rose Studios, Inc.  ·  Arizona';
