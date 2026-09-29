import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x79b7e5);
scene.fog=new THREE.Fog(0x79b7e5,120,320);

const camera=new THREE.PerspectiveCamera(67,innerWidth/innerHeight,.1,600);

// Pré-checagem: falhar de forma visível é muito melhor que deixar a tela preta.
const probe=document.createElement('canvas');
const gl=probe.getContext('webgl2',{alpha:false,antialias:false});
if(!gl) throw new Error('WebGL 2 não está disponível neste navegador/dispositivo.');

const renderer=new THREE.WebGLRenderer({
  antialias:false,
  powerPreference:'high-performance',
  alpha:false,
  depth:true,
  stencil:false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=false;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
renderer.setClearColor(0x79b7e5,1);
document.body.appendChild(renderer.domElement);

renderer.domElement.addEventListener('webglcontextlost',event=>{
  event.preventDefault();
  showRuntimeError(new Error('O WebGL perdeu o contexto gráfico. Recarregue a página.'));
});
renderer.domElement.addEventListener('webglcontextrestored',()=>{
  hideRuntimeError();
});

scene.add(new THREE.HemisphereLight(0xd9efff,0x43513d,2.5));
const sun=new THREE.DirectionalLight(0xfff1d2,3.1);
sun.position.set(50,90,35);sun.castShadow=false;
scene.add(sun);

const mat=(color,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const city=[];
function mesh(geo,material,x,y,z,rot=0){
 const m=new THREE.Mesh(geo,material);
 m.position.set(x,y,z);
 m.rotation.y=rot;
 m.castShadow=false;
 m.receiveShadow=true;
 scene.add(m);
 return m;
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

// BALNEÁRIO CAMBORIÚ — mapa 3D estilizado inspirado na malha real do Centro
const citySize=250;
const roadW=9;
const asphalt=mat(0x30363d), sidewalk=mat(0xc5c3b8), grass=mat(0x668f57);
box(0,-.55,0,citySize,1,citySize,0x668f57);

// Mar / Praia — leste da cidade
box(112,-.35,0,55,.5,250,0x3d9fd0);
box(92,-.18,0,14,.25,250,0xe5d29b);

// Eixos principais aproximados do Centro de BC:
// Av. Atlântica acompanha a orla; Av. Brasil corre paralela; Av. Central cruza o Centro.
const roads=[];
function road(x,z,w,d,name=''){
 box(x,.02,z,w,.14,d,0x30363d);
 roads.push({x,z,w,d,name});
}
function avenueX(x,name){road(x,0,10,250,name);}
function avenueZ(z,name){road(0,z,250,10,name);}

// avenidas longitudinais
avenueX(76,'Avenida Atlântica');
avenueX(48,'Avenida Brasil');
avenueX(18,'3ª Avenida');
avenueX(-12,'4ª Avenida');
avenueX(-42,'Avenida do Estado');

// transversais importantes
avenueZ(0,'Avenida Central');
[-100,-82,-64,-46,-28,-10,18,36,54,72,90,108].forEach((z,i)=>road(0,z,250,7,'Rua '+(100+i*100)));

// ruas locais perpendiculares, formando a malha urbana
[-72,-60,-48,-36,-24,-12,12,24,36,60,72,84].forEach((x,i)=>road(x,0,6,250,'Rua local '+i));

// calçadas ao redor dos principais eixos
for(const r of roads){
 const pad=1.15;
 if(r.w>r.d){
   box(r.x,.12,r.z-r.d/2-pad,r.w,.20,1.8,0xc5c3b8);
   box(r.x,.12,r.z+r.d/2+pad,r.w,.20,1.8,0xc5c3b8);
 }else{
   box(r.x-r.w/2-pad,.12,r.z,1.8,.20,r.d,0xc5c3b8);
   box(r.x+r.w/2+pad,.12,r.z,1.8,.20,r.d,0xc5c3b8);
 }
}

// faixas centrais nas avenidas
for(const z of [-100,-82,-64,-46,-28,-10,18,36,54,72,90,108]){
 for(let x=-115;x<115;x+=12) box(x,.105,z,.16,.025,4.2,0xf1d96d);
}
for(const x of [76,48,18,-12,-42]){
 for(let z=-115;z<115;z+=12) box(x,.105,z,4.2,.025,.16,0xf1d96d);
}

// prédios: mais altos e densos no Centro/orla
// QUARTEIRÕES — prédios ficam entre as ruas, nunca sobre a pista
const buildingColors=[0xc9b7a7,0x9aa9b4,0xd8c9ae,0x8799a8,0xb79d99,0x8eaa8d,0xbfc3c8];
let seed=19;
function rnd(){seed=(seed*9301+49297)%233280;return seed/233280}

function addBuilding(x,z,w,d,h,color,index){
  // Cada prédio usa poucas malhas: o protótipo anterior criava centenas
  // de janelas individuais por prédio, sobrecarregando o GPU do celular.
  const g=new THREE.Group();
  g.position.set(x,0,z);
  scene.add(g);

  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,.88,0));
  body.position.y=h/2;
  body.receiveShadow=true;
  g.add(body);

  const roof=new THREE.Mesh(new THREE.BoxGeometry(w+.18,.18,d+.18),mat(0x555b62,.92,0));
  roof.position.y=h+.09;
  g.add(roof);

  const windowMat=mat(index%3===0?0x73c8e8:0x5c9fba,.32,.12);
  const front=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.8,w-.8),Math.min(1.25,Math.max(.55,h*.045)),.055),windowMat);
  front.position.set(0,Math.max(1.8,h*.58),-d/2-.035);
  g.add(front);

  const back=front.clone();
  back.position.z=d/2+.035;
  g.add(back);

  if(w>7){
    const side=new THREE.Mesh(new THREE.BoxGeometry(.055,Math.min(1.25,Math.max(.55,h*.045)),Math.max(.8,d-.8)),windowMat);
    side.position.set(-w/2-.035,Math.max(1.8,h*.58),0);
    g.add(side);
    const side2=side.clone();
    side2.position.x=w/2+.035;
    g.add(side2);
  }

  const door=new THREE.Mesh(new THREE.BoxGeometry(1.35,2.05,.08),mat(0x4b3024,.9,0));
  door.position.set(0,1.025,-d/2-.08);
  g.add(door);

  return g;
}

