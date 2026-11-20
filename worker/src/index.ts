// Cloudflare Worker: the guestbook form handler.
//
// It takes the form's classic POST, checks it, and opens a pull request that
// adds the entry as its own file under _data/guestbook/. Nothing goes live
// until the PR is merged into the deploy branch. One file per entry means
// two open PRs never conflict.
//
// Secrets (wrangler secret put):
//   GITHUB_TOKEN     fine-grained PAT on this repo: Contents read/write and
//                    Pull requests read/write
//   TURNSTILE_SECRET Cloudflare Turnstile secret key
// Also set in Cloudflare (a secret or a plain variable):
//   ALLOWED_ORIGIN   https://bigaouette.com
//
// Redirect codes the site's form script reads (src/scripts/guestbook.ts):
//   ?signed=true, ?error=fields, ?error=link, ?error=spam, ?error=server

import {
  MAX_MESSAGE,
  MAX_NAME,
  MAX_WEBSITE,
  base64Utf8,
  clean,
  entryId,
  entryYaml,
  hasLink,
  isHttpUrl,
  prBody,
  prTitle,
  type Entry,
} from './entry';

interface Env {
  GITHUB_TOKEN: string;
  TURNSTILE_SECRET: string;
  ALLOWED_ORIGIN: string;
}

const REPO = 'abbyfluoroethane/abbyfluoroethane.github.io';
const BASE_BRANCH = 'metro-rebuild';
const ENTRY_DIR = '_data/guestbook';
const GUESTBOOK_URL = 'https://bigaouette.com/guestbook/';

const redirect = (query: string) =>
  new Response(null, { status: 302, headers: { Location: `${GUESTBOOK_URL}${query}` } });

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

/** True only when Cloudflare says the token is good and was issued on the
 * site's own hostname. */
async function turnstileOk(token: string, ip: string | null, env: Env): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
  });
  const result = (await res.json()) as { success?: boolean; hostname?: string };
  const host = new URL(env.ALLOWED_ORIGIN || GUESTBOOK_URL).hostname;
  return result.success === true && result.hostname === host;
}

/** Makes a branch off the deploy branch, adds the entry file, opens the PR. */
async function openPullRequest(entry: Entry, env: Env): Promise<void> {
  const headers = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'guestbook-worker',
    'Content-Type': 'application/json',
  };
  const api = async (method: string, path: string, body?: unknown) => {
    const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`GitHub ${method} ${path}: ${res.status} ${await res.text()}`);
    return res.json() as Promise<Record<string, unknown>>;
  };

  const id = entryId(new Date(), crypto.getRandomValues(new Uint8Array(3)));
  const branch = `guestbook/${id}`;
  const title = prTitle(entry.name);

  const base = (await api('GET', `/git/ref/heads/${BASE_BRANCH}`)) as { object: { sha: string } };
  await api('POST', '/git/refs', { ref: `refs/heads/${branch}`, sha: base.object.sha });
  await api('PUT', `/contents/${ENTRY_DIR}/${id}.yml`, {
    message: title,
    content: base64Utf8(entryYaml(entry)),
    branch,
  });
  await api('POST', '/pulls', { title, head: branch, base: BASE_BRANCH, body: prBody(entry) });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env.ALLOWED_ORIGIN) });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const origin = request.headers.get('Origin');
    if (origin && origin !== env.ALLOWED_ORIGIN) {
      return new Response('Forbidden', { status: 403 });
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return redirect('?error=fields');
    }

    // Honeypot: the hidden "url" field must stay empty. A bot that fills it
    // gets the success page and nothing is saved.
    if (clean(form.get('url'), 1)) return redirect('');

    // The link check reads the raw message, before tags are stripped, so
    // <a href> markup counts as a link too.
    const rawMessage = form.get('message');
    if (typeof rawMessage === 'string' && hasLink(rawMessage)) return redirect('?error=link');

    const name = clean(form.get('name'), MAX_NAME);
    const website = clean(form.get('website'), MAX_WEBSITE);
    const message = clean(rawMessage, MAX_MESSAGE);
    if (!name || !message || (website && !isHttpUrl(website))) return redirect('?error=fields');

    const token = form.get('cf-turnstile-response');
    if (typeof token !== 'string' || !token) return redirect('?error=spam');
    try {
      if (!(await turnstileOk(token, request.headers.get('CF-Connecting-IP'), env))) {
        return redirect('?error=spam');
      }
    } catch (err) {
      console.error('Turnstile verification error:', err);
      return redirect('?error=server');
    }

    const entry: Entry = {
      name,
      ...(website ? { website } : {}),
      date: new Date().toISOString().slice(0, 10),
      message,
    };
    try {
      await openPullRequest(entry, env);
    } catch (err) {
      console.error(err);
      return redirect('?error=server');
    }
    return redirect('?signed=true');
  },
};
