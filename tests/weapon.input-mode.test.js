import test from "node:test";
import assert from "node:assert/strict";
import { getInputMode } from "../src/input.js";

test("wide landscape touch devices use touch controls", () => {
  assert.equal(
    getInputMode(
      { innerWidth: 1280, innerHeight: 720, ontouchstart: null },
      { maxTouchPoints: 5 }
    ),
    "touch"
  );
});

test("ontouchstart feature detection enables touch controls", () => {
  assert.equal(
    getInputMode({ innerWidth: 1280, innerHeight: 720, ontouchstart: null }, { maxTouchPoints: 0 }),
    "touch"
  );
});

test("desktop devices without touch features use mouse controls", () => {
  assert.equal(
    getInputMode({ innerWidth: 1440, innerHeight: 900 }, { maxTouchPoints: 0 }),
    "mouse"
  );
});
