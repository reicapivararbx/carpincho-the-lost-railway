export const ENEMY_STATES=Object.freeze(['IDLE','PATROL','INVESTIGATE','CHASE','ATTACK','HURT','STUN','FLEE','SEARCH','DEAD']);
export class Enemy{
  constructor(data){ Object.assign(this,data); this.hp=data.hp; this.maxHp=data.hp; this.state='IDLE'; this.x=data.x||0; this.z=data.z||0; this.spawn={x:this.x,z:this.z}; this.memory=null; this.stateTime=0; this.stunTime=0; }
  // `damage` is also the data-driven attack strength, so keep incoming damage
  // on an unambiguous method name (the old method was overwritten by data).
  takeDamage(n,{stun=0}={}){ this.hp=Math.max(0,this.hp-(Number(n)||0)); if(this.hp<=0) this.state='DEAD'; else if(stun>0){this.state='STUN';this.stunTime=stun}else this.state='HURT'; this.stateTime=0; return this.hp; }
}
