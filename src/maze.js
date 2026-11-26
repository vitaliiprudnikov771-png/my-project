import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { mazeMap, cellBlocked, findPath, getSpawnPoints } from "./maze-grid.js";

export { mazeMap, cellBlocked, findPath, getSpawnPoints };

const wallGeometry = new THREE.BoxGeometry(2, 3.4, 2);
const trimGeometry = new THREE.BoxGeometry(1.42, .055, .035);
const fixtureGeometry = new THREE.BoxGeometry(.52, .07, .22);
const wallMaterials = [
  new THREE.MeshStandardMaterial({ color: 0x343b38, roughness: .92 }),
  new THREE.MeshStandardMaterial({ color: 0x3b423e, roughness: .9 })
];
const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x59615a, metalness: .42, roughness: .62 });
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x242a27, roughness: .97 });
const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x111715, roughness: 1 });
const fixtureMaterial = new THREE.MeshStandardMaterial({
  color: 0xb4aa91, emissive: 0x70674f, emissiveIntensity: .85
});

export function buildMaze(scene) {
  const group = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 30), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(50, 30), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 3.4;
  group.add(ceiling);

  for (let z = 0; z < mazeMap.length; z++) {
    for (let x = 0; x < mazeMap[z].length; x++) {
      if (mazeMap[z][x] !== "#") continue;
      const px = x * 2 - 24;
      const pz = z * 2 - 14;
      const wall = new THREE.Mesh(wallGeometry, wallMaterials[(x + z) % 2]);
      wall.position.set(px, 1.7, pz);
      wall.castShadow = true;
      wall.receiveShadow = true;
      group.add(wall);

      if ((x * 3 + z) % 7 === 0) {
        const trim = new THREE.Mesh(trimGeometry, trimMaterial);
        trim.position.set(px, 2.82, pz + 1.015);
        group.add(trim);
      }
    }
  }

  for (let z = 2; z < mazeMap.length - 1; z += 3) {
    for (let x = 2; x < mazeMap[z].length - 1; x += 5) {
      if (mazeMap[z][x] !== ".") continue;
      const px = x * 2 - 24;
      const pz = z * 2 - 14;
      const light = new THREE.PointLight(0xc4b99b, 2.2, 7, 2);
      light.position.set(px, 2.92, pz);
      group.add(light);
      const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
      fixture.position.copy(light.position);
      group.add(fixture);
    }
  }

  scene.add(group);
  return group;
}
