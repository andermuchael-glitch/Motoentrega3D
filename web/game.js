import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x79b7e5);
scene.fog=new THREE.Fog(0x79b7e5,105,310);

const camera=new THREE.PerspectiveCamera(67,innerWidth/innerHeight,.1,600);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xd9efff,0x43513d,2.5));
const sun=new THREE.DirectionalLight(0xfff1d2,3.1);
sun.position.set(50,90,35);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-130;sun.shadow.camera.right=130;sun.shadow.camera.top=130;sun.shadow.camera.bottom=-130;
scene.add(sun);

const mat=(color,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const city=[];
function mesh(geo,material,x,y,z,rot=0){
 const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.rotation.y=rot;m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}
function box(x,y,z,w,h,d,color,rot=0){return mesh(new THREE.BoxGeometry(w,h,d),mat(color),x,y,z,rot)}
function cyl(radius,height,x,y,z,color,rotX=0,rotZ=0){
 const m=mesh(new THREE.CylinderGeometry(radius,radius,height,12),mat(color),x,y,z);m.rotation.x=rotX;m.rotation.z=rotZ;return m;
}
function cylinderBetween(a,b,r,color){
 const dir=new THREE.Vector3().subVectors(b,a),len=dir.length();
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,10),mat(color));
 m.position.copy(a).add(b).multiplyScalar(.5);
 m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
 m.castShadow=true;scene.add(m);return m;
}

// CITY: roads, sidewalks and distinct blocks
const citySize=240, roadW=12, block=28;
box(0,-.5,0,citySize,1,citySize,0x5d914f);
for(let p=-98;p<=98;p+=40){
  box(0,.02,p,citySize,.12,roadW,0x30353b);
  box(p,.03,0,roadW,.13,citySize,0x30353b);
  // sidewalks around each road
  box(0,.11,p-roadW/2-1,citySize,.18,2,0xb8b7a9);
  box(0,.11,p+roadW/2+1,citySize,.18,2,0xb8b7a9);
  box(p-roadW/2-1,.12,0,2,.18,citySize,0xb8b7a9);
  box(p+roadW/2+1,.12,0,2,.18,citySize,0xb8b7a9);
}
for(let p=-100;p<=100;p+=10){
  box(0,.095,p,.18,.02,5,0xf2d76c);
  box(p,.10,0,5,.02,.18,0xf2d76c);
}

