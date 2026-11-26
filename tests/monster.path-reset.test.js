import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// TODO: P0 bug — pathIndex reset on route recalc
test.skip("pathIndex is preserved when a route is recalculated for the same target", async () => {
  const source = await readFile(new URL("../src/monster.js", import.meta.url), "utf8");

  // Regression marker: this unconditional assignment resets path progress on every repath.
  assert.doesNotMatch(
    source,
    /monster\.pathIndex\s*=\s*Math\.min\(1,\s*Math\.max\(0,\s*monster\.path\.length\s*-\s*1\)\)/
  );
});
