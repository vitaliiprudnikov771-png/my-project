import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const mat={
  concrete:new THREE.MeshStandardMaterial({color:0x646a68,roughness:.95}),dark:new THREE.MeshStandardMaterial({color:0x343b3b,roughness:.9}),
  metal:new THREE.MeshStandardMaterial({color:0x59615e,metalness:.55,roughness:.55}),accent:new THREE.MeshStandardMaterial({color:0xb58b55}),
  suit:new THREE.MeshStandardMaterial({color:0x46534d,roughness:.8}),light:new THREE.MeshStandardMaterial({color:0xa2a18f}),
  visor:new THREE.MeshStandardMaterial({color:0x9aaea4,metalness:.35,roughness:.25}),drone:new THREE.MeshStandardMaterial({color:0x737d7a,metalness:.45,roughness:.38}),
  core:new THREE.MeshStandardMaterial({color:0x9dcbad,emissive:0x3e8f60,emissiveIntensity:1.15}),energy:new THREE.MeshStandardMaterial({color:0xe6bd71,emissive:0x98703a,emissiveIntensity:1.1})
};
function box(parent,material,pos,size){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function buildArena(scene){
  scene.background=new THREE.Color(0x89918c);scene.fog=new THREE.Fog(0x89918c,35,100);
  scene.add(new THREE.HemisphereLight(0xdde4dc,0x343a37,1.9));
  const sun=new THREE.DirectionalLight(0xffe8c5,2.3);sun.position.set(-22,36,14);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-34;sun.shadow.camera.right=34;sun.shadow.camera.top=34;sun.shadow.camera.bottom=-34;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xaebcb4,.7);fill.position.set(22,18,-22);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(54,54),mat.concrete);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const grid=new THREE.GridHelper(54,27,0x7d847e,0x707771);grid.position.y=.015;grid.material.transparent=true;grid.material.opacity=.25;scene.add(grid);
  box(scene,mat.dark,[0,2,-27],[54,4,1]);box(scene,mat.dark,[0,2,27],[54,4,1]);box(scene,mat.dark,[-27,2,0],[1,4,54]);box(scene,mat.dark,[27,2,0],[1,4,54]);
  const obstacles=[[-13,-12,8,4,2.6],[12,-13,9,4,2.6],[-13,13,8,4,2.5],[13,12,8,4,2.5],[0,-18,10,2,1.3],[0,18,10,2,1.3],[-19,0,2,10,1.4],[19,0,2,10,1.4],[-7,2,5,2,1.2],[8,-2,5,2,1.2],[0,8,4,3,1.5]];
  for(const o of obstacles){const x=o[0],z=o[1],w=o[2],d=o[3],h=o[4];box(scene,mat.metal,[x,h/2,z],[w,h,d]);box(scene,mat.accent,[x,h*.72,z+d/2+.02],[Math.min(w*.75,5),.09,.03]);}
  for(let i=0;i<12;i++){const x=-22+(i%4)*14.5,z=-22+Math.floor(i/4)*22,p=new THREE.Mesh(new THREE.CylinderGeometry(.13,.18,5,8),mat.dark);p.position.set(x,2.5,z);scene.add(p);box(scene,mat.accent,[x,5.1,z],[.8,.18,.45]);}
}
export function buildPlayer(scene){
  const root=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.62,4,8),mat.suit);body.position.y=1.18;body.castShadow=true;root.add(body);
  box(root,mat.light,[0,1.34,.29],[.39,.24,.14]);const head=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),mat.light);head.position.y=1.88;head.castShadow=true;root.add(head);
  const visor=new THREE.Mesh(new THREE.BoxGeometry(.34,.11,.15),mat.visor);visor.position.set(0,1.9,.21);root.add(visor);
  box(root,mat.dark,[0,1.21,-.35],[.48,.48,.19]);
  for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.47,3,7),mat.suit);arm.position.set(side*.48,1.27,.02);arm.rotation.z=side*.18;arm.castShadow=true;root.add(arm);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.15,.55,3,7),mat.dark);leg.position.set(side*.19,.43,0);leg.castShadow=true;root.add(leg);box(root,mat.metal,[side*.19,.13,.11],[.27,.2,.4]);}
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.025,6,32),mat.accent);ring.rotation.x=Math.PI/2;ring.position.y=.07;root.add(ring);scene.add(root);return{root,body};
}
export function createDrone(scene,index){
  const root=new THREE.Group(),body=new THREE.Mesh(new THREE.SphereGeometry(.48,16,12),mat.drone);body.scale.set(1.1,.78,1);body.castShadow=true;root.add(body);
  const core=new THREE.Mesh(new THREE.SphereGeometry(.18,12,10),mat.core);core.position.z=.36;root.add(core);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.66,.035,7,24),mat.accent);ring.rotation.x=Math.PI/2;root.add(ring);
  const rotor=new THREE.Group();for(let a=0;a<4;a++){const arm=new THREE.Mesh(new THREE.BoxGeometry(.08,.035,1.05),mat.metal);arm.rotation.y=a*Math.PI/2;rotor.add(arm);}rotor.position.y=.42;root.add(rotor);
  const collider=new THREE.Mesh(new THREE.SphereGeometry(.82,10,8),new THREE.MeshBasicMaterial({visible:false}));root.add(collider);
  const angle=Math.random()*Math.PI*2,radius=9+Math.random()*8;root.position.set(Math.cos(angle)*radius,2+Math.random()*1.5,Math.sin(angle)*radius);scene.add(root);
  return{root,body,core,ring,rotor,collider,phase:Math.random()*6,speed:.35+Math.random()*.22,tagged:false,taggedAt:0,remove:false};
}
export function createEnergy(scene,position){const group=new THREE.Group(),orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.27,1),mat.energy);orb.castShadow=true;group.add(orb);const ring=new THREE.Mesh(new THREE.TorusGeometry(.44,.025,6,20),mat.accent);ring.rotation.x=Math.PI/2;group.add(ring);group.position.copy(position);scene.add(group);return{group,age:0};}
export function createScanLine(scene,from,to){const geometry=new THREE.BufferGeometry().setFromPoints([from.clone(),to.clone()]),material=new THREE.LineBasicMaterial({color:0xa8d2bb,transparent:true,opacity:.95}),line=new THREE.Line(geometry,material);scene.add(line);return{line,age:0,geometry,material};}