import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { readFile, readdir } from 'node:fs/promises';
import { parse } from 'yaml';
import { phosphor } from './components/phosphor';
import { combineGuestbook } from './lib/guestbook';
import { TILE_COLORS } from './lib/palette';

const ICON_NAMES = Object.keys(phosphor) as [keyof typeof phosphor, ...(keyof typeof phosphor)[]];

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
    // A date in the future embargoes the post until that day. See getPosts.
    date: z.coerce.date(),
    summary: z.string().optional(),
    subtitle: z.string().optional(),
    attribution: z.string().optional(),
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
    size: z.enum(['square', 'wide', 'large']).default('square'),
    /** A Phosphor icon name from src/components/phosphor.ts. */
    icon: z.enum(ICON_NAMES).optional(),
    /** A Catppuccin Latte accent from src/lib/palette.ts. */
    color: z.enum(TILE_COLORS).default('pink'),
    /** The live content the home tile shows. See src/pages/index.astro. */
    live: z.enum(['music', 'blog', 'projects', 'guestbook']).optional(),
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

// Guestbook entries come from two places: _data/guestbook.yml holds the
// entries from before review, and the worker's merged PRs add one file per
// entry under _data/guestbook/. File names are UTC timestamps, so name order
// is signing order. Visitors write these files, so combineGuestbook drops
// what it cannot show instead of failing the build.
const GUESTBOOK_DIR = '_data/guestbook';
const guestbook = defineCollection({
  loader: async () => {
    const legacy = await readFile('_data/guestbook.yml', 'utf8').catch(() => '');
    const names = (await readdir(GUESTBOOK_DIR).catch(() => [] as string[]))
      .filter((n) => n.endsWith('.yml'))
      .sort();
    const files = await Promise.all(names.map((n) => readFile(`${GUESTBOOK_DIR}/${n}`, 'utf8')));
    return combineGuestbook([legacy, ...files]).map((entry, index) => ({
      ...entry,
      id: String(index),
      order: index,
    }));
  },
  schema: z.object({
    order: z.number(),
    name: z.string(),
    website: z.string().optional(),
    date: z.string(),
    message: z.string(),
  }),
});

export const collections = { posts, projects, nav, gallery, guestbook };
