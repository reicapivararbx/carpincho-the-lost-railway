export class Furnace{
  constructor(onComplete=null){
    this.input=null; this.fuel=null; this.output=null; this.progress=0; this.time=0; this.duration=4;
    this.onUpdate=null; this.onComplete=onComplete;
  }
  setInput(item){ this.input=item; this.progress=0; }
  setFuel(item){ this.fuel=item; }
  canSmelt(){ return ['iron_ore','copper_ore'].includes(this.input) && this.fuel==='coal' }
  tick(dt){
    if(!this.canSmelt()) return;
    this.time+=dt; this.progress = Math.min(1, this.time/this.duration);
    if(this.onUpdate) this.onUpdate(this.progress);
    if(this.progress>=1){
      const input=this.input; this.input=null; this.fuel=null; this.time=0; this.progress=0; this.output=input==='copper_ore'?'copper_ingot':'iron_ingot';
      this.onComplete?.(this.output);
      if(this.onUpdate) this.onUpdate(0);
    }
  }
}
