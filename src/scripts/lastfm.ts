// Initialises every .lastfm-widget on the page from its data-* attributes
// (data-user, data-key, data-count, data-tile, data-history-id). Imported by
// LastfmWidget.astro; Astro bundles it once however many widgets are present.

interface LfmImage { "#text"?: string }
interface LfmTrack {
  name?: string;
  url?: string;
  image?: LfmImage[];
  artist?: { "#text"?: string; name?: string };
  album?: { "#text"?: string };
  date?: { uts?: string; "#text"?: string };
  "@attr"?: { nowplaying?: string };
}
interface LfmResponse { recenttracks?: { track?: LfmTrack | LfmTrack[] } }

// a cover stack, plus the timer guarding its in-flight request
type Stack = HTMLElement & { artTimer?: number | null };

interface CaptionEls {
  label?: HTMLElement;
  title?: HTMLElement;
  artist?: HTMLElement;
  album?: HTMLElement;
  coverLink?: HTMLAnchorElement;
}

// matches .art-layer's opacity transition in LastfmWidget.astro — the outgoing cover
// is only detached once the incoming one has finished fading over it
const ART_FADE = 600;
// a cover request that never settles (dead cdn, offline mid-load) would
// otherwise leave the tile shimmering for the rest of the session
const ART_TIMEOUT = 8000;
// the caption changes over at the midpoint of the cover's crossfade, where
// the two are blended evenly and neither owns the tile. .lastfm-swap in
// LastfmWidget.astro dips it out over 200ms, deliberately shorter than this: the
// caption has to be gone *before* the incoming cover is the one you can
// see, not at the same moment.
const TEXT_SWAP = ART_FADE / 2;

function artUrl(t: LfmTrack): string {
  const images = t.image || [];
  for (let i = images.length - 1; i >= 0; i--) {
    const src = images[i]["#text"];
    if (src && src.indexOf("2a96cbd8b46e442fc41c2b86b821562f") === -1) return src;
  }
  return "";
}

// every string below comes from the last.fm API, so nothing is ever
// concatenated into markup — nodes are built and filled via textContent,
// and any URL bound for an href/src has to clear safeUrl first.
function safeUrl(u: unknown): string {
  return typeof u === "string" && /^https?:\/\//i.test(u) ? u : "";
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = cls;
  return node;
}

function line<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text: string): HTMLElementTagNameMap[K] {
  const node = el(tag, cls);
  node.textContent = text;
  return node;
}

function trackArtist(t: LfmTrack): string {
  return (t.artist && (t.artist["#text"] || t.artist.name)) || "unknown artist";
}

// last.fm gives every scrobble time twice: date["#text"] rendered in UTC,
// and date.uts as a unix timestamp. formatting the timestamp puts the time
// in whatever zone the visitor is actually in. the locale is pinned to
// en-GB because it reproduces last.fm's own "17 Aug 2026, 19:01" exactly,
// so the zone is the only thing that changes.
const whenFormat: Intl.DateTimeFormat | null = window.Intl && Intl.DateTimeFormat
  ? new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  : null;

// a <time> carrying the exact instant, or null for a track with no
// scrobble time (the now-playing one). falls back to last.fm's own UTC
// string if the timestamp is missing or unparseable.
function scrobbleTime(t: LfmTrack): HTMLElement | null {
  const d = t.date || {};
  const secs = parseInt(d.uts ?? "", 10);
  const at = whenFormat && isFinite(secs) ? new Date(secs * 1000) : null;
  const text = whenFormat && at ? whenFormat.format(at) : d["#text"];
  if (!text) return null;
  const stamp = line("time", "card-date", text);
  if (at) stamp.setAttribute("datetime", at.toISOString());
  return stamp;
}

/* ---- skeletons ----
   the widget's shape is built once, up front, with a shimmering bar parked
   in every slot. filling a slot in overwrites its bar, so text lands
   without the layout shifting under it. */

