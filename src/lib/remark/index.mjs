// Plugin lists that make Astro's remark/rehype pipeline render like kramdown.
// Wired into astro.config.mjs via `markdown.remarkPlugins` / `rehypePlugins`.
import remarkSmartypants from 'remark-smartypants';
import remarkKramdown, { remarkNoAutolinkLiteral } from './remark-kramdown.mjs';
import rehypeKramdown from './rehype-kramdown.mjs';
import rehypeRouge from './rehype-rouge.mjs';

export const kramdownRemarkPlugins = [
  remarkKramdown,
  remarkNoAutolinkLiteral,
  // kramdown: --- em dash, -- en dash, ... ellipsis; quotes stay straight
  // (smart_quotes: apos, apos, quot, quot). `<<`/`>>` guillemets not handled.
  [remarkSmartypants, { quotes: false, backticks: false, dashes: 'oldschool', ellipses: true }],
];

export const kramdownRehypePlugins = [rehypeRouge, rehypeKramdown];
