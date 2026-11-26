import test from "node:test";
import assert from "node:assert/strict";
import { configureSimpleRender } from "../src/simple-render.js";

class FakeColor {
  constructor(value) {
    this.value = value;
  }
}

class FakeLight {
  constructor(color, intensity) {
    this.color = color;
    this.intensity = intensity;
    this.position = {
      set: (x, y, z) => {
        this.position = { x, y, z };
      }
    };
  }
}

test("simple rendering setup disables fog and uses bright neutral lighting", () => {
  const scene = {
    background: null,
    fog: {},
    children: [],
    add(object) {
      this.children.push(object);
    }
  };
  const renderer = {};
  const THREE = {
    Color: FakeColor,
    AmbientLight: FakeLight,
    DirectionalLight: FakeLight,
    SRGBColorSpace: "srgb",
    NoToneMapping: 0
  };

  const { ambientLight, directionalLight } = configureSimpleRender(scene, renderer, THREE);

  assert.equal(scene.fog, null);
  assert.equal(scene.background.value, 0x333333);
  assert.equal(renderer.outputColorSpace, THREE.SRGBColorSpace);
  assert.equal(renderer.toneMapping, THREE.NoToneMapping);
  assert.equal(renderer.toneMappingExposure, 1);
  assert.equal(ambientLight.intensity, 2.0);
  assert.equal(directionalLight.intensity, 1.5);
  assert.deepEqual(directionalLight.position, { x: -8, y: 10, z: 4 });
  assert.equal(scene.children.length, 2);
});
