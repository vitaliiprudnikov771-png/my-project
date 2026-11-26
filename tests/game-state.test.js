import test from "node:test";
import assert from "node:assert/strict";
import {ArenaState,START_SHIELD} from "../src/game-state.js";
function advance(game,seconds){for(let i=0;i<Math.ceil(seconds/.05);i++)game.update(.05);}
test("start creates first wave",()=>{const g=new ArenaState().start();assert.equal(g.phase,"running");assert.equal(g.wave,1);assert.equal(g.targetsRemaining,3);});
test("tagging awards score and reduces targets",()=>{const g=new ArenaState().start();assert.equal(g.tagTarget(),true);assert.equal(g.tags,1);assert.equal(g.score,100);assert.equal(g.targetsRemaining,2);});
test("cleared wave advances after delay",()=>{const g=new ArenaState().start();g.tagTarget();g.tagTarget();g.tagTarget();advance(g,1);assert.equal(g.wave,1);advance(g,1.3);assert.equal(g.wave,2);assert.equal(g.targetsRemaining,4);});
test("shield is capped and zero ends the session",()=>{const g=new ArenaState().start();g.drainShield(35);assert.equal(g.shield,65);g.collectEnergy(80);assert.equal(g.shield,START_SHIELD);g.drainShield(100);assert.equal(g.shield,0);assert.equal(g.phase,"finished");});
test("scan and dash cooldowns work",()=>{const g=new ArenaState().start();assert.equal(g.beginScan(),true);assert.equal(g.beginScan(),false);assert.equal(g.beginDash(),true);assert.equal(g.beginDash(),false);advance(g,3);assert.equal(g.beginScan(),true);assert.equal(g.beginDash(),true);});
test("targets cannot be tagged outside an active session",()=>{const g=new ArenaState();assert.equal(g.tagTarget(),false);g.start();g.finish();assert.equal(g.tagTarget(),false);});