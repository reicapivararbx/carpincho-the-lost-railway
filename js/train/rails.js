import * as THREE from 'three';
export function createRails(scene){
  const curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-80,0,10),new THREE.Vector3(-48,0,10),new THREE.Vector3(-18,1,7),
    new THREE.Vector3(15,0,10),new THREE.Vector3(42,2,16),new THREE.Vector3(72,0,10),new THREE.Vector3(110,4,5),new THREE.Vector3(150,1,10),
    new THREE.Vector3(195,0,6),new THREE.Vector3(250,0,12),new THREE.Vector3(310,2,8),new THREE.Vector3(370,5,10),new THREE.Vector3(435,0,4),new THREE.Vector3(470,0,10),
  ]);
  const points=curve.getPoints(50);
  const group=new THREE.Group();
  const railMaterial=new THREE.MeshStandardMaterial({color:0x424242, metalness:0.75, roughness:0.35});
  const sleeperMaterial=new THREE.MeshStandardMaterial({color:0x4e321d, roughness:0.9});
  const railPoints=curve.getSpacedPoints(460);
  for(let i=1;i<railPoints.length;i+=2){
    const point=railPoints[i], previous=railPoints[i-1]; const angle=Math.atan2(point.z-previous.z,point.x-previous.x);
    [-0.62,0.62].forEach(offset=>{
      const rail=new THREE.Mesh(new THREE.BoxGeometry(1.25,0.13,0.1), railMaterial);
      rail.position.set(point.x-Math.sin(angle)*offset,point.y+.18,point.z+Math.cos(angle)*offset); rail.rotation.y=-angle; rail.receiveShadow=true; group.add(rail);
    });
    const sleeper=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.1,1.75), sleeperMaterial);
    sleeper.position.set(point.x,point.y+.05,point.z); sleeper.rotation.y=-angle; sleeper.receiveShadow=true; group.add(sleeper);
  }
  scene.add(group);
  const broken=new THREE.Mesh(new THREE.BoxGeometry(3.8,0.18,1.7), new THREE.MeshStandardMaterial({color:0xa02525, emissive:0x260000}));
  broken.position.set(14,0.3,10); scene.add(broken);
  const junction=new THREE.CatmullRomCurve3([new THREE.Vector3(42,2,16),new THREE.Vector3(56,1,25),new THREE.Vector3(78,0,30)]);
  const bridge=new THREE.Mesh(new THREE.BoxGeometry(14,.55,3.2),new THREE.MeshStandardMaterial({color:0x625343,metalness:.35})); bridge.position.set(48,.1,18.8); bridge.rotation.y=-.32; scene.add(bridge);
  const tunnel=new THREE.Mesh(new THREE.TorusGeometry(3,.5,8,18,Math.PI),new THREE.MeshStandardMaterial({color:0x48433e})); tunnel.position.set(-42,2.5,9.5); tunnel.rotation.z=Math.PI/2; scene.add(tunnel);
  return {curve,junction,broken,bridge,tunnel,group};
}
