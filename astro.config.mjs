import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import yaml from '@rollup/plugin-yaml';
import remarkSmartypants from 'remark-smartypants';

export default defineConfig({
  site: 'https://bigaouette.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  vite: { plugins: [yaml()] },
  markdown: {
    smartypants: false,
    remarkPlugins: [[remarkSmartypants, { quotes: false }]],
  },
});
