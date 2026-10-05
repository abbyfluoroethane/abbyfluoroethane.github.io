import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

// The YAML data files are plain lists without ids. This parser gives each
// entry an id and keeps the list position in `order`, because a collection
// does not guarantee the file order.
type Entry = Record<string, unknown>;
const listParser =
  (idOf: (entry: Entry, index: number) => string) =>
  (text: string): Entry[] =>
    (parse(text) as Entry[]).map((entry, index) => ({
      ...entry,
      id: idOf(entry, index),
      order: index,
    }));

const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '**/*.md',
    // Keep the Jekyll URL: the file name without the YYYY-MM-DD- prefix.
    generateId: ({ entry }) =>
      entry.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    status: z.enum(['active', 'archive']),
    article: z.boolean().default(false),
    featured: z.boolean().default(false),
    // An empty string in front matter means "no link".
    external_url: z
      .union([z.url(), z.literal('')])
      .optional()
      .transform((v) => v || undefined),
    url_text: z.string().optional(),
  }),
});

// Home tiles and the nav bar. See the field notes at the top of the file.
const nav = defineCollection({
  loader: file('src/data/nav.yml', { parser: listParser((e) => String(e.name)) }),
  schema: z.object({
    order: z.number(),
    name: z.string(),
    url: z.string(),
    icon: z.string(),
    size: z.enum(['square', 'wide', 'large']).default('square'),
    color: z.string().default('pink'),
    navbar: z.boolean().default(true),
  }),
});

const gallery = defineCollection({
  loader: file('src/data/gallery.yml', {
    parser: (text) =>
      listParser((e) => String(e.filename))(text).map((e) => ({
        ...e,
        // image() resolves paths relative to the data file.
        image: `../assets/images/gallery/${String(e.filename)}`,
      })),
  }),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      image: image(),
      alt: z.string().default(''),
      caption: z.string().optional(),
    }),
});

// The guestbook worker commits new entries to the end of _data/guestbook.yml.
// Do not move or rename this file.
const guestbook = defineCollection({
  loader: file('_data/guestbook.yml', { parser: listParser((_e, i) => String(i)) }),
  schema: z.object({
    order: z.number(),
    name: z.string(),
    website: z.string().optional(),
    date: z.string(),
    message: z.string(),
  }),
});

export const collections = { posts, projects, nav, gallery, guestbook };
