import React, { useState, useCallback, useRef } from "react";
import { generateIsland, getIslandSize } from "./lib/islandGenerator";
import BlockPalette from "./components/island/BlockPalette";
import BuildingControls from "./components/island/BuildingControls";
import IslandCanvas from "./components/island/IslandCanvas";
import IslandControls from "./components/island/IslandControls";
import IslandHeader from "./components/island/IslandHeader";
import IslandLegend from "./components/island/IslandLegend";
import IslandGallery from "./components/island/IslandGallery";
import { ScrollArea } from "./components/ui/scroll-area";
import { motion } from "framer-motion";

export default function TOMOisland() {
  const [selectedTerrains, setSelectedTerrains] = useState(["grass"]);
  const [selectedPath, setSelectedPath] = useState("dirt_path");
  const [numHouses, setNumHouses] = useState(5);
  const [numShops, setNumShops] = useState(2);
  const [numRestaurants, setNumRestaurants] = useState(1);
  const [seaPercent, setSeaPercent] = useState(15);
  const [islandData, setIslandData] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const canvasRef = useRef(null);

  const handleToggleTerrain = useCallback((id) => {
    setSelectedTerrains((prev) =>
    prev.includes(id) ?
    prev.length > 1 ? prev.filter((t) => t !== id) : prev // keep at least 1
    : [...prev, id]
    );
  }, []);

  const handleGenerate = useCallback(() => {
    const data = generateIsland({
      terrainIds: selectedTerrains,
      pathId: selectedPath,
      numHouses,
      numShops,
      numRestaurants,
      seaPercent
    });
    setIslandData(data);
  }, [selectedTerrains, selectedPath, numHouses, numShops, numRestaurants, seaPercent]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `island_${islandData?.seed ?? "unknown"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [islandData]);

  const handleReset = useCallback(() => setIslandData(null), []);

  return (
    <div className="min-h-screen bg-background font-nunito">
      <div className="zigzag-pattern mx-auto p-4 max-w-[1600px] md:p-6">
        <IslandHeader />

        <div className="flex flex-col lg:flex-row gap-5">
          {/* ── Sidebar ── */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:w-72 xl:w-80 flex-shrink-0">
            
            <div className="bg-card rounded-2xl shadow-sm ring-1 ring-border/40 p-4 space-y-4">
              <IslandControls
                onGenerate={handleGenerate}
                onDownload={handleDownload}
                onReset={handleReset}
                islandData={islandData}
                seed={islandData?.seed} />
              

              <div className="border-t border-border/40" />

              <BuildingControls
                numHouses={numHouses}
                numShops={numShops}
                numRestaurants={numRestaurants}
                onHousesChange={setNumHouses}
                onShopsChange={setNumShops}
                onRestaurantsChange={setNumRestaurants}
                seaPercent={seaPercent}
                onSeaPercentChange={setSeaPercent} />
              

              <div className="border-t border-border/40" />

              <ScrollArea className="h-[calc(100vh-520px)] lg:h-[calc(100vh-480px)] pr-1">
                <BlockPalette
                  selectedTerrains={selectedTerrains}
                  selectedPath={selectedPath}
                  onToggleTerrain={handleToggleTerrain}
                  onSelectPath={setSelectedPath} />
                
              </ScrollArea>
            </div>
          </motion.aside>

          {/* ── Island display ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex-1 min-w-0">
            
            <div className="bg-card rounded-2xl shadow-sm ring-1 ring-border/40 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-nunito font-bold text-lg text-foreground">Your Island</h2>
                <span className="text-xs text-muted-foreground font-nunito font-semibold bg-muted px-2.5 py-1 rounded-full">
                  {(() => {const s = getIslandSize(numHouses);return `${s.width} × ${s.height}`;})()}
                </span>
              </div>

              <div ref={canvasRef}>
                <IslandCanvas islandData={islandData} highlightId={highlightId} />
              </div>

              <IslandLegend 
                terrainIds={selectedTerrains} 
                pathId={selectedPath} 
                numHouses={numHouses}
                onHighlight={setHighlightId}
                highlightId={highlightId} />
            </div>

            <IslandGallery currentSeed={islandData?.seed} />
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border/40 text-center space-y-2">
          <p className="text-sm font-nunito text-muted-foreground">
            TOMOisland is not affiliated with Nintendo
          </p>
          <p className="text-sm font-nunito text-muted-foreground">
            contact me: <a href="mailto:zipzapzopstop@gmail.com" className="text-primary hover:underline">zipzapzopstop@gmail.com</a>
          </p>
        </footer>
      </div>
    </div>);

}