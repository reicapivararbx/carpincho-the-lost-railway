import { ENEMIES } from '../data/enemies.js';
import { Enemy } from './enemy.js';
export function spawnMob(id,x,z){
  const d=ENEMIES.find(e=>e.id===id); if(!d) return null; return new Enemy({...d,x,z});
}