const buildingColors=[0xc8b8a4,0x8f9eaa,0xd3c6ae,0x8798a7,0xb9a3a0,0x9ba98f];
function addBuilding(x,z,w,d,h,color,index){
  const b=box(x,h/2,z,w,h,d,color);
  // roof
  mesh(new THREE.ConeGeometry(Math.max(w,d)*.72,.9,4),mat(0x4b4f55),x,h+.45,z,Math.PI/4);
  // windows on front/back and sides
  const glass=mat(0x6ec6e8,.25,.2);
  for(let yy=2;yy<h-1;yy+=2.8){
    for(let xx=-w/2+1.5;xx<w/2-1;xx+=2.8){
      mesh(new THREE.BoxGeometry(1.25,.9,.06),glass,x+xx,yy,z-d/2-.035);
      if(index%2===0) mesh(new THREE.BoxGeometry(1.25,.9,.06),glass,x+xx,yy,z+d/2+.035);
    }
  }
  for(let yy=2;yy<h-1;yy+=2.8){
    for(let zz=-d/2+1.5;zz<d/2-1;zz+=2.8){
      mesh(new THREE.BoxGeometry(.06,.9,1.25),glass,x-w/2-.035,yy,z+zz);
    }
  }
  // door
  mesh(new THREE.BoxGeometry(1.35,2.2,.08),mat(0x4b3024),x,1.1,z-d/2-.06);
  return b;
}
let seed=7;
function rnd(){seed=(seed*9301+49297)%233280;return seed/233280}
for(let bx=-80;bx<=80;bx+=40){
 for(let bz=-80;bz<=80;bz+=40){
   if(Math.abs(bx)<18&&Math.abs(bz)<18) continue;
   const count=rnd()>.55?2:1;
   for(let n=0;n<count;n++){
     const x=bx+(n?rnd()*15-7:0),z=bz+(n?rnd()*15-7:0);
     const w=12+rnd()*8,d=12+rnd()*8,h=7+rnd()*15;
     addBuilding(x,z,w,d,h,buildingColors[Math.floor(rnd()*buildingColors.length)],Math.floor(rnd()*5));
   }
 }
}
// Trees and street lamps
function tree(x,z){
 cyl(.22,2.2,x,1.1,z,0x65412a);
 mesh(new THREE.SphereGeometry(1.7,10,8),mat(0x3d8a4a),x,3,z);
 mesh(new THREE.SphereGeometry(1.15,10,8),mat(0x5ba34d),x+.5,3.5,z);
}
function lamp(x,z){
 cyl(.08,4,x,2,z,0x30343a);
 cyl(.7,.08,x,4,z,0xf7e7a2,0,0);
}
for(let p=-80;p<=80;p+=40){tree(p+8,16);tree(p-8,-16);lamp(p,8);lamp(p,-8)}
// landmark stores
function store(x,z,color,name){
 box(x,2,z,13,4,9,color);
 box(x,4.3,z-4.7,12,.7,.25,0xffffff);
 box(x,2.2,z-4.9,8,2.4,.08,0x8bd7f0);
}
store(20,20,0xf08b36,'Restaurante Central');
store(-60,-60,0x4b83d4,'Cliente');

// markers
function marker(pos,color){
 const g=new THREE.Group();
 const base=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.1,.25,32),mat(color));base.position.y=.15;g.add(base);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,.16,12,32),new THREE.MeshBasicMaterial({color}));ring.rotation.x=Math.PI/2;ring.position.y=.3;g.add(ring);
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,4,8),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7}));beam.position.y=2.2;g.add(beam);
 g.position.copy(pos);scene.add(g);return g;
}
const pickup=marker(new THREE.Vector3(20,.1,20),0xff9b00);
const customer=marker(new THREE.Vector3(-60,.1,-60),0x42e5ff);
pickup.visible=false;customer.visible=false;

// MOTORCYCLE: low-poly silhouette instead of a box
const bike=new THREE.Group();
const red=mat(0xd9252a,.4,.12), dark=mat(0x17191d,.28,.35), chrome=mat(0xb9c5cf,.2,.8);
const wheelGeo=new THREE.CylinderGeometry(.48,.48,.24,20);
for(const z of [-1.02,1.02]){
 const w=new THREE.Mesh(wheelGeo,dark);w.rotation.z=Math.PI/2;w.position.set(0,.5,z);w.castShadow=true;bike.add(w);
 const hub=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.27,14),chrome);hub.rotation.z=Math.PI/2;hub.position.set(0,.5,z);bike.add(hub);
}
cylinderBetween(new THREE.Vector3(0,.68,-.95),new THREE.Vector3(0,1.2,.35),.11,dark);
cylinderBetween(new THREE.Vector3(0,.72,.85),new THREE.Vector3(0,1.2,.35),.12,dark);
mesh(new THREE.CapsuleGeometry(.34,.82,6,12),red,0,1.18,.05);
const tank=mesh(new THREE.SphereGeometry(.48,12,8),red,0,1.35,-.05);tank.scale.set(.78,.62,1.35);
const seat=mesh(new THREE.BoxGeometry(.40,.16,.78),dark,0,1.52,.62);seat.rotation.x=-.08;
const front=mesh(new THREE.CapsuleGeometry(.27,.52,5,10),red,0,1.15,-.88);front.rotation.x=Math.PI/2;front.scale.set(1,.7,1);
const handle=mesh(new THREE.CylinderGeometry(.045,.045,1.05,10),chrome,0,1.67,-.83);handle.rotation.z=Math.PI/2;
const head=mesh(new THREE.SphereGeometry(.16,12,8),new THREE.MeshStandardMaterial({color:0xffffd0,emissive:0xffe39b,emissiveIntensity:1.7}),0,1.3,-1.17);
const boxMat=mat(0xb97832,.9);
const deliveryBox=mesh(new THREE.BoxGeometry(.56,.40,.52),boxMat,0,1.62,.88);
deliveryBox.visible=false;
bike.position.set(0,0,0);scene.add(bike);

