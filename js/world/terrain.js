export function createTerrain(scene, THREE){
  const geo=new THREE.PlaneGeometry(400,400,32,32);
  const mat=new THREE.MeshStandardMaterial({color:0x2d5a1e, roughness:0.95, metalness:0});
  const mesh=new THREE.Mesh(geo,mat);
  mesh.rotation.x=-Math.PI/2;
  mesh.receiveShadow=true;
  scene.add(mesh);
  // Low-poly landmarks keep the MVP readable while real GLB assets are added.
  const ridge=new THREE.Group();
  const mountainMat=new THREE.MeshStandardMaterial({color:0x29452f, roughness:1});
  const snowMat=new THREE.MeshStandardMaterial({color:0xb9c7b0, roughness:1});
  [-48,-30,-12,10,29,47].forEach((x,i)=>{
    const mountain=new THREE.Mesh(new THREE.ConeGeometry(9+(i%2)*4,16+(i%3)*4,7),mountainMat);
    mountain.position.set(x,-.15,-34-(i%2)*6); mountain.castShadow=true; ridge.add(mountain);
    if(i%2===0){ const snow=new THREE.Mesh(new THREE.ConeGeometry(3.8,5.5,7),snowMat); snow.position.set(x,7.2,-34-(i%2)*6); ridge.add(snow); }
  });
  scene.add(ridge);
  const grassMat=new THREE.MeshStandardMaterial({color:0x4f8a31,roughness:1}),grass=new THREE.InstancedMesh(new THREE.ConeGeometry(.08,.45,4),grassMat,180),matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3(1,1,1);
  for(let i=0;i<180;i++){rotation.setFromAxisAngle(new THREE.Vector3(0,0,1),(i%3-.9)*.2);matrix.compose(new THREE.Vector3((i*17%500)-35,.2,(i*31%82)-41),rotation,scale);grass.setMatrixAt(i,matrix)}grass.instanceMatrix.needsUpdate=true;grass.frustumCulled=true;grass.name='vegetation';scene.add(grass);
  const stoneInstances=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.22),new THREE.MeshStandardMaterial({color:0x67706b,roughness:1}),72);for(let i=0;i<72;i++){matrix.makeTranslation((i*47%510)-38,.15,(i*29%84)-42);stoneInstances.setMatrixAt(i,matrix)}stoneInstances.instanceMatrix.needsUpdate=true;stoneInstances.frustumCulled=true;scene.add(stoneInstances);
  return mesh;
}
