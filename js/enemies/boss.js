import { Enemy } from './enemy.js';
import { BOSSES } from '../data/enemies.js';
export class Boss extends Enemy{
  constructor(id){ const d=BOSSES.find(b=>b.id===id); if(!d)throw new TypeError(`chefe inválido: ${id}`); super({...d,x:d.arena.center.x,z:d.arena.center.z}); this.boss=true; this.phase=0; this.summons=[]; this.music=d.music; }
  updatePhase(){ const pct=this.hp/this.maxHp*100; const next=this.phases.findIndex(phase=>pct>phase.hpThreshold); this.phase=next<0?this.phases.length-1:next; return this.phases[this.phase]; }
  chooseAttack(distance,random=Math.random){ const phase=this.updatePhase(); const attacks=(phase.attacks||[]).map(id=>this.attacks?.find(attack=>attack.id===id)||{id,damage:this.damage,range:8,cooldown:4}); const possible=attacks.filter(attack=>distance<=attack.range||attack.range===0); return possible[Math.floor(random()*possible.length)]||null; }
}
