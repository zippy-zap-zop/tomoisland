import React, { useState } from "react";
import { Sparkles, Download, RotateCcw, Search, Copy } from "lucide-react";
import { Button } from "./components/ui/button";

export default function IslandControls({ onGenerate, onDownload, onReset, islandData, seed }) {
  const [seedInput, setSeedInput] = useState("");

  const handleSearch = () => {
    const parsed = parseInt(seedInput.trim(), 10);
    if (!isNaN(parsed) && parsed > 0) {
      onGenerate(parsed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-2.5">
      <Button
        onClick={() => onGenerate(null)}
        className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-nunito font-bold text-base rounded-xl shadow-md"
      >
        Mix!
      </Button>

      {/* Seed searcher */}
      <div className="flex gap-1.5">
        <input
          type="number"
          value={seedInput}
          onChange={e => setSeedInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={seed ? String(seed) : "Enter seed…"}
          className="flex-1 h-9 px-3 rounded-xl border border-border bg-muted/40 text-sm font-nunito text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Button
          onClick={handleSearch}
          variant="outline"
          className="h-9 px-3 rounded-xl"
          title="Load seed"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {seed && (
        <Button
          onClick={() => navigator.clipboard.writeText(String(seed))}
          variant="outline"
          className="w-full h-9 font-nunito font-semibold rounded-xl text-sm"
        >
          <Copy className="w-4 h-4 mr-1.5" />
          Seed: {seed}
        </Button>
      )}

      <div className="flex gap-2">
        <Button
          onClick={onDownload}
          disabled={!islandData}
          variant="outline"
          className="flex-1 font-nunito font-semibold rounded-xl text-sm"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Save PNG
        </Button>
        <Button
          onClick={onReset}
          disabled={!islandData}
          variant="outline"
          className="flex-1 font-nunito font-semibold rounded-xl text-sm"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}