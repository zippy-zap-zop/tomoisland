import React from "react";
import { TERRAIN_TYPES, PATH_COLORS, SEA_COLOR } from "@/lib/blockTypes";
import { Check } from "lucide-react";

function TerrainRow({ terrain, isSelected, onClick, showSwatch, swatchColor, swatchLabel }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all border ${
        isSelected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-transparent bg-muted/40 hover:bg-muted/60"
      }`}
    >
      <span
        className="w-5 h-5 rounded-md shadow-inner flex-shrink-0"
        style={{ backgroundColor: showSwatch ? swatchColor : terrain.color }}
      />
      <span className="text-sm font-nunito font-semibold text-foreground flex-1 truncate">
        {showSwatch ? swatchLabel : terrain.label}
      </span>
      {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
    </button>
  );
}

export default function BlockPalette({ selectedTerrains, selectedPath, onToggleTerrain, onSelectPath }) {
  return (
    <div className="space-y-5">

      {/* ── TERRAIN section ── */}
      <div className="space-y-1.5">
        <p className="text-xs font-nunito font-bold text-muted-foreground uppercase tracking-wider">
          Terrain <span className="normal-case font-normal">(select multiple)</span>
        </p>

        {TERRAIN_TYPES.map((t) => {
          const isSelected = selectedTerrains.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => onToggleTerrain(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all border ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-transparent bg-muted/40 hover:bg-muted/60"
              }`}
            >
              <span className="w-5 h-5 rounded-md shadow-inner flex-shrink-0" style={{ backgroundColor: t.color }} />
              <span className="text-sm font-nunito font-semibold text-foreground flex-1 truncate">{t.label}</span>
              {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* ── PATH section ── */}
      <div className="space-y-1.5">
        <p className="text-xs font-nunito font-bold text-muted-foreground uppercase tracking-wider">
          Path
        </p>
        <p className="text-xs text-muted-foreground font-nunito -mt-1 mb-1">
          Choose which path type to use on the island roads.
        </p>

        {TERRAIN_TYPES.map((t) => {
          const pathId = t.id + "_path";
          const isSelected = selectedPath === pathId;
          return (
            <button
              key={pathId}
              onClick={() => onSelectPath(pathId)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all border ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-transparent bg-muted/40 hover:bg-muted/60"
              }`}
            >
              <span className="w-5 h-5 rounded-md shadow-inner flex-shrink-0" style={{ backgroundColor: PATH_COLORS[t.id] }} />
              <span className="text-sm font-nunito font-semibold text-foreground flex-1 truncate">
                {t.label} Path
              </span>
              {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>

    </div>
  );
}