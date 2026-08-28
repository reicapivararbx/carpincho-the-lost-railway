import * as THREE from 'three';
export function createRails(scene){
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-80,0,10),new THREE.Vector3(80,0,10)]);
  const points=curve.getPoints(50);
  const group=new THREE.Group();
  const railMaterial=new THREE.MeshStandardMaterial({color:0x424242, metalness:0.75, roughness:0.35});
  const sleeperMaterial=new THREE.MeshStandardMaterial({color:0x4e321d, roughness:0.9});
  for(let x=-78; x<=78; x+=1.2){
    [-0.62,0.62].forEach(z=>{
      const rail=new THREE.Mesh(new THREE.BoxGeometry(1.25,0.13,0.1), railMaterial);
      rail.position.set(x,0.18,10+z); rail.receiveShadow=true; group.add(rail);
    });
    const sleeper=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.1,1.75), sleeperMaterial);
    sleeper.position.set(x,0.05,10); sleeper.receiveShadow=true; group.add(sleeper);
  }
  scene.add(group);
  const broken=new THREE.Mesh(new THREE.BoxGeometry(3.8,0.18,1.7), new THREE.MeshStandardMaterial({color:0xa02525, emissive:0x260000}));
  broken.position.set(14,0.3,10); scene.add(broken);
  return {curve,broken,group};
}