// Todas as ruas verticais/horizontais formam os limites dos quarteirões.
const verticalRoads=[-72,-60,-48,-42,-36,-24,-12,18,24,36,48,60,72,76,84];
const horizontalRoads=[-100,-82,-64,-46,-28,-10,0,18,36,54,72,90,108];
for(let ix=0;ix<verticalRoads.length-1;ix++){
 for(let iz=0;iz<horizontalRoads.length-1;iz++){
   const left=verticalRoads[ix],right=verticalRoads[ix+1];
   const top=horizontalRoads[iz],bottom=horizontalRoads[iz+1];
   const x=(left+right)/2,z=(top+bottom)/2;
   const w=right-left-3.5,d=bottom-top-3.5;
   if(w<5||d<5||x>82) continue;

   const central=x>0 && x<80 && Math.abs(z)<85;
   const count=central?(rnd()>.58?2:1):(rnd()>.78?2:1);
   for(let n=0;n<count;n++){
     const bw=Math.min(w*.72,7+rnd()*7);
     const bd=Math.min(d*.72,7+rnd()*7);
     const bx=x+(n?((rnd()-.5)*Math.max(0,w-bw)*.45):0);
     const bz=z+(n?((rnd()-.5)*Math.max(0,d-bd)*.45):0);
     const h=central?14+rnd()*30:8+rnd()*17;
     addBuilding(bx,bz,bw,bd,h,buildingColors[Math.floor(rnd()*buildingColors.length)],Math.floor(rnd()*8));
   }
 }
}

// edifícios costeiros altos, afastados do calçadão
for(let z=-90;z<=90;z+=30){
 const h=24+rnd()*22;
 addBuilding(68,z,10,13,h,buildingColors[Math.floor(rnd()*buildingColors.length)],2);
}

// calçadão da praia
box(84,.2,0,5,0.35,250,0xd5d0c2);
for(let z=-115;z<115;z+=12){
 cyl(.08,3,83.2,1.7,z,0x33383d);
 mesh(new THREE.SphereGeometry(.18,8,6),mat(0xffefb0),83.2,3.2,z);
}

