import { marked } from 'marked';

// Single-paragraph inline markdown (emphasis, links) -> html string.
export function inlineMarkdown(src: string): string {
  return marked.parseInline(src, { async: false }).trim();
}
