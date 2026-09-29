// Pontos turísticos de Balneário Camboriú (posições estilizadas, não em escala real).
// x = leste (mar) · z = sul. stop = onde fica o marcador de coleta/entrega.
export const LANDMARKS=[
 {id:'careca',name:'Morro do Careca',icon:'⛰️',x:72,z:-114,sx:66,sz:-106},
 {id:'pontal',name:'Deck do Pontal Norte',icon:'🌊',x:104,z:-96,sx:86,sz:-100},
 {id:'cristo',name:'Cristo Luz',icon:'✝️',x:-70,z:54,sx:-54,sz:54},
 {id:'roda',name:'Roda-Gigante FG',icon:'🎡',x:92,z:98,sx:82,sz:90},
 {id:'uni',name:'Parque Unipraias',icon:'🚡',x:78,z:116,sx:76,sz:110},
 {id:'molhe',name:'Molhe da Barra Sul',icon:'⚓',x:110,z:118,sx:90,sz:110},
 {id:'aqua',name:'Oceanic Aquarium',icon:'🐠',x:40,z:116,sx:40,sz:110},
 {id:'passa',name:'Passarela da Barra',icon:'🌉',x:20,z:116,sx:20,sz:110}
];

export function buildLandmarks(THREE,scene,mat){
 const add=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);scene.add(o);return o};
 const B=(x,y,z,w,h,d,c)=>add(new THREE.BoxGeometry(w,h,d),mat(c),x,y,z);
 const hill=(x,z,r,h,c=0x4f7d45)=>add(new THREE.ConeGeometry(r,h,16),mat(c,.95),x,h/2,z);
 const line=(a,b,r,c)=>{const d=new THREE.Vector3().subVectors(b,a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),6),mat(c));
  m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());scene.add(m)};
 const L=Object.fromEntries(LANDMARKS.map(l=>[l.id,l]));

 // Morro do Careca + rampa de voo livre
 let l=L.careca;hill(l.x,l.z,20,30);B(l.x,30.5,l.z,5,1,3,0xffffff);
 for(const s of [-1,1])add(new THREE.ConeGeometry(2.2,4,3),mat(s>0?0xff5a36:0x2b90ff),l.x+s*4,36,l.z+s*2);

 // Deck do Pontal Norte
 l=L.pontal;B(l.x,.5,l.z,16,.6,7,0x9c7a55);B(l.x,1.6,l.z,3,2,3,0xe6e0d0);

 // Cristo Luz (Morro da Cruz)
 l=L.cristo;hill(l.x,l.z,16,24);
 B(l.x,34,l.z,2.2,18,2.2,0xf4f4f0);B(l.x,38,l.z,16,1.8,1.8,0xf4f4f0);
 add(new THREE.SphereGeometry(1.5,10,8),mat(0xf4f4f0),l.x,44,l.z);

 // Roda-gigante
 l=L.roda;const wy=10;
 add(new THREE.TorusGeometry(8,.35,8,32),mat(0xffffff),l.x,wy+1,l.z).rotation.y=Math.PI/2;
 for(let i=0;i<8;i++){const a=i*Math.PI/8;
  const s=B(l.x,wy+1,l.z,.2,16,.2,0xd8e6f0);s.rotation.x=a;
  const cab=B(l.x,wy+1+Math.cos(a)*8,l.z+Math.sin(a)*8,1.4,1.2,1.4,i%2?0x2b90ff:0xff8a00);}
 B(l.x,5,l.z-3,.5,11,.5,0xd8e6f0);B(l.x,5,l.z+3,.5,11,.5,0xd8e6f0);

 // Parque Unipraias: estação Barra Sul + morro + cabo do bondinho
 l=L.uni;hill(50,122,20,26);B(l.x,3,l.z,9,6,7,0xd9d2c0);B(l.x,6.4,l.z,10,.8,8,0xe24b3c);
 const top=new THREE.Vector3(52,25,121);line(new THREE.Vector3(l.x,7,l.z),top,.09,0x222222);
 for(const t of [.3,.65]){const p=new THREE.Vector3(l.x,7,l.z).lerp(top,t);B(p.x,p.y-.9,p.z,1.3,1.1,1.3,0xe24b3c)}

 // Molhe da Barra Sul
 l=L.molhe;B(l.x,.9,l.z,42,1.8,3.5,0x8d8f92);B(l.x+19,3.2,l.z,1,3,1,0xff3030);

 // Oceanic Aquarium
 l=L.aqua;B(l.x,4,l.z,16,8,11,0x2b7fc4);add(new THREE.SphereGeometry(5,16,10,0,Math.PI*2,0,Math.PI/2),mat(0x6fd0e8,.3),l.x,8,l.z);

 // Passarela da Barra (arco)
 l=L.passa;const arch=add(new THREE.TorusGeometry(12,.5,8,24,Math.PI),mat(0xf2f2f2),l.x,0,l.z);
 B(l.x,.6,l.z,24,.5,3,0xcfcfcf);

 // Rótulos flutuantes
 for(const m of LANDMARKS){
  const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');
  g.font='bold 44px Arial';g.textAlign='center';g.lineWidth=8;g.strokeStyle='#101820';
  const t=m.icon+' '+m.name;g.strokeText(t,256,62);g.fillStyle='#fff';g.fillText(t,256,62);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true,fog:false}));
  sp.scale.set(24,4.5,1);sp.position.set(m.x,{careca:44,cristo:52,roda:24,uni:34}[m.id]||14,m.z);sp.renderOrder=9;scene.add(sp);
 }
}
