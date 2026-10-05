// tile cycling: swap the active item in every .tile-cycle every 15s
document.querySelectorAll(".tile-cycle").forEach((cycle) => {
  const items = cycle.querySelectorAll(".tile-cycle-item");
  if (items.length < 2) return;
  let i = 0;
  setInterval(() => {
    items[i].classList.remove("is-active");
    i = (i + 1) % items.length;
    items[i].classList.add("is-active");
  }, 15000);
});

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
