import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x7fb9e6);
scene.fog=new THREE.Fog(0x7fb9e6,95,260);

const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xcce8ff,0x43533d,2.4));
const sun=new THREE.DirectionalLight(0xfff2d2,3.0);
sun.position.set(35,90,25);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-100; sun.shadow.camera.right=100;
sun.shadow.camera.top=100; sun.shadow.camera.bottom=-100;
scene.add(sun);

function box(name,x,y,z,w,h,d,color,roughness=.82){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness,metalness:.04}));
 m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}
function addRoadMark(x,y,z,w,d,rot=0){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,.025,d),new THREE.MeshBasicMaterial({color:0xf5d76e}));
 m.position.set(x,y,z);m.rotation.y=rot;scene.add(m);
}
function addWindow(x,y,z,w=.9,h=1.1,rot=0){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,.08,h),new THREE.MeshStandardMaterial({color:0x9ddcff,metalness:.15,roughness:.25,emissive:0x17384d,emissiveIntensity:.18}));
 m.position.set(x,y,z);m.rotation.y=rot;scene.add(m);
}
const ground=box('ground',0,-.3,0,220,.5,220,0x5b8b4d);
for(let i=-100;i<=100;i+=20){
 box('road',0,.01,i,220,.08,9,0x2c3138);
 box('road',i,.02,0,9,.09,220,0x2c3138);
}
for(let i=-100;i<=100;i+=10){
 addRoadMark(0,.07,i, .18,4,0);
 addRoadMark(i,.08,0, 4,.18,0);
}
for(let x=-90;x<=90;x+=20) for(let z=-90;z<=90;z+=20){
 if(Math.abs(x)<15||Math.abs(z)<15) continue;
 const h=7+((Math.abs(x*13+z*7)%100)/100)*14;
 const w=11+((Math.abs(x*5-z*3)%5));
 const color=[0x9aa7b3,0xb6a58f,0x7d8d9d,0xc0b8a9][Math.abs(x+z)%4];
 box('building',x,h/2,z,w,h,w,color);
 addWindow(x-w/2-.05,Math.min(h-2,5),z,.9,1.2,Math.PI/2);
 addWindow(x+w/2+.05,Math.min(h-2,7),z,.9,1.2,Math.PI/2);
 addWindow(x,Math.min(h-2,4),z-w/2-.05,1,1.2,0);
}

function marker(name,pos,color){
 const g=new THREE.Group();
 const base=new THREE.Mesh(new THREE.CylinderGeometry(2,2,.35,32),new THREE.MeshStandardMaterial({color}));
 base.position.y=.2;g.add(base);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.7,.16,12,32),new THREE.MeshBasicMaterial({color}));
 ring.rotation.x=Math.PI/2;ring.position.y=.4;g.add(ring);
 g.position.copy(pos);g.name=name;scene.add(g);return g;
}
const pickup=marker('Restaurante Central',new THREE.Vector3(20,.1,30),0xff9b00);
const customer=marker('Cliente',new THREE.Vector3(-45,.1,-35),0x42e5ff);
pickup.visible=false;customer.visible=false;

const bike=new THREE.Group();
const redMat=new THREE.MeshStandardMaterial({color:0xe53935,roughness:.42,metalness:.12});
const darkMat=new THREE.MeshStandardMaterial({color:0x17191d,roughness:.35,metalness:.3});
const chromeMat=new THREE.MeshStandardMaterial({color:0xb8c2cc,roughness:.22,metalness:.75});
const body=new THREE.Mesh(new THREE.BoxGeometry(1.18,.58,2.35),redMat);
body.position.y=1.02;body.castShadow=true;bike.add(body);
const frontFairing=new THREE.Mesh(new THREE.BoxGeometry(.9,.42,.72),redMat);
frontFairing.position.set(0,1.28,-1.0);frontFairing.castShadow=true;bike.add(frontFairing);
const tank=new THREE.Mesh(new THREE.BoxGeometry(.9,.38,.82),redMat);
tank.position.set(0,1.42,.15);tank.rotation.x=-.08;tank.castShadow=true;bike.add(tank);
const seat=new THREE.Mesh(new THREE.BoxGeometry(.68,.16,.95),darkMat);
seat.position.set(0,1.55,.65);seat.castShadow=true;bike.add(seat);
const handle=new THREE.Mesh(new THREE.BoxGeometry(1.15,.1,.1),chromeMat);
handle.position.set(0,1.7,-.82);handle.castShadow=true;bike.add(handle);
const headlight=new THREE.Mesh(new THREE.SphereGeometry(.18,16,12),new THREE.MeshStandardMaterial({color:0xffffd0,emissive:0xffeeaa,emissiveIntensity:1.5}));
headlight.position.set(0,1.35,-1.37);bike.add(headlight);
for(const z of [-1.0,1.0]){
 const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.24,24),darkMat);
 wheel.rotation.z=Math.PI/2;wheel.position.set(0,.48,z);wheel.castShadow=true;bike.add(wheel);
 const hub=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.27,16),chromeMat);
 hub.rotation.z=Math.PI/2;hub.position.set(0,.48,z);bike.add(hub);
}
const deliveryBox=new THREE.Mesh(new THREE.BoxGeometry(.72,.52,.62),new THREE.MeshStandardMaterial({color:0xb87932,roughness:.9}));
deliveryBox.position.set(0,1.62,1.02);deliveryBox.castShadow=true;bike.add(deliveryBox);
deliveryBox.visible=false;
bike.position.set(0,0,0);scene.add(bike);
bike.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});

