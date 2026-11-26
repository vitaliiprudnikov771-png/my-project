import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { buildMaze, cellBlocked, getSpawnPoints } from "./maze.js";
import { createPlayer, animateWeapon } from "./player.js";
import { spawnMonster, updateMonster } from "./monster.js";
import { AudioSystem } from "./audio.js";
import { GameSession } from "./session.js";
import { getViewportMetrics } from "./viewport.js";
import { createFrameLoop } from "./frame-loop.js";
import { disposeObjectResources } from "./dispose.js";

const $ = selector => document.querySelector(selector);
const canvas = $("#game");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080c0a);
scene.fog = new THREE.FogExp2(0x080c0a, .045);

const initialViewport = getViewportMetrics(window);
const camera = new THREE.PerspectiveCamera(75, initialViewport.width / initialViewport.height, .1, 70);
camera.position.set(-20, 1.65, -12);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(initialViewport.pixelRatio);
renderer.setSize(initialViewport.width, initialViewport.height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .85;

scene.add(new THREE.HemisphereLight(0x69756d, 0x111713, .45));
const fillLight = new THREE.DirectionalLight(0x9aa49a, .25);
fillLight.position.set(-8, 10, 4);
fillLight.castShadow = true;
fillLight.shadow.mapSize.set(1024, 1024);
fillLight.shadow.camera.left = -28;
fillLight.shadow.camera.right = 28;
fillLight.shadow.camera.top = 20;
fillLight.shadow.camera.bottom = -20;
scene.add(fillLight);

const mazeRoot = buildMaze(scene);
const player = createPlayer(scene, camera);
const audio = new AudioSystem();
const monsters = [];
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();

const session = new GameSession();
let health = 100;
let ammo = 12;
let reserve = 48;
let yaw = Math.PI;
let pitch = 0;
let flashlightOn = true;
let shootCooldown = 0;
let reloadTime = 0;
let damageCooldown = 0;
let footstepTimer = 0;
let noteTimer = 0;
let mouseLooking = false;
let lastMouse = null;
let joystickPointer = null;
let lookPointer = null;
let lastLook = null;
const keyboard = new Set();
const touchMove = { x: 0, y: 0 };
const move = { x: 0, y: 0 };

function show(screen) {
  $("#menu").classList.toggle("hidden", screen !== "menu");
  $("#pausemenu").classList.toggle("hidden", screen !== "pause");
  $("#endmenu").classList.toggle("hidden", screen !== "end");
  $("#hud").classList.toggle("hidden", screen !== "game");
  document.body.classList.toggle("playing", screen === "game");
}

function note(message) {
  const element = $("#notice");
  element.textContent = message;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => {
    element.textContent = "";
  }, 1800);
}

function updateHud() {
  $("#health").textContent = String(health);
  $("#healthbar").style.width = health + "%";
  $("#ammo").textContent = ammo + " / " + reserve;
  $("#objective").textContent = monsters.length
    ? "HOSTILES: " + monsters.length
    : "AREA SECURED";
}

function updateMove() {
  const keyX = Number(keyboard.has("KeyD") || keyboard.has("ArrowRight"))
    - Number(keyboard.has("KeyA") || keyboard.has("ArrowLeft"));
  const keyY = Number(keyboard.has("KeyW") || keyboard.has("ArrowUp"))
    - Number(keyboard.has("KeyS") || keyboard.has("ArrowDown"));
  let x = keyX + touchMove.x;
  let y = keyY + touchMove.y;
  const length = Math.hypot(x, y);
  if (length > 1) {
    x /= length;
    y /= length;
  }
  move.x = x;
  move.y = y;
}

function disposeMonster(monster) {
  scene.remove(monster.root);
  disposeObjectResources(monster.root);
}

function resetInput() {
  keyboard.clear();
  touchMove.x = 0;
  touchMove.y = 0;
  move.x = 0;
  move.y = 0;
  joystickPointer = null;
  lookPointer = null;
  lastLook = null;
  mouseLooking = false;
  lastMouse = null;
  $("#stick-knob").style.transform = "";
}

function requestMouseCapture() {
  if (innerWidth <= 760 || !canvas.requestPointerLock) return;
  try {
    const result = canvas.requestPointerLock();
    result?.catch?.(() => {});
  } catch {
    // Right-button drag remains available when pointer lock is denied.
  }
}

function start() {
  session.start();
  audio.start();
  monsters.forEach(disposeMonster);
  monsters.length = 0;

  health = 100;
  ammo = 12;
  reserve = 48;
  shootCooldown = 0;
  reloadTime = 0;
  damageCooldown = 0;
  footstepTimer = 0;
  yaw = Math.PI;
  pitch = 0;
  camera.position.set(-20, 1.65, -12);
  camera.rotation.set(pitch, yaw, 0, "YXZ");
  resetInput();

  const spawnPoints = getSpawnPoints(camera.position.x, camera.position.z, 4);
  for (const point of spawnPoints) {
    monsters.push(spawnMonster(scene, new THREE.Vector3(point.x, 0, point.z)));
  }

  updateHud();
  show("game");
  clock.getDelta();
  frameLoop.start();
  requestMouseCapture();
}