let money=0,state='idle',remaining=180,orderReward=18,speed=0;
const keys={left:false,right:false,up:false,down:false};
const $=id=>document.getElementById(id);
$('start').onclick=()=>{
 if(state==='idle'||state==='completed'||state==='failed'){
  state='pickup';remaining=180;pickup.visible=true;customer.visible=false;deliveryBox.visible=true;
  $('destination').textContent='Restaurante Central';$('status').textContent='Vá até o restaurante para pegar o pedido';$('start').style.display='none';
 }
};
document.querySelectorAll('#controls button').forEach(b=>{
 const k=b.dataset.key;
 const on=e=>{e.preventDefault();keys[k]=true};const off=e=>{e.preventDefault();keys[k]=false};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);
});
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=true;if(e.key==='ArrowRight'||e.key==='d')keys.right=true;if(e.key==='ArrowUp'||e.key==='w')keys.up=true;if(e.key==='ArrowDown'||e.key==='s')keys.down=false});
addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=false;if(e.key==='ArrowRight'||e.key==='d')keys.right=false;if(e.key==='ArrowUp'||e.key==='w')keys.up=true;if(e.key==='ArrowDown'||e.key==='s')keys.down=false});
function dist(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}

const mapCanvas=document.getElementById('minimap'),mapCtx=mapCanvas.getContext('2d');
function drawMap(){
 const w=mapCanvas.width,h=mapCanvas.height;
 mapCtx.clearRect(0,0,w,h);
 mapCtx.fillStyle='#182127';mapCtx.fillRect(0,0,w,h);
 const scale=.48;
 const worldToMap=(x,z)=>({x:w/2+x*scale,y:h/2+z*scale});
 // grass / blocks
 mapCtx.fillStyle='#648c57';
 for(let x=-100;x<=60;x+=40) for(let z=-100;z<=60;z+=40){
   const p=worldToMap(x,z); mapCtx.fillRect(p.x+5,p.y+5,28*scale,28*scale);
 }
 // roads
 mapCtx.fillStyle='#424950';
 for(let p=-100;p<=100;p+=40){
   let a=worldToMap(-120,p),d=worldToMap(120,p);
   mapCtx.fillRect(a.x,a.y,d.x-a.x,12*scale);
   a=worldToMap(p,-120);d=worldToMap(p,120);
   mapCtx.fillRect(a.x,a.y,12*scale,d.y-a.y);
 }
 // road center lines
 mapCtx.strokeStyle='#f2d76c';mapCtx.lineWidth=1;
 mapCtx.setLineDash([4,4]);
 for(let p=-100;p<=100;p+=40){
   let a=worldToMap(-120,p),d=worldToMap(120,p);
   mapCtx.beginPath();mapCtx.moveTo(a.x,a.y+3);mapCtx.lineTo(d.x,d.y+3);mapCtx.stroke();
   a=worldToMap(p,-120);d=worldToMap(p,120);
   mapCtx.beginPath();mapCtx.moveTo(a.x+3,a.y);mapCtx.lineTo(d.x+3,d.y);mapCtx.stroke();
 }
 mapCtx.setLineDash([]);
 const target=state==='pickup'?pickup:customer;
 if(target&&target.visible){
   const p=worldToMap(target.position.x,target.position.z);
   mapCtx.fillStyle=state==='pickup'?'#ff9b00':'#42e5ff';
   mapCtx.beginPath();mapCtx.arc(p.x,p.y,5,0,Math.PI*2);mapCtx.fill();
   mapCtx.strokeStyle='#fff';mapCtx.lineWidth=2;mapCtx.stroke();
 }
 const me=worldToMap(bike.position.x,bike.position.z);
 mapCtx.save();mapCtx.translate(me.x,me.y);mapCtx.rotate(-bike.rotation.y);
 mapCtx.fillStyle='#ff3038';mapCtx.beginPath();mapCtx.moveTo(0,-7);mapCtx.lineTo(4,6);mapCtx.lineTo(0,3);mapCtx.lineTo(-4,6);mapCtx.closePath();mapCtx.fill();
 mapCtx.restore();
}

