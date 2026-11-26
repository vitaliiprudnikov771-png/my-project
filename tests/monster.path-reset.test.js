import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/monster.js", import.meta.url), "utf8");
const executableSource = source
  .replace(/^import \* as THREE from [^\n]+;\r?\n/m, "")
  .replace(/^import \{ findPath \} from [^\n]+;\r?\n/m, "")
  .replace(/^export function /gm, "function ");

const harnessSource = `export function createMonsterHarness(findPath) {
${executableSource}
return { updateMonster };
}`;
const harnessUrl = `data:text/javascript;base64,${Buffer.from(harnessSource).toString("base64")}`;
const { createMonsterHarness } = await import(harnessUrl);

function createMonster(path, pathIndex) {
  return {
    root: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { y: 0 }
    },
    path,
    pathIndex,
    repathTimer: 0,
    phase: 0,
    speed: 0.7
  };
}

test("keeps the existing route and pathIndex when the target node is unchanged", () => {
  const originalPath = [
    { x: 0, z: 0 },
    { x: 1, z: 0 },
    { x: 2, z: 0 },
    { x: 3, z: 0 }
  ];
  const recalculatedPath = [
    { x: 0, z: 0 },
    { x: 0, z: 1 },
    { x: 1, z: 1 },
    { x: 2, z: 1 },
    { x: 3, z: 0 }
  ];
  const { updateMonster } = createMonsterHarness(() => recalculatedPath);
  const monster = createMonster(originalPath, 2);

  updateMonster(monster, { x: 0, z: 0 }, 0);

  assert.strictEqual(monster.path, originalPath);
  assert.equal(monster.pathIndex, 2);
});

test("replaces the route and resets pathIndex when the target node changes", () => {
  const originalPath = [
    { x: 0, z: 0 },
    { x: 1, z: 0 },
    { x: 2, z: 0 }
  ];
  const newPath = [
    { x: 0, z: 0 },
    { x: 0, z: 1 },
    { x: 0, z: 2 },
    { x: 0, z: 3 }
  ];
  const { updateMonster } = createMonsterHarness(() => newPath);
  const monster = createMonster(originalPath, 2);

  updateMonster(monster, { x: 0, z: 0 }, 0);

  assert.strictEqual(monster.path, newPath);
  assert.equal(monster.pathIndex, 1);
});
