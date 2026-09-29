// Trânsito: carros seguindo as avenidas e ruas, com mão dupla.
const X=[76,48,18,-12,-42], Z=[-100,-82,-64,-46,-28,-10,18,36,54,72,90,108];
const COLORS=[0xd9252a,0x2b6fd6,0xf2f2f2,0x222428,0xf0c030,0x3aa860,0x8a8f96];
export function createTraffic(THREE,scene,mat){
 const cars=[];
 const make=(axis,c,dir)=>{
  const g=new THREE.Group(),col=COLORS[Math.floor(Math.random()*COLORS.length)];
  const b=new THREE.Mesh(new THREE.BoxGeometry(1.9,.9,4),mat(col,.5,.2));b.position.y=.75;g.add(b);
  const t=new THREE.Mesh(new THREE.BoxGeometry(1.6,.7,2.1),mat(0x9fd3ea,.3,.3));t.position.set(0,1.45,-.1);g.add(t);
  g.rotation.y=axis==='z'?(dir>0?Math.PI:0):(dir>0?-Math.PI/2:Math.PI/2);
  scene.add(g);
  cars.push({g,axis,c,dir,t:(Math.random()*2-1)*115,v:4+Math.random()*4,cd:0});
 };
 for(const x of X)for(const dir of [1,-1])for(let i=0;i<3;i++)make('z',x,dir);
 for(const z of Z)for(const dir of [1,-1])make('x',z,dir);
 const place=k=>{const o=k.dir*2.3;
  if(k.axis==='z')k.g.position.set(k.c-o,0,k.t);else k.g.position.set(k.t,0,k.c+o)};
 cars.forEach(place);
 return{cars,
  update(dt){for(const k of cars){k.t+=k.dir*k.v*dt;if(Math.abs(k.t)>118)k.t=-Math.sign(k.t)*118;k.cd=Math.max(0,k.cd-dt);place(k)}},
  hit(p){for(const k of cars){if(k.cd>0)continue;
   if(Math.hypot(k.g.position.x-p.x,k.g.position.z-p.z)<2.4){k.cd=1.2;return k}}return null}};
}
