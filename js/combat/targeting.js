export function raycastHit(origin,direction,targets,{range=40,radius=.75}={}){
  let nearest=null;
  let nearestDistance=range;
  for(const target of targets||[]){
    const dx=target.x-origin.x,dz=target.z-origin.z;
    const along=dx*direction.x+dz*direction.z;
    const side=Math.abs(dx*direction.z-dz*direction.x);
    if(along>=0&&along<=nearestDistance&&side<=radius){nearest={object:target,distance:along};nearestDistance=along}
  }
  return nearest;
}
