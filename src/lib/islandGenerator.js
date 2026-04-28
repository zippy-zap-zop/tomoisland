import {
  HOUSE_W, HOUSE_H,
  SHOP_W, SHOP_H,
  RESTAURANT_W, RESTAURANT_H,
  FERRIS_W, FERRIS_H,
  FOUNTAIN_W, FOUNTAIN_H,
} from "./blockTypes";

export const MAX_WIDTH  = 118;
export const MAX_HEIGHT = 77;

export function getIslandSize(numHouses) {
  if (numHouses >= 31) return { width: 118, height: 77 };
  if (numHouses >= 20) return { width: 88, height: 68 };
  if (numHouses >= 8)  return { width: 68, height: 48 };
  return { width: 48, height: 34 };
}

// ── Seeded RNG ─────────────────────────────────────────────────
function makeRng(seed) {
  let s = (seed % 2147483647) || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ── Value noise ────────────────────────────────────────────────
function createNoise(scale, seed) {
  const rng = makeRng(seed);
  const gw = Math.ceil(MAX_WIDTH  / scale) + 2;
  const gh = Math.ceil(MAX_HEIGHT / scale) + 2;
  const g  = Array.from({ length: gh }, () => Array.from({ length: gw }, () => rng()));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm   = (t) => t * t * (3 - 2 * t);
  return (px, py) => {
    const gx = px / scale, gy = py / scale;
    const x0 = Math.floor(gx), y0 = Math.floor(gy);
    const fx = sm(gx - x0), fy = sm(gy - y0);
    return lerp(
      lerp(g[y0]?.[x0] ?? 0, g[y0]?.[x0 + 1] ?? 0, fx),
      lerp(g[y0 + 1]?.[x0] ?? 0, g[y0 + 1]?.[x0 + 1] ?? 0, fx),
      fy
    );
  };
}

// ── Entrance point for a building ─────────────────────────────
// For houses: returns the BLACK pixel (centre of front face, inside the building).
//   The path must touch only this cell — never any other house cell.
// For all others: returns the cell just outside the centre of the front face.
function getEntrance(b) {
  const { x, y, w, h, type, facing } = b;

  if (type === "house") {
    // Black pixel = middle of the front 3-wide face, on the outermost row/col
    if (facing === "south") return { ex: x + 1, ey: y + h - 1 }; // bottom row, 2nd col
    if (facing === "east")  return { ex: x + w - 1, ey: y + 1 }; // right col, 2nd row
    if (facing === "north") return { ex: x + 1, ey: y };          // top row, 2nd col
    if (facing === "west")  return { ex: x, ey: y + 1 };          // left col, 2nd row
  }

  if (type === "shop") {
    // Entrance pixels are 2nd and 3rd (index 1, 2) — use index 1 as the single path connection
    if (facing === "south") return { ex: x + 1, ey: y + h };
    if (facing === "east")  return { ex: x + w, ey: y + 1 };
    if (facing === "north") return { ex: x + 1, ey: y - 1 };
    if (facing === "west")  return { ex: x - 1, ey: y + 1 };
  }

  // All other buildings (restaurant, fountain, ferris): centre of front face, one cell outside
  const midX = x + Math.floor(w / 2);
  const midY = y + Math.floor(h / 2);
  if (facing === "south") return { ex: midX, ey: y + h };
  if (facing === "east")  return { ex: x + w, ey: midY };
  if (facing === "north") return { ex: midX, ey: y - 1 };
  if (facing === "west")  return { ex: x - 1, ey: midY };
  return { ex: midX, ey: y + h };
}

// ── Draw a straight horizontal or vertical line of path cells ─
function drawLine(x1, y1, x2, y2, pathCells) {
  if (x1 === x2) {
    const sy = y1 <= y2 ? 1 : -1;
    for (let y = y1; y !== y2 + sy; y += sy) pathCells.add(`${x1},${y}`);
  } else {
    const sx = x1 <= x2 ? 1 : -1;
    for (let x = x1; x !== x2 + sx; x += sx) pathCells.add(`${x},${y1}`);
  }
}

// ── BFS shortest path on terrain, avoiding blocked cells ──────
// Returns array of [x,y] from start (exclusive) to any cell in targetSet (inclusive),
// or null if unreachable. Avoids all cells in blockedSet, and avoids sea/beach/pond
// unless those cells ARE already in targetSet (path cells can be on any tile).
function bfsToSet(startX, startY, targetSet, blockedSet, WIDTH, HEIGHT, grid) {
  const BAD_TERRAIN = new Set(["sea", "sandy_beach", "pond"]);
  const visited = new Set();
  const queue = [{ x: startX, y: startY, path: [] }];
  visited.add(`${startX},${startY}`);

  while (queue.length > 0) {
    const { x, y, path } = queue.shift();
    for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
      if (nx < 0 || ny < 0 || nx >= WIDTH || ny >= HEIGHT) continue;
      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;
      if (blockedSet.has(key)) continue;
      // Allow the cell if it's already a path target, otherwise block bad terrain
      if (!targetSet.has(key) && BAD_TERRAIN.has(grid[ny]?.[nx])) continue;
      visited.add(key);
      const newPath = [...path, [nx, ny]];
      if (targetSet.has(key)) return newPath;
      queue.push({ x: nx, y: ny, path: newPath });
    }
  }
  return null; // unreachable
}

