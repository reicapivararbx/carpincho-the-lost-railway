import { Enemy } from './enemy.js';
import { BOSSES } from '../data/enemies.js';
export class Boss extends Enemy{
  constructor(id){ const d=BOSSES.find(b=>b.id===id); super({...d, x:40,z:0}); this.boss=true; this.phase=0 }
  updatePhase(){ const pct=this.hp/this.maxHp*100; if(pct<35) this.phase=2; else if(pct<70) this.phase=1; else this.phase=0 }
}
