export const START_SHIELD = 100;
export class ArenaState {
  constructor(){this.reset();}
  reset(){this.phase="menu";this.shield=START_SHIELD;this.score=0;this.wave=1;this.tags=0;this.taggedInWave=0;this.targetsRemaining=3;this.energy=0;this.scanCooldown=0;this.dashCooldown=0;this.waveClearTimer=0;this.elapsed=0;}
  start(){this.reset();this.phase="running";this.targetsRemaining=this.wave+2;return this;}
  update(dt){if(this.phase!=="running")return;const step=Math.max(0,Math.min(dt,.05));this.elapsed+=step;this.scanCooldown=Math.max(0,this.scanCooldown-step);this.dashCooldown=Math.max(0,this.dashCooldown-step);if(this.targetsRemaining===0){this.waveClearTimer+=step;if(this.waveClearTimer>=2.2)this.nextWave();}}
  beginScan(){if(this.phase!=="running"||this.scanCooldown>0)return false;this.scanCooldown=.65;return true;}
  tagTarget(){if(this.phase!=="running"||this.targetsRemaining<=0)return false;this.targetsRemaining--;this.tags++;this.taggedInWave++;this.score+=100+Math.max(0,this.wave-1)*15;if(this.targetsRemaining===0)this.waveClearTimer=.001;return true;}
  collectEnergy(amount=20){if(this.phase!=="running"||this.shield>=START_SHIELD)return false;const before=this.shield;this.shield=Math.min(START_SHIELD,this.shield+amount);this.energy+=this.shield-before;this.score+=25;return true;}
  drainShield(amount=12){if(this.phase!=="running")return false;this.shield=Math.max(0,this.shield-amount);if(this.shield===0)this.phase="finished";return true;}
  beginDash(){if(this.phase!=="running"||this.dashCooldown>0)return false;this.dashCooldown=2.4;return true;}
  nextWave(){if(this.phase!=="running")return false;this.wave++;this.targetsRemaining=Math.min(10,this.wave+2);this.taggedInWave=0;this.waveClearTimer=0;this.score+=50;this.shield=Math.min(START_SHIELD,this.shield+8);return true;}
  finish(){this.phase="finished";}
}