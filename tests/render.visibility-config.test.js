import test from "node:test";
import assert from "node:assert/strict";
import { lightingConfig } from "../src/lighting-config.js";

test("visibility calibration stays within readable baseline", () => {
  assert.ok(lightingConfig.hemisphereIntensity >= 0.7);
  assert.ok(lightingConfig.fogDensity <= 0.03);
  assert.ok(lightingConfig.exposure >= 0.9);
  assert.ok(lightingConfig.directionalIntensity >= 0.4);
});
