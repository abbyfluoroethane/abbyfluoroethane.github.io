import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { kramdownRemarkPlugins, kramdownRehypePlugins } from './src/lib/remark/index.mjs';

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
    processor: unified({
      smartypants: false,
      remarkPlugins: kramdownRemarkPlugins,
      rehypePlugins: kramdownRehypePlugins,
    }),
    syntaxHighlight: false,
  },
});
