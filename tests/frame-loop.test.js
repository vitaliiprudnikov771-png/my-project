import test from "node:test";
import assert from "node:assert/strict";
import { createFrameLoop } from "../src/frame-loop.js";

function createScheduler() {
  let nextId = 1;
  const pending = new Map();

  return {
    pending,
    request(callback) {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    },
    cancel(id) {
      pending.delete(id);
    },
    runNext(timestamp = 0) {
      const entry = pending.entries().next().value;
      if (!entry) return false;
      const [id, callback] = entry;
      pending.delete(id);
      callback(timestamp);
      return true;
    }
  };
}

test("frame loop prevents duplicate starts and stops scheduled work", () => {
  const scheduler = createScheduler();
  let frames = 0;
  const loop = createFrameLoop(() => frames++, scheduler);

  assert.equal(loop.start(), true);
  assert.equal(loop.start(), false);
  assert.equal(scheduler.pending.size, 1);

  scheduler.runNext();
  assert.equal(frames, 1);
  assert.equal(scheduler.pending.size, 1);

  assert.equal(loop.stop(), true);
  assert.equal(loop.stop(), false);
  assert.equal(loop.active, false);
  assert.equal(scheduler.pending.size, 0);
});

test("stopping from inside a frame does not schedule another frame", () => {
  const scheduler = createScheduler();
  let loop;
  let frames = 0;

  loop = createFrameLoop(() => {
    frames++;
    loop.stop();
  }, scheduler);

  loop.start();
  scheduler.runNext();

  assert.equal(frames, 1);
  assert.equal(loop.active, false);
  assert.equal(scheduler.pending.size, 0);
});

test("frame loop can restart after stop", () => {
  const scheduler = createScheduler();
  let frames = 0;
  const loop = createFrameLoop(() => frames++, scheduler);

  loop.start();
  loop.stop();
  loop.start();
  scheduler.runNext();

  assert.equal(frames, 1);
  assert.equal(scheduler.pending.size, 1);
  loop.stop();
});