function bar(width: string): HTMLElement {
  const b = el("span", "skeleton skeleton-bar");
  b.style.width = width;
  b.setAttribute("aria-hidden", "true");
  return b;
}

function setBar(node: HTMLElement, width: string): void {
  node.hidden = false;
  node.textContent = "";
  node.appendChild(bar(width));
}

// last.fm leaves the album off plenty of scrobbles, so a slot with nothing
// to show is hidden rather than left holding an empty line
function setLine(node: HTMLElement | undefined, text: string | undefined): void {
  if (!node) return;
  node.hidden = !text;
  node.textContent = text || "";
}

/* ---- album art ----
   covers arrive at their own pace and swap out from under the poll, so
   every cover on the site is a stack rather than a bare <img>: a shimmer
   on top while one is in flight, the last.fm mark underneath for tracks
   with no art, and one layer per cover so a new one can crossfade over
   whatever is already on screen. */

function makeStack(cls: string): Stack {
  const stack: Stack = el("span", "art-stack is-loading " + cls);
  const fallback = el("span", "art-fallback");
  fallback.setAttribute("aria-hidden", "true");
  const shimmer = el("span", "art-skeleton skeleton");
  shimmer.setAttribute("aria-hidden", "true");
  stack.appendChild(fallback);
  stack.appendChild(shimmer);
  return stack;
}

function settle(stack: Stack): void {
  stack.classList.remove("is-loading");
  if (stack.artTimer) {
    clearTimeout(stack.artTimer);
    stack.artTimer = null;
  }
}

function dropLayers(stack: Stack): void {
  stack.querySelectorAll(".art-layer").forEach((layer) => {
    layer.classList.remove("is-loaded");
    setTimeout(() => layer.remove(), ART_FADE);
  });
}

function showFallback(stack: Stack): void {
  stack.classList.add("is-artless");
  stack.classList.remove("has-art");
  settle(stack);
}

// a cover we are not going to get, because it errored or because it never
// settled. if a cover from an earlier track is still on screen, leave it
// there rather than dropping the mark on top of it; otherwise lift the
// shimmer and let the surface underneath stand in.
function giveUp(stack: Stack): void {
  if (stack.classList.contains("has-art")) settle(stack);
  else showFallback(stack);
}

// point a stack at a cover ("" for a track last.fm has no art for). the
// first cover is revealed by the shimmer lifting off it; every one after
// that crossfades over the cover already on screen.
// onReady fires once the stack has settled on the url asked for, whether
// that ended in a cover, the mark, or a cover that never came. it does not
// fire at all if a newer url supersedes this one — that call owns the
// stack, and brings its own onReady.
function setArt(stack: Stack | null, url: string, onReady?: () => void): void {
  const ready = onReady || (() => {});
  if (!stack || stack.dataset.art === url) {
    ready();
    return;
  }
  stack.dataset.art = url;
  if (!url) {
    dropLayers(stack);
    showFallback(stack);
    ready();
    return;
  }

  const firstPaint = stack.classList.contains("is-loading");
  const outgoing = Array.from(stack.querySelectorAll(".art-layer"));
  const layer = document.createElement("img");
  // the first cover comes up opaque behind the shimmer, so it is simply
  // there once the shimmer clears; later ones start transparent and fade
  layer.className = "art-layer" + (firstPaint ? " is-loaded" : "");
  layer.alt = "";
  layer.addEventListener("load", () => {
    if (stack.dataset.art !== url) {
      layer.remove(); // a newer cover was asked for while this one loaded
      return;
    }
    stack.classList.remove("is-artless");
    stack.classList.add("has-art");
    settle(stack);
    if (!firstPaint) {
      // reading a layout property forces the layer's opacity: 0 to be
      // computed before the class lands, so the fade has a value to run
      // from. a cached cover can fire load before the browser has styled
      // the layer at all, and without this it just snaps in.
      void layer.offsetWidth;
      layer.classList.add("is-loaded");
    }
    setTimeout(() => {
      outgoing.forEach((old) => old.remove());
    }, firstPaint ? 0 : ART_FADE);
    ready();
  });
  layer.addEventListener("error", () => {
    layer.remove();
    if (stack.dataset.art !== url) return;
    giveUp(stack);
    ready();
  });
  stack.appendChild(layer);
  layer.src = url;

  if (stack.artTimer) clearTimeout(stack.artTimer);
  stack.artTimer = window.setTimeout(() => {
    // still nothing. the load handler above still takes over if the cover
    // does turn up after this.
    if (stack.dataset.art !== url) return;
    giveUp(stack);
    ready();
  }, ART_TIMEOUT);
}

