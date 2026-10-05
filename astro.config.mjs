import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import yaml from '@rollup/plugin-yaml';
import { unified } from '@astrojs/markdown-remark';
import { kramdownRemarkPlugins, kramdownRehypePlugins } from './src/lib/remark/index.mjs';

export default defineConfig({
  site: 'https://bigaouette.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({
      filter: (page) =>
        !page.includes('/extras/markdown/') && !/\/404(\.html|\/)?$/.test(page),
    })],
  vite: { plugins: [yaml()] },
  markdown: {
    // kramdown-compatible output; see src/lib/remark/. Astro 7 defaults to the
    // Satteri processor, which has no remark/rehype plugins, hence unified().
    processor: unified({
      smartypants: false, // done by kramdownRemarkPlugins (kramdown rules, straight quotes)
      remarkPlugins: kramdownRemarkPlugins,
      rehypePlugins: kramdownRehypePlugins,
    }),
    syntaxHighlight: false, // rehype-rouge emits Rouge-class markup instead
  },
});
