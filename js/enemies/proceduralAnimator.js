export class EnemyProceduralAnimator{
  constructor(mesh,seed=0){this.mesh=mesh;this.seed=seed;this.time=0}
  update(dt,state='IDLE',speed=1){this.time+=dt;const move=['PATROL','INVESTIGATE','CHASE','FLEE'].includes(state),attack=state==='ATTACK',hurt=['HURT','STUN'].includes(state);if(!this.mesh)return state;this.mesh.position.y=(this.mesh.userData.baseY??this.mesh.position.y)+Math.sin(this.time*(move?8:2)+this.seed)*(move?.06:.025);this.mesh.rotation.z=attack?Math.sin(this.time*16)*.14:hurt?.18:Math.sin(this.time*speed)*.025;if(state==='DEAD')this.mesh.rotation.x=Math.PI/2;return state}
}
