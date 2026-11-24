// Metro motion for the whole site, from fluorokit/motion:
// - tilt: a pressed tile tips toward the press point (.fk-tilt).
// - page-exit: a click on a link to another page of this site plays the
//   exit on <main> first, then the browser loads the page. The new page
//   enters as before (enterDirectionScript in Base.astro). The exit goes
//   away from the side the next page comes from.
import { attachTilt, leave } from 'fluorokit/motion';

attachTilt();

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

let leaving = false;

document.addEventListener('click', async (e) => {
  if (!main || leaving || e.defaultPrevented || e.button !== 0) return;
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
  document.documentElement.style.setProperty('--fk-enter-dir', String(direction(location.pathname, url.pathname)));
  await leave(main);
  location.href = url.href;
});

// Back and forward can restore this page from the cache, still hidden.
window.addEventListener('pageshow', (e) => {
  if (!e.persisted || !main) return;
  main.classList.remove('fk-exit');
  leaving = false;
});
