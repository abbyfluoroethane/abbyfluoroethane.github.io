import rss from '@astrojs/rss';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getCollection, render } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '../site';

// Make root-relative URLs absolute so they work inside feed readers.
const absolutize = (html: string, base: string) =>
  html.replace(
    /\b(src|href|srcset)="(\/[^"]*)"/g,
    (match, attr: string, value: string) => {
      if (value.startsWith('//')) return match;
      if (attr === 'srcset') {
        const fixed = value
          .split(',')
          .map((part) => part.trim().replace(/^(\/\S*)/, (u) => new URL(u, base).href))
          .join(', ');
        return `${attr}="${fixed}"`;
      }
      return `${attr}="${new URL(value, base).href}"`;
    },
  );

export async function GET(context: APIContext) {
  const base = context.site?.href ?? site.url + '/';
  const posts = (await getCollection('posts'))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 10);

  // Render each post with the real pipeline so images get their built URLs.
  const container = await AstroContainer.create();
  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await render(post);
      const html = await container.renderToString(Content);
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary,
        link: `/blog/${post.id}/`,
        content: absolutize(html, base),
      };
    }),
  );

  return rss({
    title: site.title,
    description: site.description,
    site: base,
    // Same path as the old jekyll-feed output; RSS 2.0 instead of Atom.
    items,
  });
}
