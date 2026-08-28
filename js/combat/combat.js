export class Combat{ constructor(){ this.cooldown=0 } tick(dt){ if(this.cooldown>0) this.cooldown-=dt } }
