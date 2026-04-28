import React from "react";
import { Minus, Plus } from "lucide-react";
import { HOUSE_COLOR, SHOP_COLOR, RESTAURANT_COLOR, FERRIS_COLOR, FOUNTAIN_COLOR } from "@/lib/blockTypes";
import { Slider } from "@/components/ui/slider";

function Counter({ label, value, onChange, color, size, max = 30 }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <span className="w-4 h-4 rounded-sm flex-shrink-0 shadow-inner" style={{ backgroundColor: color }} />
      <div className="flex-1">
        <p className="text-sm font-nunito font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground font-nunito">{size}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-nunito font-bold text-foreground">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, color, size, note }) {
  return (
    <div className="flex items-center gap-2 py-2 opacity-70">
      <span className="w-4 h-4 rounded-sm flex-shrink-0 shadow-inner" style={{ backgroundColor: color }} />
      <div className="flex-1">
        <p className="text-sm font-nunito font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground font-nunito">{size}</p>
      </div>
      <span className="text-xs text-muted-foreground font-nunito italic">{note}</span>
    </div>
  );
}

export default function BuildingControls({ numHouses, numShops, numRestaurants, onHousesChange, onShopsChange, onRestaurantsChange, seaPercent, onSeaPercentChange }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-nunito font-bold text-sm text-foreground uppercase tracking-wide">Sea</h2>
        <span className="text-sm font-nunito font-bold text-foreground">{seaPercent}%</span>
      </div>
      <Slider
        min={1}
        max={60}
        step={1}
        value={[seaPercent]}
        onValueChange={([v]) => onSeaPercentChange(v)}
        className="mb-3"
      />

      <h2 className="font-nunito font-bold text-sm text-foreground uppercase tracking-wide mb-1">
        Buildings
      </h2>
      <Counter
        label="Houses"
        value={numHouses}
        onChange={onHousesChange}
        color={HOUSE_COLOR}
        size="3 × 5 (rotatable)"
        max={70}
      />
      <Counter
        label="Shops"
        value={numShops}
        onChange={onShopsChange}
        color={SHOP_COLOR}
        size="4 × 5 (rotatable)"
      />
      <Counter
        label="Restaurants"
        value={numRestaurants}
        onChange={onRestaurantsChange}
        color={RESTAURANT_COLOR}
        size="6 × 6 (rotatable)"
        max={10}
      />
      <InfoRow
        label="Fountain"
        color={FOUNTAIN_COLOR}
        size="10 × 6 · always placed"
        note="1 per island"
      />
      {numHouses > 7 && (
        <InfoRow
          label="Ferris Wheel"
          color={FERRIS_COLOR}
          size="9 × 6 (rotatable)"
          note="auto (>7 houses)"
        />
      )}
    </div>
  );
}