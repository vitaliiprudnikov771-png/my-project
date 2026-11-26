import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export function createPlayer(scene, camera) {
  const flashlight = new THREE.SpotLight(0xe4e5d5, 65, 22, .3, .55, 1.2);
  flashlight.position.set(0, -.1, -.15);
  flashlight.target.position.set(0, 0, -8);
  camera.add(flashlight, flashlight.target);

  const cameraFill = new THREE.PointLight(0x9aa7a0, 1.2, 3);
  cameraFill.position.set(0, -.25, -.8);
  camera.add(cameraFill);

  const gun = new THREE.Group();
  const polymer = new THREE.MeshStandardMaterial({
    color: 0x202725, metalness: .28, roughness: .58
  });
  const steel = new THREE.MeshStandardMaterial({
    color: 0x505955, metalness: .78, roughness: .3
  });
  const darkSteel = new THREE.MeshStandardMaterial({
    color: 0x303734, metalness: .72, roughness: .38
  });
  const accent = new THREE.MeshStandardMaterial({
    color: 0x8b7658, metalness: .38, roughness: .48
  });

  function addPart(geometry, material, position, rotation = [0, 0, 0]) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    gun.add(mesh);
    return mesh;
  }

  addPart(new THREE.BoxGeometry(.25, .16, .58), polymer, [0, -.12, -.56]);
  addPart(new THREE.BoxGeometry(.235, .085, .48), steel, [0, -.045, -.56]);
  addPart(new THREE.BoxGeometry(.13, .055, .18), darkSteel, [0, -.07, -.87]);
  addPart(new THREE.CylinderGeometry(.043, .043, .18, 12), darkSteel,
    [0, -.055, -.91], [Math.PI / 2, 0, 0]);

  addPart(new THREE.BoxGeometry(.16, .27, .2), polymer,
    [0, -.29, -.39], [-.17, 0, 0]);
  addPart(new THREE.BoxGeometry(.115, .12, .16), darkSteel,
    [0, -.42, -.4], [-.17, 0, 0]);

  addPart(new THREE.BoxGeometry(.035, .025, .065), darkSteel, [0, .01, -.42]);
  addPart(new THREE.BoxGeometry(.035, .035, .05), darkSteel, [0, .01, -.73]);
  addPart(new THREE.BoxGeometry(.025, .045, .03), accent, [0, .01, -.73]);

  const guard = new THREE.Mesh(
    new THREE.TorusGeometry(.075, .012, 6, 18, Math.PI),
    darkSteel
  );
  guard.position.set(0, -.22, -.53);
  guard.rotation.set(Math.PI / 2, 0, Math.PI);
  gun.add(guard);

  for (let i = 0; i < 3; i++) {
    addPart(new THREE.BoxGeometry(.012, .012, .025), accent,
      [.122, -.045, -.43 - i * .055]);
  }

  gun.position.set(.38, -.38, -.5);
  camera.add(gun);

  return {
    gun,
    flashlight,
    recoil: 0,
    time: 0,
    moving: false
  };
}

export function animateWeapon(player, deltaTime) {
  player.time += deltaTime;
  player.recoil = Math.max(0, player.recoil - deltaTime * 5);
  const bob = player.moving ? Math.sin(player.time * 10) * .012 : Math.sin(player.time * 1.7) * .002;
  player.gun.position.x = .38 + (player.moving ? Math.cos(player.time * 5) * .008 : 0);
  player.gun.position.y = -.38 + Math.abs(bob);
  player.gun.position.z = -.5 + player.recoil * .08 - Math.abs(bob) * .55;
  player.gun.rotation.x = player.recoil * .12 + bob * .45;
}
