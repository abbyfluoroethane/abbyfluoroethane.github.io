import { getCollection } from 'astro:content';

// getCollection does not guarantee an order, so every list sorts here.

/** All posts, newest first. */
export const getPosts = async () =>
  (await getCollection('posts')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

/** All projects, newest first. */
export const getProjects = async () =>
  (await getCollection('projects')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

/** Nav entries in file order. */
export const getNav = async () =>
  (await getCollection('nav')).sort((a, b) => a.data.order - b.data.order).map((e) => e.data);

/** Guestbook entries, newest first (the worker appends to the end of the file). */
export const getGuestbook = async () =>
  (await getCollection('guestbook')).sort((a, b) => b.data.order - a.data.order).map((e) => e.data);
