import test from "node:test";
import assert from "node:assert/strict";
import {
  mazeMap, GRID_WIDTH, GRID_HEIGHT, cellBlocked, findPath,
  getSpawnPoints, isCellWalkable, worldToCell
} from "../src/maze-grid.js";

test("maze grid has a consistent rectangular shape and closed outer boundary", () => {
  assert.equal(mazeMap.length, GRID_HEIGHT);
  assert.ok(mazeMap.every(row => row.length === GRID_WIDTH));
  assert.ok(mazeMap[0].split("").every(cell => cell === "#"));
  assert.ok(mazeMap.at(-1).split("").every(cell => cell === "#"));
  for (const row of mazeMap) {
    assert.equal(row[0], "#");
    assert.equal(row.at(-1), "#");
  }
});

test("player start cell is open and a nearby wall blocks the player radius", () => {
  const start = worldToCell(-20, -12);
  assert.equal(isCellWalkable(start.x, start.z), true);
  assert.equal(cellBlocked(-20, -12), false);
  assert.equal(cellBlocked(-20, -12.9), true);
  assert.equal(cellBlocked(1000, 1000), true);
});

test("pathfinding returns a connected route through open cells only", () => {
  const path = findPath(-20, -12, 20, 0);
  assert.ok(path.length > 2);
  assert.deepEqual(path[0], { x: -20, z: -12 });
  assert.deepEqual(path.at(-1), { x: 20, z: 0 });
  for (const point of path) {
    const cell = worldToCell(point.x, point.z);
    assert.equal(isCellWalkable(cell.x, cell.z), true);
  }
});

test("monster spawn points are reachable, separated and never inside walls", () => {
  const spawns = getSpawnPoints(-20, -12, 4);
  assert.equal(spawns.length, 4);
  for (const point of spawns) assert.equal(cellBlocked(point.x, point.z), false);
  for (let i = 0; i < spawns.length; i++) {
    for (let j = i + 1; j < spawns.length; j++) {
      assert.ok(Math.hypot(spawns[i].x - spawns[j].x, spawns[i].z - spawns[j].z) >= 5);
    }
  }
});
