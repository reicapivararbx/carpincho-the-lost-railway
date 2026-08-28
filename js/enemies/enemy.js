export class Enemy{
  constructor(data){ Object.assign(this,data); this.hp=data.hp; this.maxHp=data.hp; this.state='IDLE'; this.x=data.x||0; this.z=data.z||0 }
  damage(n){ this.hp=Math.max(0,this.hp-n); if(this.hp<=0) this.state='DEAD' }
}