function initWidget(root: HTMLElement): void {
  const user = root.dataset.user ?? "";
  const key = root.dataset.key ?? "";
  const count = root.dataset.count ?? "1";
  const tileMode = root.dataset.tile === "true";
  const historyId = root.dataset.historyId;
  const tileEl = tileMode ? root.closest(".tile-live-tile") : null;
  // keyed by count as well as user: the home tile asks for 1 track and
  // /music/ asks for 11, and a shared key let whichever page loaded last
  // hand the other a payload too short to render
  const cacheKey = "lastfm:" + user + ":" + count;
  const endpoint = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks"
    + "&user=" + encodeURIComponent(user)
    + "&api_key=" + encodeURIComponent(key)
    + "&format=json&limit=" + encodeURIComponent(count);

  // module scripts run after the document has been parsed, so the history
  // list (further down the page on /music/) is already there to look up
  const historyList: HTMLElement | null = historyId ? document.getElementById(historyId) : null;

  /* ---- the now-playing block ---- */

  const els: CaptionEls = {};
  let stack: Stack | null = null;
  let rendered = false;
  let lastSig: string | null = null;
  let lastTracks: LfmTrack[] | null = null;
  // set once the widget has settled on a message instead of a track, so the
  // history list doesn't shimmer on as if a response were still coming
  let noticed = false;

  /* ---- caption / cover handover ----
     a cover crossfades in over ART_FADE, so writing the new title the moment
     the payload lands captions the outgoing album with the incoming track.
     the caption is held back until the cover it belongs to is ready, and
     then dips out across the first half of that crossfade and returns over
     the second — so it is never legible against art from another track. */

  let textShown = false;
  let swapTimer: number | null = null;
  let swapId = 0;

  function fadeCaption(out: boolean): void {
    [els.label, els.title, els.artist, els.album].forEach((n) => {
      if (n) n.classList.toggle("is-swapping", out);
    });
  }

  function cancelSwap(): void {
    swapId++;
    if (swapTimer) {
      clearTimeout(swapTimer);
      swapTimer = null;
    }
    fadeCaption(false);
  }

  function handOver(apply: () => void): void {
    const id = ++swapId;
    if (swapTimer) clearTimeout(swapTimer);
    fadeCaption(true);
    swapTimer = window.setTimeout(() => {
      if (id !== swapId) return; // a further track landed mid-dip
      swapTimer = null;
      apply();
      fadeCaption(false);
    }, TEXT_SWAP);
  }

  function buildTile(): void {
    root.textContent = "";
    const label = els.label = el("p", "tile-live-label lastfm-swap");
    const title = els.title = el("p", "tile-live-title lastfm-swap");
    const artist = els.artist = el("p", "tile-live-artist lastfm-swap");
    const album = els.album = el("p", "tile-live-album lastfm-swap");
    [label, title, artist, album].forEach((n) => root.appendChild(n));
    setBar(label, "40%");
    setBar(title, "85%");
    setBar(artist, "60%");
    setBar(album, "45%");
    // the art sits behind the whole tile, not just the text box, so its
    // stack goes on the tile itself rather than inside this widget
    if (tileEl) {
      stack = makeStack("tile-art");
      tileEl.insertBefore(stack, tileEl.firstChild);
    }
  }

  function buildAside(): void {
    root.textContent = "";
    const label = els.label = el("h2", "lastfm-label lastfm-swap");
    const coverLink = els.coverLink = el("a", "lastfm-cover-link");
    stack = makeStack("lastfm-cover");
    coverLink.appendChild(stack);
    const title = els.title = el("h3", "lastfm-track-title lastfm-swap");
    const artist = els.artist = el("h4", "lastfm-track-artist lastfm-swap");
    const album = els.album = el("h4", "lastfm-track-album lastfm-swap");
    root.appendChild(label);
    root.appendChild(coverLink);
    [title, artist, album].forEach((n) => root.appendChild(n));
    setBar(label, "45%");
    setBar(title, "80%");
    setBar(artist, "55%");
    setBar(album, "40%");
  }

  function setCoverLink(href: string): void {
    if (!els.coverLink) return;
    if (href) {
      els.coverLink.href = href;
      els.coverLink.target = "_blank";
      els.coverLink.rel = "noopener";
    } else {
      // an <a> with no href is inert and unfocusable, which is what a track
      // last.fm gave no url for should be
      els.coverLink.removeAttribute("href");
      els.coverLink.removeAttribute("target");
      els.coverLink.removeAttribute("rel");
    }
  }

  function renderNow(first: LfmTrack): void {
    const nowPlaying = !!(first["@attr"] && first["@attr"].nowplaying === "true");
    const label = nowPlaying ? "now playing" : "last played";
    const title = first.name || "unknown track";
    const artist = trackArtist(first);
    const album = first.album && first.album["#text"];
    const href = safeUrl(first.url);
    const art = safeUrl(artUrl(first));

    function apply(): void {
      setLine(els.label, label);
      setLine(els.title, title);
      setLine(els.artist, artist);
      setLine(els.album, album);
      setCoverLink(href);
    }

    // the first track in goes straight to the screen: what it replaces is the
    // skeleton, and there is no outgoing cover for it to caption wrongly.
    // holding it back for the art would only mean staring at bars for as long
    // as the cover takes.
    if (!textShown) {
      textShown = true;
      cancelSwap();
      apply();
      setArt(stack, art);
      return;
    }
    setArt(stack, art, () => handOver(apply));
  }

  // nothing to show, either because the account has no scrobbles or because
  // last.fm couldn't be reached and there was no cached response to fall
  // back on. the tile keeps its own colour and the last.fm mark.
  function renderNotice(text: string): void {
    noticed = true;
    // whatever cover was on its way is no longer coming, so nothing is left
    // to hand over to — and the next real track counts as a first paint again
    cancelSwap();
    textShown = false;
    setLine(els.label, "");
    setLine(els.title, text);
    setLine(els.artist, "");
    setLine(els.album, "");
    setCoverLink("");
    setArt(stack, "");
    // a message is as settled as a track — nothing else is on its way
    root.removeAttribute("aria-busy");
    clearHistory();
  }

  /* ---- history list ---- */

  function historyCard(t: LfmTrack): HTMLElement {
    const href = safeUrl(t.url);
    // a track with no usable link still gets a card, just not an anchor
    const card: HTMLElement = href ? el("a", "card lastfm-history-card") : el("div", "card lastfm-history-card");
    if (card instanceof HTMLAnchorElement) {
      card.href = href;
      card.target = "_blank";
      card.rel = "noopener";
    }
    const cover = makeStack("lastfm-history-cover");
    card.appendChild(cover);

    const info = el("span", "lastfm-history-info");
    const when = scrobbleTime(t);
    if (when) info.appendChild(when);
    info.appendChild(line("span", "card-title", t.name || "unknown track"));
    info.appendChild(line("span", "card-desc", trackArtist(t)));
    card.appendChild(info);
    setArt(cover, safeUrl(artUrl(t)));
    return card;
  }

  function buildHistorySkeleton(): void {
    const list = historyList;
    if (!list) return;
    list.textContent = "";
    list.setAttribute("aria-busy", "true");
    // one placeholder row per track the request will come back with, so the
    // list doesn't grow into place once it lands
    const rows = Math.max(1, (parseInt(count, 10) || 1) - 1);
    for (let i = 0; i < rows; i++) {
      const card = el("div", "card lastfm-history-card lastfm-history-skeleton");
      card.setAttribute("aria-hidden", "true");
      card.appendChild(el("span", "lastfm-history-cover skeleton"));
      const info = el("span", "lastfm-history-info");
      info.appendChild(bar("30%"));
      info.appendChild(bar("70%"));
      info.appendChild(bar("45%"));
      card.appendChild(info);
      list.appendChild(card);
    }
  }

  function clearHistory(): void {
    const list = historyList;
    if (!list) return;
    list.textContent = "";
    list.removeAttribute("aria-busy");
  }

  function renderHistory(tracks: LfmTrack[]): void {
    const list = historyList;
    if (!list) return;
    const rest = tracks.slice(1);
    list.textContent = "";
    list.removeAttribute("aria-busy");
    if (!rest.length) {
      list.appendChild(line("p", "lastfm-status", "nothing else scrobbled yet."));
      return;
    }
    rest.forEach((t) => list.appendChild(historyCard(t)));
  }

  /* ---- data ---- */

  // the poll runs every 30s but the answer usually hasn't changed. rebuilding
  // on an identical payload would restart every cover fade, so re-render only
  // when something actually moved.
  function signature(tracks: LfmTrack[]): string {
    return tracks.map((t) =>
      [t.name, trackArtist(t), t.album && t.album["#text"], artUrl(t),
        t.date && t.date["#text"], t["@attr"] && t["@attr"].nowplaying].join("\u001f")
    ).join("\u001e");
  }

  function render(tracks: LfmTrack[] | null | undefined): void {
    if (!tracks || !tracks.length) {
      if (!rendered) renderNotice("nothing scrobbled yet.");
      rendered = true;
      return;
    }
    const sig = signature(tracks);
    if (rendered && sig === lastSig) return;
    lastSig = sig;
    lastTracks = tracks;
    rendered = true;
    noticed = false;
    root.removeAttribute("aria-busy");
    renderNow(tracks[0]);
    renderHistory(tracks);
  }

  // by the time this runs the widget may already have settled — on a track,
  // or on a notice — so the history list is brought in line with that
  function fillHistory(): void {
    if (lastTracks) renderHistory(lastTracks);
    else if (noticed) clearHistory();
    else buildHistorySkeleton();
  }

  function fromCache(): void {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null") as { tracks?: LfmTrack[] } | null;
      if (cached && cached.tracks) render(cached.tracks);
    } catch (e) {}
  }

  function refresh(): void {
    // a backgrounded tab polling every 30s just burns quota against a
    // public api key — skip while hidden, and catch up on the way back
    if (document.hidden) return;
    fetch(endpoint)
      .then((r) => r.json() as Promise<LfmResponse>)
      .then((data) => {
        let tracks = data && data.recenttracks && data.recenttracks.track;
        if (!tracks) throw new Error("no track data");
        if (!Array.isArray(tracks)) tracks = [tracks];
        render(tracks);
        localStorage.setItem(cacheKey, JSON.stringify({ tracks, at: Date.now() }));
      })
      .catch(() => {
        if (!rendered) fromCache();
        if (!rendered) renderNotice("couldn't reach last.fm.");
      });
  }

  root.setAttribute("aria-busy", "true");
  if (tileMode) buildTile(); else buildAside();
  fromCache();
  refresh();
  // placeholders for the history list; if a cached response already landed,
  // it goes straight in instead
  if (historyId) fillHistory();
  setInterval(refresh, 30000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });
}

document.querySelectorAll<HTMLElement>(".lastfm-widget").forEach(initWidget);