// árvores, palmeiras e postes
function tree(x,z,scale=1){
 cyl(.22*scale,2.4*scale,x,1.2*scale,z,0x65412a);
 mesh(new THREE.SphereGeometry(1.7*scale,10,8),mat(0x39864b),x,3*scale,z);
 mesh(new THREE.SphereGeometry(1.1*scale,10,8),mat(0x58a24d),x+.45*scale,3.5*scale,z);
}
function palm(x,z){
 cyl(.13,3.8,x,1.9,z,0x765331);
 for(let i=0;i<6;i++){
   const a=i*Math.PI/3;
   mesh(new THREE.ConeGeometry(.18,1.8,6),mat(0x2e8b57),x+Math.cos(a)*.65,4,z+Math.sin(a)*.65,a);
 }
}
function lamp(x,z){
 cyl(.07,4,x,2,z,0x30343a);
 cyl(.6,.08,x,4,z,0xffe9a4);
}
for(let z=-105;z<=105;z+=18){
 tree(35,z,.7); tree(62,z,.8); lamp(43,z);
}
for(let z=-105;z<=105;z+=25){palm(88,z);}

// pontos turísticos/estabelecimentos
function store(x,z,w,d,h,color,label){
 box(x,h/2,z,w,h,d,color);
 box(x,h+.35,z,w+.15,.7,d+.15,0x44484d);
 box(x,2.2,z-d/2-.06,w*.7,2,.08,0x75c8e8);
}
store(58,-24,12,9,5,0xf08b36,'Restaurante Central');
store(28,42,13,9,5,0x4b83d4,'Shopping');
store(-28,-50,12,9,5,0xe24b3c,'Mercado');
store(60,60,11,9,5,0x43a86b,'Restaurante Praia');

// marcos visuais
box(105,4,0,1,8,250,0x3a87b0);

// markers
function marker(pos,color){
 const g=new THREE.Group();
 const base=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.1,.25,32),mat(color));base.position.y=.15;g.add(base);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,.16,12,32),new THREE.MeshBasicMaterial({color}));ring.rotation.x=Math.PI/2;ring.position.y=.3;g.add(ring);
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,4,8),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7}));beam.position.y=2.2;g.add(beam);
 g.position.copy(pos);scene.add(g);return g;
}
const pickup=marker(new THREE.Vector3(58,.1,-24),0xff9b00);
const customer=marker(new THREE.Vector3(-28,.1,-50),0x42e5ff);
pickup.visible=false;customer.visible=false;

// MOTOCICLETA — modelo compacto esportivo, com piloto visível e baú separado
const bike=new THREE.Group();
const red=mat(0xd9252a,.30,.22), redDark=mat(0x8d1015,.45,.18);
const dark=mat(0x14171b,.30,.35), rubber=mat(0x090b0e,.75,.20), chrome=mat(0xb9c5cf,.18,.85);
const glass=mat(0x101820,.15,.65);

// rodas finas
for(const z of [-1.02,1.02]){
 const wheel=mesh(new THREE.CylinderGeometry(.43,.43,.16,24),rubber,0,.47,z);
 wheel.rotation.z=Math.PI/2;
 const hub=mesh(new THREE.CylinderGeometry(.11,.11,.18,16),chrome,0,.47,z);
 hub.rotation.z=Math.PI/2;
}

// quadro central e braço traseiro
cylinderBetween(new THREE.Vector3(0,.55,-.82),new THREE.Vector3(0,.92,.05),.07,dark);
cylinderBetween(new THREE.Vector3(0,.55,.82),new THREE.Vector3(0,.92,.05),.07,dark);
cylinderBetween(new THREE.Vector3(0,.70,.72),new THREE.Vector3(0,.78,-.45),.06,dark);

// corpo/fairing estreito
const body=mesh(new THREE.SphereGeometry(1,20,12),red,0,1.00,-.12);
body.scale.set(.34,.34,.72);

// tanque esportivo
const tank=mesh(new THREE.SphereGeometry(1,20,12),red,0,1.28,-.30);
tank.scale.set(.37,.30,.52);

// banco preto, deixando a silhueta da moto aparente
const seat=mesh(new THREE.BoxGeometry(.38,.13,.62),dark,0,1.27,.38);
seat.rotation.x=-.08;

// carenagem frontal e para-lama
const nose=mesh(new THREE.SphereGeometry(1,18,10),red,0,1.03,-.82);
nose.scale.set(.27,.30,.38);
const fender=mesh(new THREE.SphereGeometry(1,18,10),redDark,0,.68,-1.02);
fender.scale.set(.30,.10,.36);

