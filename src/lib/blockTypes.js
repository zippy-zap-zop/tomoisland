// Tomodachi Life accurate block types

export const TERRAIN_TYPES = [
  { id: "arched_cobblestone", label: "Arched Cobblestone", color: "#9e9e85" },
  { id: "asphalt",            label: "Asphalt",            color: "#4a4a4a" },
  { id: "bricks",             label: "Bricks",             color: "#b05a3c" },
  { id: "cherry_blossoms",    label: "Cherry Blossoms",    color: "#f4b8cc" },
  { id: "clovers",            label: "Clovers",            color: "#4caf50" },
  { id: "cobblestone",        label: "Cobblestone",        color: "#7d7d6b" },
  { id: "concrete",           label: "Concrete",           color: "#b0b0a8" },
  { id: "dirt",               label: "Dirt",               color: "#a0734f" },
  { id: "fallen_leaves",      label: "Fallen Leaves",      color: "#c87941" },
  { id: "gold_tiles",         label: "Gold Tiles",         color: "#d4a017" },
  { id: "grass",              label: "Grass",              color: "#5cb338" },
  { id: "gravel",             label: "Gravel",             color: "#8e8e7a" },
  { id: "sand",               label: "Sand",               color: "#e8d48a" },
  { id: "snow",               label: "Snow",               color: "#e8eef4" },
  { id: "steel_plate",        label: "Steel Plate",        color: "#6e7f8d" },
  { id: "tiles",              label: "Tiles",              color: "#c8d4dc" },
  { id: "wooden_boards",      label: "Wooden Boards",      color: "#a07840" },
  { id: "sandy_beach",        label: "Sandy Beach",        color: "#f0d08c" },
];

// Path variants — slightly darker/different shade of the parent terrain
export const PATH_COLORS = {
  arched_cobblestone: "#6e6e58",
  asphalt:            "#2a2a2a",
  bricks:             "#8a3820",
  cherry_blossoms:    "#e080a0",
  clovers:            "#2e7d32",
  cobblestone:        "#555545",
  concrete:           "#888880",
  dirt:               "#6e4a2e",
  fallen_leaves:      "#a05520",
  gold_tiles:         "#b8860b",
  grass:              "#3a7a1e",
  gravel:             "#5e5e4a",
  sand:               "#c0a84c",
  snow:               "#b8c8d8",
  steel_plate:        "#485860",
  tiles:              "#8090a0",
  wooden_boards:      "#6a5020",
  sandy_beach:        "#c0a050",
};

export const SEA_COLOR = "#2277cc";

// Build flat BLOCK_TYPES map used elsewhere
export const BLOCK_TYPES = {};
for (const t of TERRAIN_TYPES) {
  BLOCK_TYPES[t.id] = { id: t.id, label: t.label, color: t.color, kind: "terrain" };
  const pathId = t.id + "_path";
  BLOCK_TYPES[pathId] = {
    id: pathId,
    label: t.label + " Path",
    color: PATH_COLORS[t.id],
    kind: "path",
    terrainId: t.id,
  };
}
BLOCK_TYPES["sea"] = { id: "sea", label: "Sea", color: SEA_COLOR, kind: "sea" };

// Building sizes (base orientation — can be rotated 90°)
export const HOUSE_W = 3;
export const HOUSE_H = 5;
export const SHOP_W  = 4;
export const SHOP_H  = 5;
export const RESTAURANT_W = 6;
export const RESTAURANT_H = 6;
export const FERRIS_W = 9;
export const FERRIS_H = 6;
export const FOUNTAIN_W = 10;
export const FOUNTAIN_H = 6;

// Colors
export const HOUSE_COLOR      = "#e07050";
export const SHOP_COLOR       = "#5090d0";
export const RESTAURANT_COLOR = "#d4709a";
export const FERRIS_COLOR     = "#f0c030";
export const FOUNTAIN_COLOR   = "#40c8e8";