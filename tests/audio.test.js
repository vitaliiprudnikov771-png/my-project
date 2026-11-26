import test from "node:test";
import assert from "node:assert/strict";
import { AudioSystem } from "../src/audio.js";

test("dispose closes the audio context and prevents it from restarting", async () => {
  const previousWindow = globalThis.window;
  let closeCalls = 0;

  globalThis.window = {
    AudioContext: class {
      constructor() {
        this.state = "running";
      }
      close() {
        closeCalls++;
        this.state = "closed";
        return Promise.resolve();
      }
    }
  };

  try {
    const audio = new AudioSystem();
    audio.start();
    assert.ok(audio.context);

    audio.dispose();
    await Promise.resolve();

    assert.equal(closeCalls, 1);
    assert.equal(audio.context, null);
    assert.equal(audio.enabled, false);

    audio.start();
    assert.equal(audio.context, null);
    assert.equal(closeCalls, 1);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
