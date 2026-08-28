export function createTerrain(scene, THREE){
  const geo=new THREE.PlaneGeometry(400,400,32,32);
  const mat=new THREE.MeshStandardMaterial({color:0x2d5a1e});
  const mesh=new THREE.Mesh(geo,mat);
  mesh.rotation.x=-Math.PI/2;
  mesh.receiveShadow=true;
  scene.add(mesh);
  return mesh;
}