function pause() {
  if (session.state !== "game") return;
  session.pause();
  frameLoop.stop();
  resetInput();
  if (document.pointerLockElement) document.exitPointerLock();
  show("pause");
}

function end() {
  session.end();
  frameLoop.stop();
  resetInput();
  if (document.pointerLockElement) document.exitPointerLock();
  show("end");
}

function reload() {
  if (session.state !== "game" || reloadTime > 0 || ammo >= 12 || reserve <= 0) return;
  reloadTime = 1.1;
  note("RELOADING");
}

function fire() {
  if (session.state !== "game" || shootCooldown > 0 || reloadTime > 0) return;
  if (ammo <= 0) {
    note("EMPTY");
    audio.tone(200, .06, "square");
    return;
  }

  ammo--;
  shootCooldown = .25;
  player.recoil = .8;
  audio.shot();

  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const targets = raycaster.intersectObjects(monsters.map(monster => monster.root), true);
  const obstacles = raycaster.intersectObject(mazeRoot, true);
  const targetHit = targets[0];
  const wallHit = obstacles[0];

  if (targetHit && (!wallHit || targetHit.distance < wallHit.distance)) {
    const monster = monsters.find(item => item.root === targetHit.object.parent
      || item.root.children.includes(targetHit.object));
    if (monster) {
      monster.health--;
      audio.hit();
      if (monster.health <= 0) {
        disposeMonster(monster);
        monsters.splice(monsters.indexOf(monster), 1);
        note("TARGET DOWN");
        updateHud();
      }
    }
  }

  updateHud();
}

function toggleFlashlight() {
  flashlightOn = !flashlightOn;
  player.flashlight.intensity = flashlightOn ? 65 : 0;
  note(flashlightOn ? "LIGHT ON" : "LIGHT OFF");
}

function tryMove(deltaX, deltaZ) {
  const radius = .28;
  const nextX = camera.position.x + deltaX;
  const nextZ = camera.position.z + deltaZ;
  if (!cellBlocked(nextX, camera.position.z, radius)) camera.position.x = nextX;
  if (!cellBlocked(camera.position.x, nextZ, radius)) camera.position.z = nextZ;
}

function update(deltaTime) {
  if (session.state !== "game") return;

  shootCooldown = Math.max(0, shootCooldown - deltaTime);
  damageCooldown = Math.max(0, damageCooldown - deltaTime);

  if (reloadTime > 0) {
    reloadTime -= deltaTime;
    if (reloadTime <= 0) {
      const loaded = Math.min(12 - ammo, reserve);
      ammo += loaded;
      reserve -= loaded;
      updateHud();
    }
  }

  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const direction = right.multiplyScalar(move.x).add(forward.multiplyScalar(move.y));
  if (direction.lengthSq() > 1) direction.normalize();

  const stepX = direction.x * 3.4 * deltaTime;
  const stepZ = direction.z * 3.4 * deltaTime;
  tryMove(stepX, stepZ);

  if (direction.lengthSq() > .01) {
    footstepTimer -= deltaTime;
    if (footstepTimer <= 0) {
      audio.step();
      footstepTimer = .45;
    }
  }

  for (const monster of monsters) {
    const distance = updateMonster(monster, camera.position, deltaTime);
    if (distance < 1.3 && damageCooldown <= 0) {
      health = Math.max(0, health - 12);
      damageCooldown = 1;
      updateHud();
      note("YOU ARE INJURED");
      if (health === 0) {
        end();
        break;
      }
    }
  }

  player.moving = direction.lengthSq() > .01;
  animateWeapon(player, deltaTime);
}

function applyLook(deltaX, deltaY, sensitivity = .004) {
  yaw -= deltaX * sensitivity;
  pitch = THREE.MathUtils.clamp(pitch - deltaY * sensitivity, -1.1, 1.1);
  camera.rotation.set(pitch, yaw, 0, "YXZ");
}

const frameLoop = createFrameLoop(() => {
  update(Math.min(clock.getDelta(), .05));
  renderer.render(scene, camera);
}, {
  request: callback => window.requestAnimationFrame(callback),
  cancel: handle => window.cancelAnimationFrame(handle)
});
renderer.render(scene, camera);

$("#start").addEventListener("click", start);
$("#resume").addEventListener("click", () => {
  session.resume();
  show("game");
  clock.getDelta();
  frameLoop.start();
  requestMouseCapture();
});
$("#quit").addEventListener("click", () => {
  session.quit();
  frameLoop.stop();
  resetInput();
  if (document.pointerLockElement) document.exitPointerLock();
  show("menu");
});
$("#restart").addEventListener("click", start);
$("#pause").addEventListener("click", pause);
$("#reload").addEventListener("click", reload);
$("#mreload").addEventListener("click", reload);
$("#flash").addEventListener("click", toggleFlashlight);
$("#mflash").addEventListener("click", toggleFlashlight);
$("#fire").addEventListener("click", fire);

