function distanceSquared(x1,z1,x2,z2){
  const dx=x1-x2, dz=z1-z2;
  return dx*dx+dz*dz;
}

function blocks(currentX,currentZ,nextX,nextZ,collider,playerRadius){
  if(!collider || collider.disabled) return false;
  const radius=playerRadius+(Number(collider.radius)||0);
  const nextDistance=distanceSquared(nextX,nextZ,collider.x,collider.z);
  if(nextDistance>=radius*radius) return false;
  const currentDistance=distanceSquared(currentX,currentZ,collider.x,collider.z);
  return nextDistance<currentDistance;
}

export function resolveCircleMovement(position, delta, colliders, playerRadius=.45){
  let x=position.x;
  let z=position.z;
  const nextX=x+delta.x;
  if(!colliders.some(collider=>blocks(x,z,nextX,z,collider,playerRadius))) x=nextX;
  const nextZ=z+delta.z;
  if(!colliders.some(collider=>blocks(x,z,x,nextZ,collider,playerRadius))) z=nextZ;
  return {x,z};
}
