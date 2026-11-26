export class InputController {
  constructor(){
    this.move={x:0,y:0};this.yawDelta=0;this.pitchDelta=0;this.keys=new Set();this.scan=false;this.dash=false;this.joyId=null;this.lookId=null;this.lastLook=null;
    this.pad=document.querySelector("#move-pad");this.knob=document.querySelector("#move-knob");this.look=document.querySelector("#look-area");this.scanButton=document.querySelector("#scan-button");this.dashButton=document.querySelector("#dash-button");this.bind();
  }
  bind(){
    window.addEventListener("keydown",e=>{this.keys.add(e.code);if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();});
    window.addEventListener("keyup",e=>this.keys.delete(e.code));window.addEventListener("blur",()=>this.clear());
    this.pad?.addEventListener("pointerdown",e=>{e.preventDefault();this.joyId=e.pointerId;this.pad.setPointerCapture(e.pointerId);this.updateJoy(e);});
    this.pad?.addEventListener("pointermove",e=>{if(e.pointerId===this.joyId)this.updateJoy(e);});
    const joyUp=e=>{if(e.pointerId===this.joyId){this.joyId=null;this.move.x=0;this.move.y=0;this.knob.style.transform="translate(0,0)";}};
    this.pad?.addEventListener("pointerup",joyUp);this.pad?.addEventListener("pointercancel",joyUp);
    this.look?.addEventListener("pointerdown",e=>{this.lookId=e.pointerId;this.lastLook={x:e.clientX,y:e.clientY};this.look.setPointerCapture(e.pointerId);});
    this.look?.addEventListener("pointermove",e=>{if(e.pointerId!==this.lookId||!this.lastLook)return;this.yawDelta+=(e.clientX-this.lastLook.x)*.006;this.pitchDelta+=(e.clientY-this.lastLook.y)*.004;this.lastLook={x:e.clientX,y:e.clientY};});
    const lookUp=e=>{if(e.pointerId===this.lookId){this.lookId=null;this.lastLook=null;}};this.look?.addEventListener("pointerup",lookUp);this.look?.addEventListener("pointercancel",lookUp);
    this.hold(this.scanButton,"scan");this.hold(this.dashButton,"dash");
    let previous=null;window.addEventListener("mousemove",e=>{if(e.buttons===2&&previous){this.yawDelta+=(e.clientX-previous.x)*.004;this.pitchDelta+=(e.clientY-previous.y)*.003;}previous={x:e.clientX,y:e.clientY};});
    window.addEventListener("contextmenu",e=>e.preventDefault());
  }
  hold(button,key){button?.addEventListener("pointerdown",e=>{e.preventDefault();this[key]=true;});const stop=()=>{this[key]=false;};button?.addEventListener("pointerup",stop);button?.addEventListener("pointercancel",stop);button?.addEventListener("pointerleave",stop);}
  updateJoy(e){const r=this.pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,max=r.width*.34,dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy),scale=len>max?max/len:1,x=dx*scale,y=dy*scale;this.move.x=x/max;this.move.y=-y/max;this.knob.style.transform="translate("+x+"px,"+y+"px)";}
  read(){const k=this.keys,x=this.move.x+(k.has("KeyD")||k.has("ArrowRight")?1:0)-(k.has("KeyA")||k.has("ArrowLeft")?1:0),y=this.move.y+(k.has("KeyW")||k.has("ArrowUp")?1:0)-(k.has("KeyS")||k.has("ArrowDown")?1:0),l=Math.hypot(x,y),s=l>1?1/l:1;return{x:x*s,y:y*s,scan:this.scan||k.has("KeyF"),dash:this.dash||k.has("ShiftLeft")||k.has("ShiftRight")};}
  consumeLook(){const out={yaw:this.yawDelta,pitch:this.pitchDelta};this.yawDelta=0;this.pitchDelta=0;return out;}
  clear(){this.keys.clear();this.move.x=0;this.move.y=0;this.scan=false;this.dash=false;if(this.knob)this.knob.style.transform="translate(0,0)";}
}