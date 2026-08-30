import { REGIONS } from '../data/regions.js';
import { createLandmarkData } from './landmarks.js';

export function createRegionalWorld(scene,THREE){
  const groups=new Map(),landmarks=[],resources=[];
  for(const region of REGIONS){
    const group=new THREE.Group();group.name=`region:${region.id}`;group.userData.chunkKey=`${Math.floor(region.center.x/32)}:0`;
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(58,88,1,1),new THREE.MeshStandardMaterial({color:region.color,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(region.center.x,-.012,0);ground.receiveShadow=true;group.add(ground);
    region.landmarks.forEach((type,index)=>{const data=createLandmarkData(region,index),material=new THREE.MeshStandardMaterial({color:index===0?0xd1a85b:0x66737a,roughness:.85}),mesh=new THREE.Mesh(type.includes('tower')?new THREE.CylinderGeometry(.7,1.1,5,8):type.includes('cave')||type.includes('tunnel')?new THREE.TorusGeometry(2,.45,8,18,Math.PI):new THREE.BoxGeometry(2.8,1.7+(index%2),2.4),material);mesh.position.set(data.x,type.includes('tower')?2.5:1,data.z);mesh.castShadow=true;mesh.userData.landmark=data;group.add(mesh);landmarks.push({...data,mesh})});
    region.resources.slice(0,4).forEach((raw,index)=>{const type=raw==='wood'?'tree':raw==='stone'?'rock':raw,colors={tree:0x286238,rock:0x777777,coal:0x171717,iron_ore:0xc26d32,copper_ore:0xcd703f,crystal:0x76ccea,titanium_ore:0x647ce8,ember_core:0xff512c,scrap:0x827766},mesh=new THREE.Mesh(type==='tree'?new THREE.ConeGeometry(.8,2.4,7):new THREE.OctahedronGeometry(.55+(index%2)*.1),new THREE.MeshStandardMaterial({color:colors[type]||0x6c8464,emissive:['crystal','ember_core'].includes(type)?colors[type]:0x000000,emissiveIntensity:.3}));const x=region.center.x-17+index*10,z=index%2?23:-23;mesh.position.set(x,type==='tree'?1.2:.55,z);group.add(mesh);resources.push({id:`${region.id}:resource:${index}`,type,x,z,mesh})});
    group.visible=region.id==='plain';scene.add(group);groups.set(region.id,group);
  }
  return {groups,landmarks,resources};
}
