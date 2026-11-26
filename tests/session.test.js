import test from "node:test";
import assert from "node:assert/strict";
import { GameSession } from "../src/session.js";

test("a new session starts in the menu and enters gameplay", () => {
  const session = new GameSession();
  assert.equal(session.state, "menu");
  assert.equal(session.active, false);
  assert.equal(session.start(), true);
  assert.equal(session.state, "game");
  assert.equal(session.active, true);
});

test("pause and resume only work from valid states", () => {
  const session = new GameSession();
  assert.equal(session.pause(), false);
  session.start();
  assert.equal(session.pause(), true);
  assert.equal(session.state, "pause");
  assert.equal(session.pause(), false);
  assert.equal(session.resume(), true);
  assert.equal(session.active, true);
});

test("a session can end and restart cleanly", () => {
  const session = new GameSession();
  session.start();
  assert.equal(session.end(), true);
  assert.equal(session.state, "end");
  assert.equal(session.active, false);
  assert.equal(session.end(), false);
  session.start();
  assert.equal(session.active, true);
  session.quit();
  assert.equal(session.state, "menu");
});
