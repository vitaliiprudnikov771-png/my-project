import test from "node:test";
import assert from "node:assert/strict";
import { getViewportMetrics } from "../src/viewport.js";

test("viewport metrics use visual viewport dimensions when available", () => {
  assert.deepEqual(
    getViewportMetrics({
      innerWidth: 412,
      innerHeight: 915,
      devicePixelRatio: 2,
      visualViewport: { width: 390.4, height: 812.2 }
    }),
    { width: 390, height: 812, pixelRatio: 1.5 }
  );
});

test("viewport metrics fall back to window dimensions and cap DPR", () => {
  assert.deepEqual(
    getViewportMetrics({ innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1.25 }),
    { width: 1280, height: 720, pixelRatio: 1.25 }
  );
  assert.deepEqual(
    getViewportMetrics({ innerWidth: 800, innerHeight: 600, devicePixelRatio: 3 }, 2),
    { width: 800, height: 600, pixelRatio: 2 }
  );
});

test("viewport metrics guard invalid dimensions and pixel ratios", () => {
  assert.deepEqual(
    getViewportMetrics({ innerWidth: 0, innerHeight: NaN, devicePixelRatio: NaN }),
    { width: 1, height: 1, pixelRatio: 1 }
  );
});
