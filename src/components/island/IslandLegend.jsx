import React from "react";
import { BLOCK_TYPES, HOUSE_COLOR, SHOP_COLOR, RESTAURANT_COLOR, FERRIS_COLOR, FOUNTAIN_COLOR, SEA_COLOR } from "./lib/blockTypes";

export default function IslandLegend({ terrainIds, pathId, numHouses, onHighlight, highlightId }) {
  if (!terrainIds || terrainIds.length === 0) return null;
  const path = BLOCK_TYPES[pathId];
  
  const handleClick = (id) => {
    onHighlight(highlightId === id ? null : id);
  };

  const terrainEntries = terrainIds.map((id) => BLOCK_TYPES[id]).filter(Boolean).map((t) => ({ color: t.color, label: t.label, id: t.id }));

  const entries = [
  ...terrainEntries,
  path && { color: path.color, label: path.label, id: pathId },
  { color: "#f0d08c", label: "Sandy Beach", id: "sandy_beach" },
  { color: "#4aaddd", label: "Pond", id: "pond" },
  { color: SEA_COLOR, label: "Sea", id: "sea" },
  { color: FOUNTAIN_COLOR, label: "Fountain", id: "fountain" },
  numHouses > 7 && { color: FERRIS_COLOR, label: "Ferris Wheel", id: "ferris_wheel" },
  { color: HOUSE_COLOR, label: "House", id: "house" },
  { color: SHOP_COLOR, label: "Shop", id: "shop" },
  { color: RESTAURANT_COLOR, label: "Restaurant", id: "restaurant" }].
  filter(Boolean);

  return (
    <div className="mt-4 pt-4 border-t border-border/40">
      <p className="text-xs font-nunito font-bold text-muted-foreground uppercase tracking-wider mb-2">Legend (click!)</p>
      <div className="flex flex-wrap gap-3">
        {entries.map((e, i) =>
        <button key={i} onClick={() => handleClick(e.id)} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer">
            <span className="w-3 h-3 rounded-sm shadow-inner flex-shrink-0" style={{ backgroundColor: e.color }} />
            <span className="text-xs font-nunito text-muted-foreground">{e.label}</span>
          </button>
        )}
      </div>
    </div>);

}