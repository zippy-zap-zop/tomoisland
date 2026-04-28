import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BLOCK_TYPES, SEA_COLOR,
  HOUSE_COLOR, SHOP_COLOR, RESTAURANT_COLOR, FERRIS_COLOR, FOUNTAIN_COLOR
} from "@/lib/blockTypes";

const CELL = 5;
const RULER = 20;

const BUILDING_COLORS = {
  house:        HOUSE_COLOR,
  shop:         SHOP_COLOR,
  restaurant:   RESTAURANT_COLOR,
  ferris_wheel: FERRIS_COLOR,
  fountain:     FOUNTAIN_COLOR,
  pond:         "#4aaddd",
};

function getColor(blockId) {
  if (!blockId || blockId === "sea") return SEA_COLOR;
  if (BUILDING_COLORS[blockId]) return BUILDING_COLORS[blockId];
  if (BLOCK_TYPES[blockId]) return BLOCK_TYPES[blockId].color;
  return "#cccccc";
}

export default function IslandCanvas({ islandData, highlightId }) {
  const canvasRef = useRef(null);
  const [boldGrid, setBoldGrid] = useState(false);

  useEffect(() => {
    if (!islandData || !canvasRef.current) return;
    const { grid, width, height } = islandData;
    const canvas = canvasRef.current;
    const cw = RULER + width  * CELL;
    const ch = RULER + height * CELL;
    canvas.width  = cw;
    canvas.height = ch;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, cw, ch);

    // ── Draw cells ──────────────────────────────────────────
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = getColor(grid[y][x]);
        ctx.fillRect(RULER + x * CELL, RULER + y * CELL, CELL, CELL);
      }
    }

    // ── Draw grid lines ──────────────────────────────────────
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth   = 0.5;
    for (let x = 0; x <= width; x++) {
      if (boldGrid && x % 5 === 0) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
      } else {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
      }
      ctx.beginPath();
      ctx.moveTo(RULER + x * CELL, RULER);
      ctx.lineTo(RULER + x * CELL, RULER + height * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      if (boldGrid && y % 5 === 0) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
      } else {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
      }
      ctx.beginPath();
      ctx.moveTo(RULER,            RULER + y * CELL);
      ctx.lineTo(RULER + width * CELL, RULER + y * CELL);
      ctx.stroke();
    }

    // ── Draw rulers ──────────────────────────────────────────
    ctx.fillStyle   = "#f4f6f8";
    ctx.fillRect(0, 0, cw, RULER);           // top strip
    ctx.fillRect(0, 0, RULER, ch);           // left strip

    ctx.fillStyle    = "#555";
    ctx.font         = "9px sans-serif";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";

    // Column labels (1–118), every 5
    for (let x = 1; x <= width; x++) {
      if (x === 1 || x % 5 === 0) {
        ctx.fillText(String(x), RULER + (x - 0.5) * CELL, RULER / 2);
      }
    }
    // Row labels (1–78), every 5
    ctx.textAlign = "right";
    for (let y = 1; y <= height; y++) {
      if (y === 1 || y % 5 === 0) {
        ctx.fillText(String(y), RULER - 2, RULER + (y - 0.5) * CELL);
      }
    }

    // ── Draw highlight overlay ───────────────────────────────────
    if (highlightId) {
      ctx.fillStyle = "rgba(220, 38, 38, 0.65)";
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (grid[y][x] === highlightId) {
            ctx.fillRect(RULER + x * CELL, RULER + y * CELL, CELL, CELL);
          }
        }
      }
    }

    // ── Draw house entrances on top (black, always visible) ─────
    if (islandData.buildings) {
      ctx.fillStyle = "#111111";
      for (const b of islandData.buildings) {
        if (b.type !== "house") continue;
        let ex, ey;
        if (b.facing === "south") { ex = b.x + 1; ey = b.y + b.h - 1; }
        else if (b.facing === "east")  { ex = b.x + b.w - 1; ey = b.y + 1; }
        else if (b.facing === "north") { ex = b.x + 1; ey = b.y; }
        else                           { ex = b.x;     ey = b.y + 1; }
        ctx.fillRect(RULER + ex * CELL, RULER + ey * CELL, CELL, CELL);
      }
    }

    // Corner square
    ctx.fillStyle = "#e8eaec";
    ctx.fillRect(0, 0, RULER, RULER);
  }, [islandData, highlightId, boldGrid]);

  if (!islandData) {
    return (
      <div className="w-full h-64 rounded-xl bg-muted/40 border-2 border-dashed border-border flex items-center justify-center">
        <p className="text-muted-foreground font-nunito font-semibold text-sm text-center px-4">
          Mix!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          onClick={() => setBoldGrid(!boldGrid)}
          variant={boldGrid ? "default" : "outline"}
          className="font-nunito font-semibold rounded-xl"
        >
          Grid
        </Button>
      </div>
      <div className="w-full overflow-auto rounded-xl shadow-inner bg-muted/20 border border-border/50 p-2">
        <canvas
          ref={canvasRef}
          style={{ imageRendering: "pixelated", display: "block" }}
        />
      </div>
    </div>
  );
}