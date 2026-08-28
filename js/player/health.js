export class Health{
  constructor(max=100){ this.max=max; this.current=max }
  damage(n){ this.current=Math.max(0,this.current-n) }
  heal(n){ this.current=Math.min(this.max,this.current+n) }
  get dead(){ return this.current<=0 }
  get pct(){ return this.current/this.max }
}
