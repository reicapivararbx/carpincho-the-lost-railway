import { Health } from './health.js';
import { Stamina } from './stamina.js';
export class Player{
  constructor(){ this.health=new Health(); this.stamina=new Stamina(); this.level=1; this.xp=0; this.coins=100; this.pos={x:0,y:0.9,z:0} }
  addXP(n){ this.xp+=n; while(this.xp>=100){ this.xp-=100; this.level++ } }
}