function update(dt){
 const throttle=(keys.up?1:0)-(keys.down?.55:0);
 speed+=throttle*14*dt;speed*=Math.pow(.985,dt*60);speed=THREE.MathUtils.clamp(speed,-7,17);
 const steer=(keys.left?-1:0)+(keys.right?1:0);
 bike.rotation.y-=steer*speed*.045*dt;bike.translateZ(-speed*dt);
 bike.position.x=THREE.MathUtils.clamp(bike.position.x,-112,112);bike.position.z=THREE.MathUtils.clamp(bike.position.z,-112,112);
 $('speed').textContent=Math.round(Math.abs(speed)*3.6);
 if(state!=='idle'&&state!=='completed'&&state!=='failed'){
  remaining-=dt;
  if(remaining<=0){remaining=0;state='failed';pickup.visible=false;customer.visible=false;deliveryBox.visible=false;$('status').textContent='Entrega perdida';$('message').textContent='⏰ Você perdeu o prazo!';$('start').textContent='📦 NOVO PEDIDO';$('start').style.display='block'}
  const target=state==='pickup'?pickup:customer;
  if(target.visible&&dist(bike.position,target.position)<4){
   if(state==='pickup'){state='delivery';pickup.visible=false;customer.visible=true;$('destination').textContent='Cliente';$('status').textContent='Pedido coletado! Entregue ao cliente';$('message').textContent='📦 Pedido na mochila!'}
   else{state='completed';customer.visible=false;deliveryBox.visible=false;money+=orderReward;$('money').textContent=money.toFixed(2).replace('.',',');$('status').textContent='Entrega concluída!';$('message').textContent='💰 + R$ '+orderReward+',00';$('start').textContent='📦 PRÓXIMO PEDIDO';$('start').style.display='block'}
  }
  const m=Math.floor(remaining/60),s=Math.floor(remaining%60);$('timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
 }
 const yaw=bike.rotation.y,followDistance=7.2;
 const desired=bike.position.clone().add(new THREE.Vector3(0,3.0,followDistance).applyAxisAngle(new THREE.Vector3(0,1,0),yaw));
 camera.position.lerp(desired,1-Math.pow(.00008,dt));
 const lookTarget=bike.position.clone().add(new THREE.Vector3(0,0,-Math.max(3,Math.abs(speed)*.32)).applyAxisAngle(new THREE.Vector3(0,1,0),yaw));lookTarget.y+=1;
 camera.lookAt(lookTarget);
 camera.fov=THREE.MathUtils.lerp(camera.fov,67+Math.min(Math.abs(speed)*.75,10),1-Math.pow(.01,dt));camera.updateProjectionMatrix();
 camera.rotation.z=THREE.MathUtils.lerp(camera.rotation.z,THREE.MathUtils.clamp(-steer*.035*speed,-.16,.16),1-Math.pow(.01,dt));
 drawMap();
}
let last=performance.now();
function animate(now){const dt=Math.min((now-last)/1000,.05);last=now;update(dt);renderer.render(scene,camera);requestAnimationFrame(animate)}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));});
