import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { site } from '../site';

const parser = new MarkdownIt({ html: true });

// Make root-relative URLs absolute so they work inside feed readers.
const abs = (v: string | undefined, base: string) =>
  v && v.startsWith('/') && !v.startsWith('//') ? new URL(v, base).href : v;

export async function GET(context: APIContext) {
  const base = context.site?.href ?? site.url + '/';
  const posts = (await getCollection('posts'))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 10);

  return rss({
    title: site.title,
    description: site.description,
    site: base,
    // Same path as the old jekyll-feed output; RSS 2.0 instead of Atom.
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: `/blog/${post.id}/`,
      content: sanitizeHtml(parser.render(post.body ?? ''), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'sup', 'sub', 'figure', 'figcaption']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          '*': ['id', 'class'],
          img: ['src', 'alt', 'title', 'width', 'height'],
        },
        transformTags: {
          a: (tag, attribs) => ({ tagName: tag, attribs: { ...attribs, href: abs(attribs.href, base) ?? '' } }),
          img: (tag, attribs) => ({ tagName: tag, attribs: { ...attribs, src: abs(attribs.src, base) ?? '' } }),
        },
      }),
    })),
  });
}
