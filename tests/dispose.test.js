import test from "node:test";
import assert from "node:assert/strict";
import { disposeObjectResources } from "../src/dispose.js";

function resource() {
  return { calls: 0, dispose() { this.calls++; } };
}

function tree(nodes) {
  return {
    traverse(callback) {
      for (const node of nodes) callback(node);
    }
  };
}

test("shared geometry and materials are disposed exactly once", () => {
  const geometry = resource();
  const secondGeometry = resource();
  const sharedMaterial = resource();
  const arrayMaterial = resource();

  disposeObjectResources(tree([
    { geometry, material: sharedMaterial },
    { geometry, material: [sharedMaterial, arrayMaterial] },
    { geometry: secondGeometry, material: arrayMaterial }
  ]));

  assert.equal(geometry.calls, 1);
  assert.equal(secondGeometry.calls, 1);
  assert.equal(sharedMaterial.calls, 1);
  assert.equal(arrayMaterial.calls, 1);
});

test("resource disposal safely ignores absent roots and empty resources", () => {
  assert.doesNotThrow(() => disposeObjectResources(null));
  assert.doesNotThrow(() => disposeObjectResources(tree([{}, { geometry: null, material: null }])));
});
