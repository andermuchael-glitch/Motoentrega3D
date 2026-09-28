import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x87bce8);
scene.fog=new THREE.Fog(0x87bce8,80,240);

const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff,0x59636e,2.2));
const sun=new THREE.DirectionalLight(0xffffff,2);
sun.position.set(40,80,20); scene.add(sun);

function box(name,x,y,z,w,h,d,color){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color}));
 m.name=name;m.position.set(x,y,z);scene.add(m);return m;
}
const ground=box('ground',0,-.3,0,180,.5,180,0x5d8a4d);
for(let i=-80;i<=80;i+=20){
 box('road',0,.01,i,180,.08,8,0x30343a);
 box('road',i,.02,0,8,.09,180,0x30343a);
}
for(let x=-70;x<=70;x+=20) for(let z=-70;z<=70;z+=20){
 if(Math.abs(x)<15||Math.abs(z)<15) continue;
 const h=5+Math.random()*12;
 box('building',x,h/2,z,12,h,12,0x9aa3ad);
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
const body=new THREE.Mesh(new THREE.BoxGeometry(1.25,.65,2.7),new THREE.MeshStandardMaterial({color:0xe53935}));
body.position.y=1.05;bike.add(body);
const seat=box('seat',0,1.5,.15,.75,.18,1.1,0x202124);bike.add(seat);
for(const z of [-1.05,1.05]){
 const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.22,20),new THREE.MeshStandardMaterial({color:0x151515}));
 wheel.rotation.z=Math.PI/2;wheel.position.set(0,.48,z);bike.add(wheel);
}
bike.position.set(0,0,0);scene.add(bike);

let money=0,state='idle',remaining=180,orderReward=18;
const keys={left:false,right:false,up:false,down:false};
const $=id=>document.getElementById(id);
$('start').onclick=()=>{
 if(state==='idle'||state==='completed'||state==='failed'){
   state='pickup';remaining=180;pickup.visible=true;customer.visible=false;
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
   if(remaining<=0){remaining=0;state='failed';pickup.visible=false;customer.visible=false;$('status').textContent='Entrega perdida';$('message').textContent='⏰ Você perdeu o prazo!';$('start').textContent='📦 NOVO PEDIDO';$('start').style.display='block'}
   const target=state==='pickup'?pickup:customer;
   if(target.visible&&dist(bike.position,target.position)<4){
     if(state==='pickup'){state='delivery';pickup.visible=false;customer.visible=true;$('destination').textContent='Cliente';$('status').textContent='Pedido coletado! Entregue ao cliente';$('message').textContent='📦 Pedido na mochila!'}
     else {state='completed';customer.visible=false;money+=orderReward;$('money').textContent=money.toFixed(2).replace('.',',');$('status').textContent='Entrega concluída!';$('message').textContent='💰 + R$ '+orderReward+',00';$('start').textContent='📦 PRÓXIMO PEDIDO';$('start').style.display='block'}
   }
   const m=Math.floor(remaining/60),s=Math.floor(remaining%60);
   $('timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
 }
 // Câmera estilo kart: baixa, próxima e atrás da moto.
 const yaw=bike.rotation.y;
 const followDistance=5.8;
 const sideOffset=0;
 const desired=bike.position.clone().add(
   new THREE.Vector3(sideOffset,2.65,followDistance)
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
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