// garfo e guidão
cylinderBetween(new THREE.Vector3(-.12,.52,-1.02),new THREE.Vector3(-.16,1.12,-.82),.035,chrome);
cylinderBetween(new THREE.Vector3(.12,.52,-1.02),new THREE.Vector3(.16,1.12,-.82),.035,chrome);
const handle=mesh(new THREE.CylinderGeometry(.035,.035,.78,12),chrome,0,1.43,-.78);
handle.rotation.z=Math.PI/2;

// painel e farol
mesh(new THREE.BoxGeometry(.28,.13,.18),glass,0,1.40,-.66);
mesh(new THREE.SphereGeometry(.11,16,10),new THREE.MeshStandardMaterial({color:0xffffd0,emissive:0xffe39b,emissiveIntensity:2}),0,1.18,-1.12);

// piloto sentado e visível
const riderMat=mat(0x252a30,.55,.25), helmetMat=mat(0x111318,.20,.35);
const torso=mesh(new THREE.CapsuleGeometry(.18,.40,6,12),riderMat,0,1.72,.18);
torso.rotation.x=-.12;
mesh(new THREE.SphereGeometry(.20,16,12),helmetMat,0,2.10,-.02);
cylinderBetween(new THREE.Vector3(-.14,1.82,.08),new THREE.Vector3(-.34,1.47,-.60),.045,riderMat);
cylinderBetween(new THREE.Vector3(.14,1.82,.08),new THREE.Vector3(.34,1.47,-.60),.045,riderMat);
cylinderBetween(new THREE.Vector3(-.10,1.56,.32),new THREE.Vector3(-.14,.78,.68),.06,riderMat);
cylinderBetween(new THREE.Vector3(.10,1.56,.32),new THREE.Vector3(.14,.78,.68),.06,riderMat);

// escapamento
cylinderBetween(new THREE.Vector3(.25,.72,.15),new THREE.Vector3(.25,.66,.92),.055,chrome);

// baú de entrega compacto — aparece quando houver pedido
const boxMat=mat(0xf08a20,.50,.08);
const deliveryBox=mesh(new THREE.BoxGeometry(.64,.42,.56),boxMat,0,1.45,.92);
mesh(new THREE.BoxGeometry(.50,.07,.43),dark,0,1.69,.92);
deliveryBox.visible=false;

bike.position.set(0,0,0);
scene.add(bike);

// Estado inicial explícito: evita o primeiro frame com câmera dentro da moto.
camera.position.set(0,4.8,9.2);
camera.lookAt(0,1,-4);

let money=0,state='idle',remaining=180,orderReward=18,speed=0;
const keys={left:false,right:false,up:false,down:false};
const $=id=>document.getElementById(id);
$('start').onclick=()=>{
 if(state==='idle'||state==='completed'||state==='failed'){
  state='pickup';remaining=180;pickup.visible=true;customer.visible=false;deliveryBox.visible=true;
  $('destination').textContent='Restaurante Central';$('status').textContent='Vá até o restaurante para pegar o pedido';$('start').style.display='none';
 }
};
// CONTROLES — toque/segure sem deixar o navegador transformar o gesto em câmera/scroll.
const controlButtons=document.querySelectorAll('#controls button');
function setControl(k,value){
  if(k) keys[k]=value;
  if(k==='up'&&value) speed=Math.max(speed,7.5);
  if(k==='down'&&value) speed=Math.min(speed,-4.0);
}
controlButtons.forEach(button=>{
 const k=button.dataset.key;
 button.style.touchAction='none';
 const press=e=>{
   e.preventDefault();e.stopPropagation();
   try{button.setPointerCapture?.(e.pointerId)}catch(_){}
   setControl(k,true);
   button.classList.add('pressed');
 };
 const release=e=>{
   e.preventDefault();e.stopPropagation();
   setControl(k,false);
   button.classList.remove('pressed');
 };
 button.addEventListener('pointerdown',press,{passive:false});
 button.addEventListener('pointerup',release,{passive:false});
 button.addEventListener('pointercancel',release,{passive:false});
 button.addEventListener('lostpointercapture',release,{passive:false});
});
addEventListener('pointerup',()=>{
 keys.left=keys.right=keys.up=keys.down=false;
 controlButtons.forEach(b=>b.classList.remove('pressed'));
},{passive:true});
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();
 if(e.key==='ArrowLeft'||k==='a'){e.preventDefault();keys.left=true}
 if(e.key==='ArrowRight'||k==='d'){e.preventDefault();keys.right=true}
 if(e.key==='ArrowUp'||k==='w'){e.preventDefault();keys.up=true}
 if(e.key==='ArrowDown'||k==='s'){e.preventDefault();keys.down=true}
});
addEventListener('keyup',e=>{
 const k=e.key.toLowerCase();
 if(e.key==='ArrowLeft'||k==='a')keys.left=false;
 if(e.key==='ArrowRight'||k==='d')keys.right=false;
 if(e.key==='ArrowUp'||k==='w')keys.up=false;
 if(e.key==='ArrowDown'||k==='s')keys.down=false;
});
function dist(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}

