import { cssMs } from "../lib/cssTime";

// tile cycling: slide the active item up and out for the next in every .tile-cycle every 15s.
// the cycle holds while the tile is hovered or focused, or while "pause tiles" is pressed,
// and never runs with reduced motion. only the item on show is exposed to assistive
// technology: the others carry aria-hidden, so the tile link is named by one item.
const PAUSE_KEY = "tiles-paused";
const pauseButton = document.querySelector<HTMLButtonElement>(".tile-pause");
let paused = false;
try {
  paused = localStorage.getItem(PAUSE_KEY) === "true";
} catch {
  // storage blocked: the choice just does not persist
}

// the slide is --tile-cycle in TileLive.astro; the leaving item goes back to
// its resting spot below a moment after it is out of sight.
const SLIDE = cssMs("--tile-cycle", 550) + 50;
let cycling = false;

document.querySelectorAll(".tile-cycle").forEach((cycle) => {
  const items = cycle.querySelectorAll(".tile-cycle-item");
  if (items.length < 2) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  cycling = true;
  const tile = cycle.closest(".tile") ?? cycle;
  let i = 0;
  setInterval(() => {
    if (paused || document.hidden || tile.matches(":hover, :focus-within")) return;
    const leaving = items[i];
    leaving.classList.replace("is-active", "is-leaving");
    leaving.setAttribute("aria-hidden", "true");
    setTimeout(() => leaving.classList.remove("is-leaving"), SLIDE);
    i = (i + 1) % items.length;
    items[i].classList.add("is-active");
    items[i].removeAttribute("aria-hidden");
  }, 15000);
});

if (pauseButton && cycling) {
  pauseButton.hidden = false;
  pauseButton.setAttribute("aria-pressed", String(paused));
  pauseButton.addEventListener("click", () => {
    paused = !paused;
    pauseButton.setAttribute("aria-pressed", String(paused));
    try {
      localStorage.setItem(PAUSE_KEY, String(paused));
    } catch {
      // see above
    }
  });
}

// stagger the entrance animation by visual row, not DOM order — grid-
// auto-flow: dense means a tile's position in the markup often isn't
// its position on screen, so a flat per-item delay wouldn't line rows
// up together.
const tiles = Array.from(document.querySelectorAll<HTMLElement>(".tile-grid > a"));
const tops = tiles.map((t) => t.offsetTop);
const rows = tops
  .filter((top, i) => tops.indexOf(top) === i)
  .sort((a, b) => a - b);
tiles.forEach((t) => {
  const row = rows.indexOf(t.offsetTop);
  t.style.animationDelay = (180 + row * 70) + "ms";
});

export {};
