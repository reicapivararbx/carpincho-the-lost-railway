export class Train{
  constructor(){ this.x=0; this.z=10; this.speed=0; this.fuel=80; this.integrity=100; this.wagons=[]; this.totalWeight=1200 }
  physics(dt){ const power=80; const w=this.totalWeight; if(this.speed>0.01) this.speed=Math.max(0,this.speed -0.3*dt); }
}