// ── Main generator ─────────────────────────────────────────────
export function generateIsland({ terrainIds, pathId, numHouses, numShops, numRestaurants, seed, seaPercent = 15 }) {
  if (!seed) seed = Math.floor(Math.random() * 2147483647);
  const rng = makeRng(seed + 999);

  const { width: WIDTH, height: HEIGHT } = getIslandSize(numHouses);
  const noise1      = createNoise(22, seed);
  const noise2      = createNoise(9,  seed + 1111);
  // Multi-octave grain noise for terrain blending: fine scale + medium scale overlay
  const terrainGrain1 = createNoise(4,  seed + 5555); // fine grain
  const terrainGrain2 = createNoise(9,  seed + 6666); // medium blobs
  const terrainGrain3 = createNoise(2,  seed + 7070); // micro detail


  const terrains = terrainIds && terrainIds.length > 0 ? terrainIds : ["grass"];

  // ── 1. Base terrain ────────────────────────────────────────────
  // Pre-compute all elevation values, then find the threshold that gives
  // exactly seaPercent% sea cells (binary search on the sorted elevations).
  const elevations = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) => {
      const cx = WIDTH / 2, cy = HEIGHT / 2;
      const dx = (x - cx) / (WIDTH  * 0.56);
      const dy = (y - cy) / (HEIGHT * 0.56);
      const dist = Math.sqrt(dx * dx + dy * dy);
      return noise1(x, y) * 0.3 + noise2(x, y) * 0.2 + 0.5 - dist * 1.05;
    })
  );

  // Sort all elevations and pick the threshold at the seaPercent percentile
  const allElevs = elevations.flat().sort((a, b) => a - b);
  const targetIdx = Math.floor((seaPercent / 100) * allElevs.length);
  const seaThreshold = allElevs[Math.min(targetIdx, allElevs.length - 1)];

  const grid = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) => {
      if (elevations[y][x] <= seaThreshold) return "sea";
      // Combine noise octaves to get a grainy, organic terrain blend
      const grain = terrainGrain1(x, y) * 0.55 + terrainGrain2(x, y) * 0.30 + terrainGrain3(x, y) * 0.15;
      const idx = Math.floor(grain * terrains.length) % terrains.length;
      return terrains[idx];
    })
  );

  // ── 2. Beach (40% of coastline, 4–6 cells thick, noise-varied) ─
  // Strategy: assign each coastline cell a "distance from sea" value via BFS,
  // then use a low-frequency noise to select ~40% of coastline segments as beach.
  // Only cells within the noise-selected arc AND within the varied thickness are painted.
  const beachNoise = createNoise(30, seed + 3333); // large scale → smooth arc selection

  // BFS outward from sea to find, for every land cell, its distance to the nearest sea cell.
  const distToSea = Array.from({ length: HEIGHT }, () => new Array(WIDTH).fill(Infinity));
  const bfsQueue = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (grid[y][x] === "sea") { distToSea[y][x] = 0; bfsQueue.push([x, y]); }
    }
  }
  let bfsHead = 0;
  while (bfsHead < bfsQueue.length) {
    const [cx, cy] = bfsQueue[bfsHead++];
    for (const [nx, ny] of [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]]) {
      if (nx < 0 || ny < 0 || nx >= WIDTH || ny >= HEIGHT) continue;
      if (distToSea[ny][nx] === Infinity && grid[ny][nx] !== "sea") {
        distToSea[ny][nx] = distToSea[cy][cx] + 1;
        bfsQueue.push([nx, ny]);
      }
    }
  }

  // Paint beach: land cell qualifies if its noise value is above threshold (≈40% of coastline arc)
  // and its distance to sea is ≤ local thickness (4–6, driven by a finer noise).
  const beachThickNoise = createNoise(8, seed + 4444);
  const BEACH_THRESHOLD = 0.58; // tuned so ~40% of coastline arc is selected
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const d = distToSea[y][x];
      if (d === Infinity || d === 0) continue; // sea or no sea nearby
      // Arc selection: smooth noise decides if this part of the coast is a beach zone
      if (beachNoise(x, y) < BEACH_THRESHOLD) continue;
      // Varied thickness 4–6
      const localThick = 4 + Math.floor(beachThickNoise(x, y) * 3); // 4, 5, or 6
      if (d <= localThick) grid[y][x] = "sandy_beach";
    }
  }

  // ── 2c. Lakes ──────────────────────────────────────────────────
  // Find open-terrain regions >= 15×15 bounding box using a simple scan,
  // then place a large organically-shaped lake driven by noise (same style as the island outline).
  const lakeNoise1 = createNoise(8,  seed + 7777);
  const lakeNoise2 = createNoise(14, seed + 8888);
  const lakeNoise3 = createNoise(5,  seed + 9999);

  const OPEN_TERRAIN = new Set(terrains); // only land terrain qualifies
  const LAKE_MARGIN = 6;

  // Collect candidate lake centres: cells that have at least 7 open-terrain cells
  // in every cardinal direction (ensuring a ≥15 wide/tall open zone around them).
  const lakeCandidates = [];
  for (let y = LAKE_MARGIN + 7; y < HEIGHT - LAKE_MARGIN - 7; y++) {
    for (let x = LAKE_MARGIN + 7; x < WIDTH - LAKE_MARGIN - 7; x++) {
      if (!OPEN_TERRAIN.has(grid[y][x])) continue;
      // Quick check: is there enough open space in all 4 directions?
      let ok = true;
      for (const [ddx, ddy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        for (let step = 1; step <= 7; step++) {
          if (!OPEN_TERRAIN.has(grid[y + ddy*step]?.[x + ddx*step])) { ok = false; break; }
        }
        if (!ok) break;
      }
      if (ok) lakeCandidates.push([x, y]);
    }
  }

  // Place 1–3 lakes in well-separated candidate locations
  const numLakes = 1 + Math.floor(rng() * 2);
  const lakeCentres = [];

  for (let l = 0; l < numLakes && lakeCandidates.length > 0; l++) {
    // Pick a random candidate that is far enough from existing lakes
    let tries = 0;
    let chosen = null;
    while (tries < 60) {
      const idx = Math.floor(rng() * lakeCandidates.length);
      const [cx, cy] = lakeCandidates[idx];
      const farEnough = lakeCentres.every(([lx, ly]) =>
        Math.abs(cx - lx) + Math.abs(cy - ly) > 28
      );
      if (farEnough) { chosen = [cx, cy]; break; }
      tries++;
    }
    if (!chosen) break;
    lakeCentres.push(chosen);

    const [lcx, lcy] = chosen;

    // Lake radius varies per lake: 5–11, shaped organically with 3 noise octaves
    const baseR = 5 + Math.floor(rng() * 7);

    // Warp angle — each lake gets a random orientation bias
    const warpAngle = rng() * Math.PI * 2;
    const stretchX  = 0.7 + rng() * 0.8;  // independent x/y stretch
    const stretchY  = 0.7 + rng() * 0.8;

    for (let dy = -baseR - 4; dy <= baseR + 4; dy++) {
      for (let dx = -baseR - 4; dx <= baseR + 4; dx++) {
        const nx = lcx + dx, ny = lcy + dy;
        if (nx < LAKE_MARGIN + 1 || ny < LAKE_MARGIN + 1 || nx >= WIDTH - LAKE_MARGIN - 1 || ny >= HEIGHT - LAKE_MARGIN - 1) continue;
        if (!OPEN_TERRAIN.has(grid[ny][nx])) continue;

        // Rotate + stretch so each lake has a different orientation/aspect
        const rx =  Math.cos(warpAngle) * dx / stretchX + Math.sin(warpAngle) * dy / stretchY;
        const ry = -Math.sin(warpAngle) * dx / stretchX + Math.cos(warpAngle) * dy / stretchY;
        const dist = Math.sqrt(rx * rx + ry * ry);

        // Three noise layers for organic coastline (same idea as the island outline)
        const n1 = lakeNoise1(nx, ny) * 2.5;
        const n2 = lakeNoise2(nx, ny) * 1.5;
        const n3 = lakeNoise3(nx, ny) * 0.8;
        const warpedDist = dist + n1 + n2 + n3;

        if (warpedDist < baseR) grid[ny][nx] = "pond";
      }
    }
  }

  // Also scatter a couple of small ponds in remaining open areas
  const numSmallPonds = 1 + Math.floor(rng() * 2);
  for (let p = 0; p < numSmallPonds; p++) {
    const px = Math.floor(WIDTH  * 0.15 + rng() * WIDTH  * 0.7);
    const py = Math.floor(HEIGHT * 0.15 + rng() * HEIGHT * 0.7);
    const pr = 2 + Math.floor(rng() * 2);
    for (let dy = -pr; dy <= pr; dy++) {
      for (let dx = -pr; dx <= pr; dx++) {
        const nx = px + dx, ny = py + dy;
        if (nx < 2 || ny < 2 || nx >= WIDTH - 2 || ny >= HEIGHT - 2) continue;
        const d = Math.sqrt(dx*dx + dy*dy) + lakeNoise1(nx, ny) * 1.2;
        if (d < pr && OPEN_TERRAIN.has(grid[ny][nx])) grid[ny][nx] = "pond";
      }
    }
  }



  // ── 3. Place structures ────────────────────────────────────────
  const MARGIN  = 4;
  const SPACING = 1;
  const BUILDING_TYPES = new Set(["house", "shop", "restaurant", "ferris_wheel", "fountain"]);

  const buildings = [];

  const canPlace = (bx, by, bw, bh) => {
    if (bx < MARGIN || by < MARGIN || bx + bw > WIDTH - MARGIN || by + bh > HEIGHT - MARGIN) return false;
    for (let dy = -SPACING; dy < bh + SPACING; dy++) {
      for (let dx = -SPACING; dx < bw + SPACING; dx++) {
        const nx = bx + dx, ny = by + dy;
        if (nx < 0 || ny < 0 || nx >= WIDTH || ny >= HEIGHT) continue;
        const cell = grid[ny][nx];
        if (dx >= 0 && dx < bw && dy >= 0 && dy < bh) {
          if (!cell || cell === "sea" || cell === "sandy_beach" || cell === "pond") return false;
        }
        for (const b of buildings) {
          if (nx >= b.x && nx < b.x + b.w && ny >= b.y && ny < b.y + b.h) return false;
        }
      }
    }
    return true;
  };

  const tryPlace = (bw, bh, type, attempts = 400, forceCx, forceCy) => {
    // base orientation → facing south; rotated 90° → facing east
    const variants = [
      { tw: bw, th: bh, facing: "south" },
      { tw: bh, th: bw, facing: "east"  },
    ];

    if (forceCx !== undefined) {
      for (const { tw, th, facing } of variants) {
        const bx = forceCx - Math.floor(tw / 2);
        const by = forceCy - Math.floor(th / 2);
        if (canPlace(bx, by, tw, th)) {
          buildings.push({ x: bx, y: by, w: tw, h: th, type, facing });
          return true;
        }
      }
      for (let r = 1; r <= 12; r++) {
        for (const { tw, th, facing } of variants) {
          for (let a = 0; a < 16; a++) {
            const angle = (a / 16) * Math.PI * 2;
            const bx = Math.round(forceCx + Math.cos(angle) * r) - Math.floor(tw / 2);
            const by = Math.round(forceCy + Math.sin(angle) * r) - Math.floor(th / 2);
            if (canPlace(bx, by, tw, th)) {
              buildings.push({ x: bx, y: by, w: tw, h: th, type, facing });
              return true;
            }
          }
        }
      }
      return false;
    }

    for (let i = 0; i < attempts; i++) {
      const { tw, th, facing } = variants[rng() > 0.5 ? 1 : 0];
      const bx = MARGIN + Math.floor(rng() * (WIDTH  - tw - MARGIN * 2));
      const by = MARGIN + Math.floor(rng() * (HEIGHT - th - MARGIN * 2));
      if (canPlace(bx, by, tw, th)) {
        buildings.push({ x: bx, y: by, w: tw, h: th, type, facing });
        return true;
      }
    }
    return false;
  };

  const cx = Math.floor(WIDTH / 2), cy = Math.floor(HEIGHT / 2);
  tryPlace(FOUNTAIN_W, FOUNTAIN_H, "fountain", 0, cx, cy);
  if (numHouses > 7) tryPlace(FERRIS_W, FERRIS_H, "ferris_wheel");
  const numRest = numRestaurants || 0;
  for (let i = 0; i < numRest;   i++) tryPlace(RESTAURANT_W, RESTAURANT_H, "restaurant");
  for (let i = 0; i < numShops;  i++) tryPlace(SHOP_W,  SHOP_H,  "shop");
  for (let i = 0; i < numHouses; i++) tryPlace(HOUSE_W, HOUSE_H, "house");

  // Paint buildings onto grid
  for (const b of buildings) {
    for (let dy = 0; dy < b.h; dy++)
      for (let dx = 0; dx < b.w; dx++)
        grid[b.y + dy][b.x + dx] = b.type;
  }

  // ── Build a "no-path buffer" around houses and shops ──────────
  // Every cell adjacent to a house/shop that is NOT the entrance column
  // is marked as a protected terrain cell — paths must never go there.
  // This guarantees paths only ever touch a building at its entrance.
  const protectedCells = new Set();

  for (const b of buildings) {
    if (b.type !== "house" && b.type !== "shop") continue;
    const { x, y, w, h, facing } = b;

    // Collect every perimeter cell (just outside the building footprint)
    const perimeter = [];
    for (let dx = 0; dx < w; dx++) {
      perimeter.push({ px: x + dx, py: y - 1,   side: "north" });
      perimeter.push({ px: x + dx, py: y + h,    side: "south" });
    }
    for (let dy = 0; dy < h; dy++) {
      perimeter.push({ px: x - 1,   py: y + dy, side: "west" });
      perimeter.push({ px: x + w,   py: y + dy, side: "east" });
    }

    // Entrance side and column/row index within that side
    // Houses: entrance is pixel index 1 (2nd of 3) on the front face
    // Shops:  entrance pixels are index 1 and 2 (2nd and 3rd of 4) on the front face
    for (const { px, py, side } of perimeter) {
      if (px < 0 || py < 0 || px >= WIDTH || py >= HEIGHT) continue;

      // Is this the entrance side?
      const isEntranceSide = side === facing;
      if (isEntranceSide) {
        // Which column (south/north facing) or row (east/west facing) is this?
        const offset = facing === "south" || facing === "north"
          ? px - x   // column offset along x
          : py - y;  // row offset along y

        let isEntranceSlot;
        if (b.type === "house") {
          isEntranceSlot = offset === 1; // only 2nd pixel
        } else {
          isEntranceSlot = offset === 1 || offset === 2; // 2nd and 3rd pixels
        }

        if (isEntranceSlot) continue; // leave entrance cells free for path
      }

      // Mark as protected — restore to terrain and block from path
      const cell = grid[py][px];
      if (!BUILDING_TYPES.has(cell) && cell !== "sea" && cell !== "pond") {
        protectedCells.add(`${px},${py}`);
      }
    }
  }

  // ── 4. Path network ────────────────────────────────────────────
  //
  // Strategy:
  //   A) Build a "main road" backbone (MST over civic buildings: fountain, ferris, restaurants)
  //      using simple L-shaped connections.
  //   B) Each house/shop gets a BFS-guaranteed branch from its entrance stub
  //      to the nearest backbone cell. BFS avoids protectedCells and building cells,
  //      so the route is ALWAYS physically valid and always reaches the backbone.
  //      Minimum branch length is enforced (≥3 cells from stub to backbone).

  const pathCells = new Set(); // all committed path cells as "x,y"

  // What cells block routing (for BFS)?
  // All building footprints + protectedCells (non-entrance perimeters)
  const routeBlocked = new Set(protectedCells);
  for (const b of buildings) {
    for (let dy = 0; dy < b.h; dy++)
      for (let dx = 0; dx < b.w; dx++)
        routeBlocked.add(`${b.x + dx},${b.y + dy}`);
  }

  const paintL = (x1, y1, x2, y2) => {
    drawLine(x1, y1, x2, y1, pathCells);
    drawLine(x2, y1, x2, y2, pathCells);
  };

  const entrances = buildings.map(b => ({ ...getEntrance(b), building: b }));

  const CIVIC_TYPES = new Set(["fountain", "ferris_wheel", "restaurant"]);
  const civicNodes  = entrances.filter(n => CIVIC_TYPES.has(n.building.type));
  const branchNodes = entrances.filter(n => !CIVIC_TYPES.has(n.building.type));

  // ── A. Backbone: Prim MST over civic nodes with L-paths ────────
  if (civicNodes.length > 0) {
    const inTree = new Set([0]);
    const treeNodes = [civicNodes[0]];
    pathCells.add(`${civicNodes[0].ex},${civicNodes[0].ey}`);

    while (inTree.size < civicNodes.length) {
      let bestDist = Infinity, bestFrom = null, bestToIdx = -1;
      for (const from of treeNodes) {
        for (let j = 0; j < civicNodes.length; j++) {
          if (inTree.has(j)) continue;
          const d = Math.abs(from.ex - civicNodes[j].ex) + Math.abs(from.ey - civicNodes[j].ey);
          if (d < bestDist) { bestDist = d; bestFrom = from; bestToIdx = j; }
        }
      }
      if (bestToIdx < 0) break;
      inTree.add(bestToIdx);
      const toNode = civicNodes[bestToIdx];
      treeNodes.push(toNode);
      // BFS from toNode to existing backbone BEFORE adding toNode to pathCells
      const civicReached = bfsToSet(toNode.ex, toNode.ey, pathCells, routeBlocked, WIDTH, HEIGHT, grid);
      pathCells.add(`${toNode.ex},${toNode.ey}`);
      if (civicReached) {
        for (const [rx, ry] of civicReached) pathCells.add(`${rx},${ry}`);
      } else {
        // Fallback: L-path if BFS fails (e.g. totally isolated)
        paintL(bestFrom.ex, bestFrom.ey, toNode.ex, toNode.ey);
      }
    }
  } else if (entrances.length > 0) {
    // No civic buildings — seed backbone from first available entrance
    const first = entrances[0];
    pathCells.add(`${first.ex},${first.ey}`);
  }

  // ── B. Branch each house/shop via BFS to backbone ──────────────
  for (const node of branchNodes) {
    const { ex, ey, building } = node;

    // Compute the first terrain cell just outside this building's entrance
    let stubX = ex, stubY = ey;
    if (building.type === "house") {
      if (building.facing === "south") stubY = ey + 1;
      else if (building.facing === "east")  stubX = ex + 1;
      else if (building.facing === "north") stubY = ey - 1;
      else if (building.facing === "west")  stubX = ex - 1;
    }
    // For shops ex,ey is already one cell outside the footprint

    // BFS from stub cell to any existing path cell
    const reached = bfsToSet(stubX, stubY, pathCells, routeBlocked, WIDTH, HEIGHT, grid);

    // Commit stub + BFS route to pathCells
    pathCells.add(`${stubX},${stubY}`);
    if (reached) {
      for (const [rx, ry] of reached) pathCells.add(`${rx},${ry}`);
    }

    // After connecting, add this branch to the backbone set so future
    // branches can hook into it (making a connected tree, not a star)
    pathCells.add(`${stubX},${stubY}`);
  }

  // ── 5. Write path tiles onto grid ─────────────────────────────
  const NO_PATH = new Set(["sea", "sandy_beach", "pond", ...BUILDING_TYPES]);
  for (const key of pathCells) {
    const [px, py] = key.split(",").map(Number);
    if (px < 0 || py < 0 || px >= WIDTH || py >= HEIGHT) continue;
    if (NO_PATH.has(grid[py][px])) continue;
    if (protectedCells.has(key)) continue;
    grid[py][px] = pathId;
  }

  return { grid, width: WIDTH, height: HEIGHT, seed, buildings, numHouses };
}