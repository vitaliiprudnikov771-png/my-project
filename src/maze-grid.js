const RAW_MAZE = [
  "########################",
  "##....##...........####",
  "##....##.####.###..####",
  "#......#....#.#.....###",
  "#.####.####.#.#.###.###",
  "#.#..#......#.#...#...#",
  "#.#..########.###.###.#",
  "#.#.............#....#.#",
  "#.#####.#######.#.###..#",
  "#.....#.#.....#.#...#..##",
  "###.#.#.#.###.#.###.#.###",
  "#...#...#...#.#.....#...#",
  "#.#########.#.#######.#.#",
  "#...........#.........#.#",
  "########################"
];

export const CELL_SIZE = 2;
export const GRID_WIDTH = 25;
export const GRID_HEIGHT = RAW_MAZE.length;
export const WORLD_MIN_X = -25;
export const WORLD_MIN_Z = -15;
export const mazeMap = RAW_MAZE.map(row => row.padEnd(GRID_WIDTH, "#").slice(0, GRID_WIDTH));

export function worldToCell(x, z) {
  return {
    x: Math.floor((x - WORLD_MIN_X) / CELL_SIZE),
    z: Math.floor((z - WORLD_MIN_Z) / CELL_SIZE)
  };
}

export function cellToWorld(x, z) {
  return {
    x: WORLD_MIN_X + x * CELL_SIZE + CELL_SIZE / 2,
    z: WORLD_MIN_Z + z * CELL_SIZE + CELL_SIZE / 2
  };
}

export function isCellWalkable(x, z) {
  return mazeMap[z]?.[x] === ".";
}

export function cellBlocked(x, z, radius = 0.28) {
  const points = [
    [0, 0], [radius, 0], [-radius, 0],
    [0, radius], [0, -radius],
    [radius * .707, radius * .707], [radius * .707, -radius * .707],
    [-radius * .707, radius * .707], [-radius * .707, -radius * .707]
  ];
  return points.some(([dx, dz]) => {
    const cell = worldToCell(x + dx, z + dz);
    return !isCellWalkable(cell.x, cell.z);
  });
}

function getReachableCells(startX, startZ) {
  const start = worldToCell(startX, startZ);
  if (!isCellWalkable(start.x, start.z)) return [];
  const queue = [{ x: start.x, z: start.z, distance: 0 }];
  const visited = new Map([[start.x + "," + start.z, queue[0]]]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = current.x + dx;
      const z = current.z + dz;
      const key = x + "," + z;
      if (visited.has(key) || !isCellWalkable(x, z)) continue;
      const next = { x, z, distance: current.distance + 1 };
      visited.set(key, next);
      queue.push(next);
    }
  }
  return queue;
}

export function findPath(fromX, fromZ, toX, toZ) {
  const start = worldToCell(fromX, fromZ);
  const goal = worldToCell(toX, toZ);
  if (!isCellWalkable(start.x, start.z) || !isCellWalkable(goal.x, goal.z)) return [];
  const queue = [{ x: start.x, z: start.z }];
  const previous = new Map([[start.x + "," + start.z, null]]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (current.x === goal.x && current.z === goal.z) break;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = current.x + dx;
      const z = current.z + dz;
      const key = x + "," + z;
      if (previous.has(key) || !isCellWalkable(x, z)) continue;
      previous.set(key, current.x + "," + current.z);
      queue.push({ x, z });
    }
  }
  const goalKey = goal.x + "," + goal.z;
  if (!previous.has(goalKey)) return [];
  const cells = [];
  let key = goalKey;
  while (key !== null) {
    const [x, z] = key.split(",").map(Number);
    cells.push(cellToWorld(x, z));
    key = previous.get(key);
  }
  return cells.reverse();
}

export function getSpawnPoints(playerX, playerZ, count = 4) {
  const candidates = getReachableCells(playerX, playerZ)
    .filter(cell => cell.distance >= 8)
    .sort((a, b) => b.distance - a.distance);
  const selected = [];
  for (const cell of candidates) {
    if (selected.every(other => Math.abs(other.x - cell.x) + Math.abs(other.z - cell.z) >= 5)) {
      selected.push(cell);
      if (selected.length === count) break;
    }
  }
  if (selected.length < count) {
    for (const cell of candidates) {
      if (!selected.some(other => other.x === cell.x && other.z === cell.z)) selected.push(cell);
      if (selected.length === count) break;
    }
  }
  return selected.map(cell => cellToWorld(cell.x, cell.z));
}
