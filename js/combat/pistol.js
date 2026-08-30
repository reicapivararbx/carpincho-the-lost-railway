export class Pistol{
  constructor({magSize=6,reserve=36,reloadDuration=1.2,range=32,spread=.018}={}){ this.magSize=magSize; this.mag=magSize; this.reserve=reserve; this.reloadDuration=reloadDuration; this.reloadRemaining=0; this.range=range; this.spread=spread; this.cooldown=0; }
  get reloading(){return this.reloadRemaining>0}
  shoot(random=Math.random){
    if(this.reloading)return {ok:false,reason:'recarregando'};
    if(this.cooldown>0)return {ok:false,reason:'cooldown'};
    if(this.mag<=0)return {ok:false,reason:this.reserve?'recarregue':'sem munição'};
    this.mag--; this.cooldown=.22;
    return {ok:true,mag:this.mag,range:this.range,spread:{x:(random()-.5)*this.spread,y:(random()-.5)*this.spread}};
  }
  reload(){ if(this.reloading||this.mag===this.magSize||this.reserve<=0)return false; this.reloadRemaining=this.reloadDuration; return true; }
  tick(dt){
    this.cooldown=Math.max(0,this.cooldown-dt);
    if(!this.reloading)return null;
    this.reloadRemaining=Math.max(0,this.reloadRemaining-dt); if(this.reloadRemaining>0)return null;
    const take=Math.min(this.magSize-this.mag,this.reserve); this.mag+=take; this.reserve-=take; return {completed:true,loaded:take,mag:this.mag,reserve:this.reserve};
  }
}
