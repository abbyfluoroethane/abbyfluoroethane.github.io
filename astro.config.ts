import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

export default defineConfig({
  site: 'https://bigaouette.com',
  trailingSlash: 'always',
  // Astro 7 defaults to 'jsx', which drops the whitespace between elements on
  // separate lines (nav links, the status pill and the year). Keep it.
  compressHTML: true,
  prefetch: true,
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
    // Shiki emits both themes as CSS variables (--shiki-light / --shiki-dark);
    // site.css picks one with prefers-color-scheme.
    shikiConfig: {
      themes: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' },
      defaultColor: false,
    },
  },
});