let money=0,state='idle',remaining=180,orderReward=18;
const keys={left:false,right:false,up:false,down:false};
const $=id=>document.getElementById(id);
$('start').onclick=()=>{
 if(state==='idle'||state==='completed'||state==='failed'){
   state='pickup';remaining=180;pickup.visible=true;customer.visible=false;deliveryBox.visible=true;
   $('destination').textContent='Restaurante Central';
   $('status').textContent='Vá até o restaurante para pegar o pedido';
   $('start').style.display='none';
 }
};
document.querySelectorAll('#controls button').forEach(b=>{
 const k=b.dataset.key;
 const on=e=>{e.preventDefault();keys[k]=true};
 const off=e=>{e.preventDefault();keys[k]=false};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);
});
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=true;if(e.key==='ArrowRight'||e.key==='d')keys.right=true;if(e.key==='ArrowUp'||e.key==='w')keys.up=true;if(e.key==='ArrowDown'||e.key==='s')keys.down=true});
addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=false;if(e.key==='ArrowRight'||e.key==='d')keys.right=false;if(e.key==='ArrowUp'||e.key==='w')keys.up=false;if(e.key==='ArrowDown'||e.key==='s')keys.down=false});

let speed=0;
function dist(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
function update(dt){
 const throttle=(keys.up?1:0)-(keys.down?.55:0);
 speed+=throttle*14*dt; speed*=Math.pow(.985,dt*60);speed=THREE.MathUtils.clamp(speed,-7,17);
 const steer=(keys.left?-1:0)+(keys.right?1:0);
 bike.rotation.y-=steer*speed*.045*dt;
 bike.translateZ(-speed*dt);
 $('speed').textContent=Math.round(Math.abs(speed)*3.6);
 if(state!=='idle'&&state!=='completed'&&state!=='failed'){
   remaining-=dt;
   if(remaining<=0){remaining=0;state='failed';pickup.visible=false;customer.visible=false;deliveryBox.visible=false;$('status').textContent='Entrega perdida';$('message').textContent='⏰ Você perdeu o prazo!';$('start').textContent='📦 NOVO PEDIDO';$('start').style.display='block'}
   const target=state==='pickup'?pickup:customer;
   if(target.visible&&dist(bike.position,target.position)<4){
     if(state==='pickup'){state='delivery';pickup.visible=false;customer.visible=true;$('destination').textContent='Cliente';$('status').textContent='Pedido coletado! Entregue ao cliente';$('message').textContent='📦 Pedido na mochila!'}
     else {state='completed';customer.visible=false;deliveryBox.visible=false;money+=orderReward;$('money').textContent=money.toFixed(2).replace('.',',');$('status').textContent='Entrega concluída!';$('message').textContent='💰 + R$ '+orderReward+',00';$('start').textContent='📦 PRÓXIMO PEDIDO';$('start').style.display='block'}
   }
   const m=Math.floor(remaining/60),s=Math.floor(remaining%60);
   $('timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
 }
 // Câmera estilo kart: baixa, próxima e atrás da moto.
 const yaw=bike.rotation.y;
 const followDistance=6.8;
 const sideOffset=0;
 const desired=bike.position.clone().add(
   new THREE.Vector3(sideOffset,2.9,followDistance)
     .applyAxisAngle(new THREE.Vector3(0,1,0),yaw)
 );
 camera.position.lerp(desired,1-Math.pow(.00008,dt));

 // Olha alguns metros à frente para dar sensação de velocidade e controle.
 const lookAhead=Math.max(2.2,Math.abs(speed)*0.32);
 const lookTarget=bike.position.clone().add(
   new THREE.Vector3(0,0,-lookAhead)
     .applyAxisAngle(new THREE.Vector3(0,1,0),yaw)
 );
 lookTarget.y+=1.0;
 camera.lookAt(lookTarget);

 // FOV dinâmico: abre suavemente quando acelera.
 const targetFov=68+Math.min(Math.abs(speed)*0.75,10);
 camera.fov=THREE.MathUtils.lerp(camera.fov,targetFov,1-Math.pow(.01,dt));
 camera.updateProjectionMatrix();

 // Inclinação pequena nas curvas, deixando a câmera mais "viva".
 const targetRoll=THREE.MathUtils.clamp(-steer*0.035*speed,-0.16,0.16);
 camera.rotation.z=THREE.MathUtils.lerp(camera.rotation.z,targetRoll,1-Math.pow(.01,dt));
}

let last=performance.now();
function animate(now){const dt=Math.min((now-last)/1000,.05);last=now;update(dt);renderer.render(scene,camera);requestAnimationFrame(animate)}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));});