const mapCanvas=document.getElementById('minimap');
const mapCtx=mapCanvas.getContext('2d');

function drawMap(){
 const w=mapCanvas.width,h=mapCanvas.height;
 mapCtx.setTransform(1,0,0,1,0,0);
 mapCtx.clearRect(0,0,w,h);

 // Área do mapa: mesma escala do mundo 3D, enquadrando toda a cidade.
 const minX=-120,maxX=120,minZ=-120,maxZ=120;
 const scale=Math.min(w/(maxX-minX),h/(maxZ-minZ))*.92;
 const ox=w/2,oy=h/2;
 const worldToMap=(x,z)=>({x:ox+x*scale,y:oy+z*scale});

 // fundo/terra
 mapCtx.fillStyle='#78a968';
 mapCtx.fillRect(0,0,w,h);

 // mar e faixa de areia da orla
 const sea=worldToMap(92,-120), sea2=worldToMap(120,120);
 mapCtx.fillStyle='#35a9d2';
 mapCtx.fillRect(sea.x,0,sea2.x-sea.x,h);
 const beach=worldToMap(86,-120), beach2=worldToMap(92,120);
 mapCtx.fillStyle='#e8d19b';
 mapCtx.fillRect(beach.x,0,beach2.x-beach.x,h);

 // quarteirões/ruas
 mapCtx.lineCap='butt';
 for(const r of roads){
   const p=worldToMap(r.x,r.z);
   const rw=Math.max(1.5,r.w*scale), rh=Math.max(1.5,r.d*scale);
   mapCtx.fillStyle=(r.w>r.d)?'#30383f':'#30383f';
   mapCtx.fillRect(p.x-rw/2,p.y-rh/2,rw,rh);
 }

 // calçadas e faixas das avenidas principais
 for(const x of [76,48,18,-12,-42]){
   const p=worldToMap(x,0);
   mapCtx.strokeStyle='#f4d86a';
   mapCtx.lineWidth=1.5;
   mapCtx.beginPath();mapCtx.moveTo(p.x,0);mapCtx.lineTo(p.x,h);mapCtx.stroke();
 }
 for(const z of [-100,-82,-64,-46,-28,-10,0,18,36,54,72,90,108]){
   const p=worldToMap(0,z);
   mapCtx.strokeStyle='#f4d86a';
   mapCtx.lineWidth=1.5;
   mapCtx.beginPath();mapCtx.moveTo(0,p.y);mapCtx.lineTo(w,p.y);mapCtx.stroke();
 }

 // nomes principais, pequenos para caber no minimapa
 mapCtx.font='bold 7px Arial';
 mapCtx.textAlign='center';
 mapCtx.textBaseline='middle';
 mapCtx.fillStyle='#ffffff';
 mapCtx.strokeStyle='#172027';
 mapCtx.lineWidth=3;
 const labels=[
   ['AV. ATLÂNTICA',76,-92],
   ['AV. BRASIL',48,-92],
   ['3ª AV.',18,-92],
   ['4ª AV.',-12,-92],
   ['AV. CENTRAL',58,0]
 ];
 for(const [name,x,z] of labels){
   const p=worldToMap(x,z);
   mapCtx.strokeText(name,p.x,p.y);
   mapCtx.fillText(name,p.x,p.y);
 }

 // destino atual
 const target=state==='pickup'?pickup:customer;
 if(target && target.visible){
   const t=worldToMap(target.position.x,target.position.z);

   // rota direta destacada entre a moto e o destino
   const me0=worldToMap(bike.position.x,bike.position.z);
   mapCtx.save();
   mapCtx.setLineDash([4,3]);
   mapCtx.strokeStyle=state==='pickup'?'#ff9b00':'#29e6ff';
   mapCtx.lineWidth=2;
   mapCtx.beginPath();mapCtx.moveTo(me0.x,me0.y);mapCtx.lineTo(t.x,t.y);mapCtx.stroke();
   mapCtx.restore();

   // círculo pulsante/halo
   mapCtx.fillStyle=state==='pickup'?'#ff8a00':'#00d9ff';
   mapCtx.beginPath();mapCtx.arc(t.x,t.y,6,0,Math.PI*2);mapCtx.fill();
   mapCtx.strokeStyle='#fff';mapCtx.lineWidth=2;mapCtx.stroke();

   mapCtx.font='bold 8px Arial';
   mapCtx.textAlign='center';
   mapCtx.textBaseline='bottom';
   mapCtx.fillStyle='#fff';
   mapCtx.strokeStyle='#101820';
   mapCtx.lineWidth=3;
   const label=state==='pickup'?'PEGAR':'ENTREGAR';
   mapCtx.strokeText(label,t.x,t.y-8);
   mapCtx.fillText(label,t.x,t.y-8);
 }

 // posição e direção da moto
 const me=worldToMap(bike.position.x,bike.position.z);
 mapCtx.save();
 mapCtx.translate(me.x,me.y);
 mapCtx.rotate(-bike.rotation.y);
 mapCtx.fillStyle='#ff3038';
 mapCtx.strokeStyle='#fff';
 mapCtx.lineWidth=1.5;
 mapCtx.beginPath();
 mapCtx.moveTo(0,-7);mapCtx.lineTo(5,6);mapCtx.lineTo(0,3);mapCtx.lineTo(-5,6);mapCtx.closePath();
 mapCtx.fill();mapCtx.stroke();
 mapCtx.restore();

 // borda interna para separar o mapa do HUD
 mapCtx.strokeStyle='#ffffff55';
 mapCtx.lineWidth=2;
 mapCtx.strokeRect(1,1,w-2,h-2);
}

