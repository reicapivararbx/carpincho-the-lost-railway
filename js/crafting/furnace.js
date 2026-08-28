export class Furnace{
  constructor(onComplete=null){
    this.input=null; this.fuel=null; this.output=null; this.progress=0; this.time=0; this.duration=4;
    this.onUpdate=null; this.onComplete=onComplete;
  }
  setInput(item){ this.input=item; this.progress=0; }
  setFuel(item){ this.fuel=item; }
  canSmelt(){ return this.input==='iron_ore' && this.fuel==='coal' }
  tick(dt){
    if(!this.canSmelt()) return;
    this.time+=dt; this.progress = Math.min(1, this.time/this.duration);
    if(this.onUpdate) this.onUpdate(this.progress);
    if(this.progress>=1){
      this.input=null; this.fuel=null; this.time=0; this.progress=0; this.output='iron_ingot';
      this.onComplete?.(this.output);
      if(this.onUpdate) this.onUpdate(0);
    }
  }
}
