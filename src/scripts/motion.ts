// Metro motion for the whole site, from fluorokit/motion:
// - tilt: a pressed tile tips toward the press point (.fk-tilt).
// - turnstile, for a move deeper or back: a Start tile to its section, a
//   row to its page, a page back to its list. The old page swings shut and
//   the new one swings in, on the side that --fk-enter-dir sets.
// - continuum, with it: a blog or project row carries its title to the
//   top of its page, and the back link carries it down into the row.
// - slide: every other link to a page of this site (across the nav).
// Within one section the header holds still. The rules are in global.css.
// The page after reads the arrival from sessionStorage, in a script in the
// <head> of Base.astro, before its first paint.
import { attachTilt, continuum, continuumIn, leave } from 'fluorokit/motion';

attachTilt();

type Arrival = {
  to: string;
  at: number;
  kind: 'turnstile' | 'continuum';
  /** 1 deeper, -1 back. */
  dir: number;
  /** The same section on both pages: the header does not move. */
  holdHeader: boolean;
  from?: { left: number; top: number; fontSize: number } | null;
  /** Continuum back to a list: the href of the row to land on. */
  item?: string;
};

const shell = document.querySelector<HTMLElement>('.page-shell');
const main = document.getElementById('main');
const navPaths: string[] = JSON.parse(document.documentElement.dataset.navPaths ?? '["/"]');

const norm = (p: string) => (p.endsWith('/') ? p : p + '/');
// The section of a path: the longest nav root it starts with.
function section(path: string) {
  let best = -1;
  navPaths.forEach((root, i) => {
    if (norm(path).startsWith(norm(root)) && (best === -1 || root.length > navPaths[best].length)) best = i;
  });
  return best;
}
const depth = (p: string) => p.split('/').filter(Boolean).length;

// The side the next page comes from: the same rule as enterDirectionScript.
function direction(from: string, to: string) {
  const a = section(from);
  const b = section(to);
  if (a !== -1 && b !== -1 && a !== b) return b > a ? 1 : -1;
  return depth(to) < depth(from) ? -1 : 1;
}

function arriveNext(arrival: Omit<Arrival, 'at'>) {
  try {
    sessionStorage.setItem('fk-arrive', JSON.stringify({ ...arrival, at: Date.now() }));
  } catch {
    // No sessionStorage: the next page arrives as usual.
  }
}

// The turnstile feather: each element swings shut, top to bottom, then
// left to right, a stagger apart.
async function feather(els: Element[]) {
  const place = new Map(els.map((el) => [el, el.getBoundingClientRect()]));
  els.sort((a, b) => place.get(a)!.top - place.get(b)!.top || place.get(a)!.left - place.get(b)!.left);
  els.forEach((el, i) => {
    if (el instanceof HTMLElement) el.style.setProperty('--i', String(Math.min(i, 10)));
  });
  await Promise.all(els.map((el) => leave(el, { kind: 'turnstile' })));
}

// The title of the detail page, when this page is one.
const detailTitle = document.querySelector<HTMLElement>('.detail-title');
// A detail page's list: /blog/ for /blog/some-post/.
const listOf = (path: string) => '/' + path.split('/').filter(Boolean)[0] + '/';

let leaving = false;

document.addEventListener('click', async (e) => {
  if (!main || !shell || leaving || e.defaultPrevented || e.button !== 0) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
  if (!(a instanceof HTMLAnchorElement)) return;
  if (a.target && a.target !== '_self') return;
  if (a.hasAttribute('download') || a.dataset.noExit !== undefined) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  // A link within this page (a hash, or the same page) does not leave.
  if (url.pathname === location.pathname && url.search === location.search) return;
  // Files (the feed, the résumé PDF, images) do not get the exit.
  if (/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith('.html')) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  e.preventDefault();
  leaving = true;
  const to = url.pathname;
  const dir = direction(location.pathname, to);
  document.documentElement.style.setProperty('--fk-enter-dir', String(dir));
  const holdHeader = section(location.pathname) !== -1 && section(location.pathname) === section(to);
  const header = shell.querySelector('header');

  if (a.dataset.fkContinuum !== undefined) {
    // A row to its page: the rest of the list swings shut, then the title
    // goes up to the top of the next page.
    const title = a.matches('[data-fk-continuum-title]') ? a : a.querySelector('[data-fk-continuum-title]');
    const from = await continuum(title, { page: main, kind: 'turnstile' });
    arriveNext({ to, kind: 'continuum', dir, holdHeader, from });
  } else if (detailTitle && to === listOf(location.pathname)) {
    // A page back to its list: the content swings shut, the title stays,
    // then it goes down into its row.
    const r = detailTitle.getBoundingClientRect();
    const from = { left: r.left, top: r.top, fontSize: parseFloat(getComputedStyle(detailTitle).fontSize) };
    await feather([...main.children]);
    arriveNext({ to, kind: 'continuum', dir, holdHeader, from, item: location.pathname });
  } else if (a.classList.contains('tile')) {
    // A Start tile: the home page swings shut, tiles and all.
    const grid = main.querySelector('.tile-grid');
    await feather([
      ...(header && !holdHeader ? [...header.children] : []),
      ...[...main.children].filter((el) => el !== grid),
      ...(grid ? [...grid.children] : []),
    ]);
    arriveNext({ to, kind: 'turnstile', dir, holdHeader });
  } else {
    await leave(main);
  }
  location.href = url.href;
});

// Arrival: run the second half of a continuum from the page before.
const arrival = (window as unknown as { __fkArrive?: Arrival }).__fkArrive;
if (arrival?.kind === 'continuum') {
  const target = arrival.item
    ? (() => {
        const link = document.querySelector<HTMLElement>(`a[href="${CSS.escape(arrival.item)}"][data-fk-continuum]`);
        return link?.matches('[data-fk-continuum-title]') ? link : link?.querySelector<HTMLElement>('[data-fk-continuum-title]');
      })()
    : detailTitle;
  const r = target?.getBoundingClientRect();
  // A row below the fold has nothing to land on: show the page as usual.
  if (target && r && r.top < innerHeight) {
    continuumIn(target, { from: arrival.from }).then(done);
  } else done();
}
// The arrival marker stays (see Base.astro). Only the hide rule goes.
function done() {
  document.getElementById('fk-arrive-hide')?.remove();
}

// Back and forward can restore this page from the cache, still hidden.
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  document.querySelectorAll('.fk-exit, .fk-turnstile-out').forEach((el) => el.classList.remove('fk-exit', 'fk-turnstile-out'));
  leaving = false;
});