function update(dt){
 const throttle=(keys.up?1:0)-(keys.down?.72:0);
 if(keys.up){
   speed+=18*dt;
 }else if(keys.down){
   speed-=14*.72*dt;
 }else{
   speed*=Math.pow(.975,dt*60);
 }
 speed=THREE.MathUtils.clamp(speed,-7,17);

 const steer=(keys.left?-1:0)+(keys.right?1:0);
 const steeringStrength=1.9+Math.min(Math.abs(speed)*.06,1.0);
 if(steer!==0){
   bike.rotation.y-=steer*steeringStrength*dt*Math.sign(speed||1);
 }
 bike.translateZ(-speed*dt);

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
 const yaw=bike.rotation.y;
 const followDistance=7.2;
 const desired=bike.position.clone().add(
   new THREE.Vector3(0,3.5,followDistance).applyAxisAngle(new THREE.Vector3(0,1,0),yaw)
 );
 camera.position.lerp(desired,1-Math.pow(.0008,dt));

 const lookTarget=bike.position.clone().add(
   new THREE.Vector3(0,1.0,-2.2).applyAxisAngle(new THREE.Vector3(0,1,0),yaw)
 );
 camera.lookAt(lookTarget);
 camera.fov=THREE.MathUtils.lerp(
   camera.fov,64+Math.min(Math.abs(speed)*.55,8),
   1-Math.pow(.01,dt)
 );
 camera.updateProjectionMatrix();
 camera.rotation.z=THREE.MathUtils.lerp(
   camera.rotation.z,
   THREE.MathUtils.clamp(-steer*.025*speed,-.12,.12),
   1-Math.pow(.01,dt)
 );
 drawMap();
}
let last=performance.now();
let runtimeFailed=false;
function showRuntimeError(err){
  if(runtimeFailed)return;
  runtimeFailed=true;
  console.error('[Motoentrega3D]',err);
  const box=document.getElementById('runtimeError');
  if(box){
    box.hidden=false;
    box.innerHTML='<b>Falha na renderização 3D</b><br><small>'+String(err?.message||err).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))+'</small><br><button onclick="location.reload()">Recarregar</button>';
  }
}
function hideRuntimeError(){
  const box=document.getElementById('runtimeError');
  if(box)box.hidden=true;
}
function animate(now){
  try{
    const dt=Math.min((now-last)/1000,.05);
    last=now;
    update(dt);
    renderer.render(scene,camera);
  }catch(err){
    showRuntimeError(err);
  }
}
renderer.setAnimationLoop(animate);
addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
});
