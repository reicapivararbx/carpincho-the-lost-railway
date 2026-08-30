export class Sword{
  constructor(){ this.combo=0; this.last=0; this.cooldownUntil=0; this.blocking=false; this.durability=100 }
  attack(now,{heavy=false}={}){
    if(now<this.cooldownUntil||this.durability<=0) return {ok:false,reason:this.durability<=0?'arma quebrada':'cooldown'};
    if(now-this.last>.8) this.combo=0;
    this.combo=heavy?0:(this.combo%3)+1; this.last=now; this.blocking=false; this.cooldownUntil=now+(heavy?.9:.32+this.combo*.05); this.durability=Math.max(0,this.durability-(heavy?2:1));
    return {ok:true,combo:this.combo,heavy,damage:heavy?30:15*(1+(this.combo-1)*.18),stamina:heavy?28:10+this.combo*2,cooldown:this.cooldownUntil-now};
  }
  setBlocking(value){ this.blocking=Boolean(value); return this.blocking; }
  mitigate(damage){ return this.blocking?Math.ceil(Math.max(0,damage)*.35):Math.max(0,damage); }
}