window.addEventListener("keydown", event => {
  if (event.code === "Escape") {
    if (session.state === "game") pause();
    else if (session.state === "pause") {
      session.resume();
      show("game");
      clock.getDelta();
      frameLoop.start();
      requestMouseCapture();
    }
    return;
  }
  if (session.state !== "game") return;
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
    event.preventDefault();
  }
  if (event.repeat) return;
  keyboard.add(event.code);
  updateMove();
  if (event.code === "KeyR") reload();
  if (event.code === "KeyF") toggleFlashlight();
  if (event.code === "Space") fire();
});

window.addEventListener("keyup", event => {
  keyboard.delete(event.code);
  updateMove();
});

$("#stick").addEventListener("pointerdown", event => {
  event.preventDefault();
  joystickPointer = event.pointerId;
  $("#stick").setPointerCapture(event.pointerId);
  updateJoystick(event);
});
$("#stick").addEventListener("pointermove", event => {
  if (event.pointerId === joystickPointer) updateJoystick(event);
});

function updateJoystick(event) {
  const rect = $("#stick").getBoundingClientRect();
  const dx = event.clientX - rect.left - rect.width / 2;
  const dy = event.clientY - rect.top - rect.height / 2;
  const limit = 38;
  const length = Math.hypot(dx, dy);
  const scale = length > limit ? limit / length : 1;
  const x = dx * scale;
  const y = dy * scale;
  $("#stick-knob").style.transform = `translate(${x}px, ${y}px)`;
  touchMove.x = x / limit;
  touchMove.y = -y / limit;
  updateMove();
}

function endJoystick(event) {
  if (event.pointerId !== joystickPointer) return;
  joystickPointer = null;
  touchMove.x = 0;
  touchMove.y = 0;
  $("#stick-knob").style.transform = "";
  updateMove();
}
$("#stick").addEventListener("pointerup", endJoystick);
$("#stick").addEventListener("pointercancel", endJoystick);

$("#look-zone").addEventListener("pointerdown", event => {
  lookPointer = event.pointerId;
  lastLook = { x: event.clientX, y: event.clientY };
  $("#look-zone").setPointerCapture(event.pointerId);
});
$("#look-zone").addEventListener("pointermove", event => {
  if (event.pointerId !== lookPointer || !lastLook) return;
  applyLook(event.clientX - lastLook.x, event.clientY - lastLook.y, .0035);
  lastLook = { x: event.clientX, y: event.clientY };
});

function endLook(event) {
  if (event.pointerId !== lookPointer) return;
  lookPointer = null;
  lastLook = null;
}
$("#look-zone").addEventListener("pointerup", endLook);
$("#look-zone").addEventListener("pointercancel", endLook);

document.addEventListener("mousedown", event => {
  if (session.state !== "game" || innerWidth <= 760 || event.target !== canvas) return;
  if (event.button === 0) fire();
  if (event.button === 2) {
    mouseLooking = true;
    lastMouse = { x: event.clientX, y: event.clientY };
  }
});
document.addEventListener("mouseup", event => {
  if (event.button === 2) {
    mouseLooking = false;
    lastMouse = null;
  }
});
document.addEventListener("mousemove", event => {
  if (session.state !== "game" || innerWidth <= 760) return;
  if (document.pointerLockElement === canvas) {
    applyLook(event.movementX, event.movementY);
  } else if (mouseLooking && lastMouse) {
    applyLook(event.clientX - lastMouse.x, event.clientY - lastMouse.y);
    lastMouse = { x: event.clientX, y: event.clientY };
  }
});
document.addEventListener("contextmenu", event => {
  if (session.state === "game") event.preventDefault();
});

window.addEventListener("blur", () => {
  if (session.state === "game") pause();
  resetInput();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && session.state === "game") pause();
});

function resizeViewport() {
  const viewport = getViewportMetrics(window);
  camera.aspect = viewport.width / viewport.height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(viewport.pixelRatio);
  renderer.setSize(viewport.width, viewport.height);
}

window.addEventListener("resize", resizeViewport, { passive: true });
window.addEventListener("orientationchange", resizeViewport, { passive: true });
window.visualViewport?.addEventListener("resize", resizeViewport, { passive: true });

const telegram = window.Telegram?.WebApp;
if (telegram) {
  try {
    telegram.ready();
    telegram.expand();
    telegram.disableVerticalSwipes?.();
    telegram.onEvent?.("viewportChanged", resizeViewport);
  } catch {
    // The browser build remains usable if Telegram APIs are unavailable.
  }
}
