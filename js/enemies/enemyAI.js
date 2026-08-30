export class EnemyAI{
  constructor(e,{memoryDuration=4,hearingRange=10,fleeThreshold=.16}={}){ this.e=e; this.memoryDuration=memoryDuration; this.hearingRange=hearingRange; this.fleeThreshold=fleeThreshold; this.patrolAngle=0; }
  canSee(playerPos,world={}){ const d=Math.hypot(this.e.x-playerPos.x,this.e.z-playerPos.z); return d<=(this.e.aggroRange||16)&&!world.hasLineObstacle?.({x:this.e.x,z:this.e.z},playerPos); }
  moveToward(target,dt,multiplier=1){ const dx=target.x-this.e.x,dz=target.z-this.e.z,len=Math.hypot(dx,dz)||1; this.e.x+=dx/len*this.e.speed*multiplier*dt; this.e.z+=dz/len*this.e.speed*multiplier*dt; }
  update(dt, playerPos,world={}){
    const d=Math.hypot(this.e.x-playerPos.x, this.e.z-playerPos.z);
    if(this.e.state==='DEAD') return;
    this.e.stateTime=(this.e.stateTime||0)+dt;
    if(this.e.state==='STUN'){this.e.stunTime-=dt;if(this.e.stunTime>0)return;this.e.state='HURT';this.e.stateTime=0}
    if(this.e.state==='HURT'&&this.e.stateTime<.25)return;
    const heard=world.noise&&Math.hypot(this.e.x-world.noise.x,this.e.z-world.noise.z)<=this.hearingRange*world.noise.level;
    const visible=this.canSee(playerPos,world);
    if(visible)this.e.memory={x:playerPos.x,z:playerPos.z,time:this.memoryDuration}; else if(this.e.memory)this.e.memory.time-=dt;
    if(this.e.hp/this.e.maxHp<=this.fleeThreshold&&!this.e.boss&&!this.e.elite){this.e.state='FLEE';this.moveToward({x:this.e.x+(this.e.x-playerPos.x),z:this.e.z+(this.e.z-playerPos.z)},dt,1.2);return}
    if(d<(this.e.attackRange||2)){this.e.state='ATTACK';return}
    if(visible){this.e.state='CHASE';this.moveToward(playerPos,dt);return}
    if(heard){this.e.state='INVESTIGATE';this.moveToward(world.noise,dt,.75);return}
    if(this.e.memory?.time>0){this.e.state=d<3?'SEARCH':'CHASE';this.moveToward(this.e.memory,dt,.7);return}
    if(this.e.stateTime<1){this.e.state='IDLE';return}
    this.e.state='PATROL';this.patrolAngle+=dt*.45;this.moveToward({x:this.e.spawn.x+Math.cos(this.patrolAngle)*4,z:this.e.spawn.z+Math.sin(this.patrolAngle)*4},dt,.35);
  }
}
