import { ENEMIES,enemyVariant } from '../data/enemies.js';
import { Enemy } from './enemy.js';
export function spawnMob(id,x,z){
  const d=ENEMIES.find(e=>e.id===id); if(!d) return null; return new Enemy({...d,x,z});
}

export class MobPopulation{
  constructor({max=18,despawnDistance=75}={}){this.max=max;this.despawnDistance=despawnDistance;this.mobs=[]}
  reconcile({region,time='day',weather='sun',playerPos={x:0,z:0},level=1,random=Math.random}){
    const despawned=this.mobs.filter(m=>m.state==='DEAD'||Math.hypot(m.x-playerPos.x,m.z-playerPos.z)>this.despawnDistance);
    this.mobs=this.mobs.filter(m=>!despawned.includes(m)); const candidates=ENEMIES.filter(e=>e.region===region&&e.level<=level+5&&(!e.spawnTime||e.spawnTime===time)&&(!e.weather||e.weather===weather)); const spawned=[];
    while(this.mobs.length<this.max&&candidates.length){const base=candidates[Math.floor(random()*candidates.length)];const roll=random();const variant=roll<.02?'rare':roll<.08?'elite':roll<.2?'alpha':'normal';const mob=new Enemy({...enemyVariant(base,variant),x:playerPos.x+20+random()*25,z:playerPos.z-20+random()*40});this.mobs.push(mob);spawned.push(mob)}
    return {spawned,despawned,active:this.mobs};
  }
}
