export function onTrigger(pos,target,cb){ if(Math.hypot(pos.x-target.x,pos.z-target.z)<3) cb() }
