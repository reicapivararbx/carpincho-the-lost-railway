export class EnemyAI{
  constructor(e){ this.e=e }
  update(dt, playerPos){
    const d=Math.hypot(this.e.x-playerPos.x, this.e.z-playerPos.z);
    if(this.e.state==='DEAD') return;
    if(d<2){ this.e.state='ATTACK' }
    else if(d<16){ this.e.state='CHASE'; const dx=playerPos.x-this.e.x; const dz=playerPos.z-this.e.z; const len=Math.hypot(dx,dz)||1; this.e.x+=dx/len*this.e.speed*dt; this.e.z+=dz/len*this.e.speed*dt }
    else this.e.state='PATROL';
  }
}
