// The colors a home tile can be filled with. The names are the Catppuccin
// accent names; the values come from the fluorokit theme, as
// --fk-tile-<name>. They are the same in the dark and light modes, so the
// light text on a tile has the same contrast in both. The nav schema
// (content.config.ts) takes its color names from here, so a typo in nav.yml
// fails the build instead of falling back.
export const TILE_COLORS = [
  'rosewater', 'flamingo', 'pink', 'mauve', 'red', 'maroon', 'peach',
  'yellow', 'green', 'teal', 'sky', 'sapphire', 'blue', 'lavender',
] as const;

export type TileColor = (typeof TILE_COLORS)[number];
