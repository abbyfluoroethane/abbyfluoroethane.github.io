import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

// The site uses fluorokit's ink theme (src/layouts/Base.astro).
// FK_THEME=<name> builds it with another theme, to compare palettes:
// FK_THEME=catppuccin npx astro dev --port 4322 --ignore-lock
const theme = process.env.FK_THEME;
// A file of the fluorokit package, through its exports map.
const kit = (path: string) => createRequire(import.meta.url).resolve(`fluorokit/${path}`);
const themeFile = (name: string) => kit(`themes/${name}.css`);
// The syntax theme for code blocks goes with the site theme. fluorokit
// builds one for each mode of its own themes; Catppuccin's comes with Shiki.
const active = theme ?? 'ink';
const syntax = (scheme: 'light' | 'dark') => JSON.parse(readFileSync(kit(`shiki/${active}-${scheme}.json`), 'utf8'));
const codeThemes =
  active === 'catppuccin'
    ? { light: 'catppuccin-latte', dark: 'catppuccin-mocha' }
    : { light: syntax('light'), dark: syntax('dark') };

export default defineConfig({
  site: 'https://bigaouette.com',
  trailingSlash: 'always',
  // Astro 7 defaults to 'jsx', which drops the whitespace between elements on
  // separate lines (nav links, the status pill and the year). Keep it.
  compressHTML: true,
  prefetch: true,
  vite: {
    ...(theme && {
      // A second dev server must not share the first one's cache.
      cacheDir: `node_modules/.vite-${theme}`,
      resolve: { alias: { 'fluorokit/themes/ink.css': themeFile(theme) } },
    }),
  },
  integrations: [
    sitemap({
      // The markdown stress test and the 404 page are not for search engines.
      filter: (page) => !page.includes('/extras/markdown/') && !page.includes('/404'),
    }),
  ],
  markdown: {
    // Sätteri is Astro's default processor; it is named here only to keep
    // quotes straight (the site never used curly ones). Dashes and ellipses
    // still convert.
    processor: satteri({ features: { smartPunctuation: { quotes: false } } }),
    // The theme's syntax colors on mantle (design system 1.1, color rule
    // 6). Shiki emits both themes as CSS variables (--shiki-light /
    // --shiki-dark); prose.css picks one with prefers-color-scheme.
    shikiConfig: {
      themes: codeThemes,
      defaultColor: false,
    },
  },
});
