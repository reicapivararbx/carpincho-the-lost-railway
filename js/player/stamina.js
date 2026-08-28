export class Stamina{
  constructor(max=100){ this.max=max; this.current=max }
  use(n){ if(this.current<n) return false; this.current-=n; return true }
  regen(dt){ this.current=Math.min(this.max,this.current+22*dt) }
  get pct(){ return this.current/this.max }
}
