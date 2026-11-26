import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { findPath } from "./maze-grid.js";

export function spawnMonster(scene, position) {
  const root = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x343c35, roughness: 1 });
  const black = new THREE.MeshStandardMaterial({ color: 0x151a17 });
  const eyes = new THREE.MeshStandardMaterial({
    color: 0x9c7860, emissive: 0x402018, emissiveIntensity: .7
  });

  function addMesh(geometry, material, position3) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position3);
    mesh.castShadow = true;
    root.add(mesh);
    return mesh;
  }

  addMesh(new THREE.CapsuleGeometry(.28, .85, 4, 7), skin, [0, 1.1, 0]);
  addMesh(new THREE.SphereGeometry(.23, 9, 8), skin, [0, 1.9, .03]);
  addMesh(new THREE.BoxGeometry(.18, .07, .05), black, [0, 1.92, .22]);
  addMesh(new THREE.SphereGeometry(.035, 8, 8), eyes, [-.07, 1.92, .25]);
  addMesh(new THREE.SphereGeometry(.035, 8, 8), eyes, [.07, 1.92, .25]);

  for (const side of [-1, 1]) {
    addMesh(new THREE.CapsuleGeometry(.11, .62, 3, 6), skin, [side * .37, 1.15, .02]);
    addMesh(new THREE.CapsuleGeometry(.13, .7, 3, 6), skin, [side * .16, .45, 0]);
  }

  root.position.copy(position);
  scene.add(root);
  return {
    root,
    health: 3,
    phase: Math.random() * Math.PI * 2,
    speed: .72 + Math.random() * .18,
    path: [],
    pathIndex: 0,
    repathTimer: 0
  };
}

export function updateMonster(monster, playerPosition, dt) {
  monster.repathTimer -= dt;
  if (monster.repathTimer <= 0) {
    monster.path = findPath(
      monster.root.position.x,
      monster.root.position.z,
      playerPosition.x,
      playerPosition.z
    );
    monster.pathIndex = Math.min(1, Math.max(0, monster.path.length - 1));
    monster.repathTimer = .4;
  }

  const waypoint = monster.path[monster.pathIndex];
  if (waypoint) {
    const dx = waypoint.x - monster.root.position.x;
    const dz = waypoint.z - monster.root.position.z;
    const distance = Math.hypot(dx, dz);

    if (distance < .2) {
      monster.pathIndex = Math.min(monster.pathIndex + 1, monster.path.length - 1);
    } else {
      const step = Math.min(monster.speed * dt, distance);
      monster.root.position.x += dx / distance * step;
      monster.root.position.z += dz / distance * step;
      monster.root.rotation.y = Math.atan2(dx, dz);
    }
  }

  monster.phase += dt * 4;
  monster.root.position.y = Math.sin(monster.phase) * .04;
  return Math.hypot(
    playerPosition.x - monster.root.position.x,
    playerPosition.z - monster.root.position.z
  );
}
