export const PLAYER_ANIMATIONS = Object.freeze({
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run',
  JUMP: 'jump',
  ATTACK: 'attack',
  HURT: 'hurt',
  DEATH: 'death',
  INTERACT: 'interact',
  LAND: 'land',
});

const ACTION_DURATION = Object.freeze({
  [PLAYER_ANIMATIONS.ATTACK]: .38,
  [PLAYER_ANIMATIONS.HURT]: .3,
  [PLAYER_ANIMATIONS.INTERACT]: .35,
  [PLAYER_ANIMATIONS.LAND]: .18,
});

const lerp=(from,to,amount)=>from+(to-from)*amount;

export class PlayerAnimator{
  constructor(root, parts={}){
    this.root=root;
    this.parts=parts;
    this.state=PLAYER_ANIMATIONS.IDLE;
    this.action=null;
    this.actionTime=0;
    this.time=0;
  }

  play(animation){
    if(!ACTION_DURATION[animation]) return false;
    this.action=animation;
    this.actionTime=ACTION_DURATION[animation];
    return true;
  }

  update(dt, {playerState='ON_FOOT', moving=false, sprinting=false, grounded=true}={}){
    this.time+=dt;
    if(this.actionTime>0){
      this.actionTime=Math.max(0,this.actionTime-dt);
      if(this.actionTime===0) this.action=null;
    }

    if(playerState==='DEAD') this.state=PLAYER_ANIMATIONS.DEATH;
    else if(this.action) this.state=this.action;
    else if(!grounded) this.state=PLAYER_ANIMATIONS.JUMP;
    else if(moving) this.state=sprinting?PLAYER_ANIMATIONS.RUN:PLAYER_ANIMATIONS.WALK;
    else this.state=PLAYER_ANIMATIONS.IDLE;

    const blend=Math.min(1,dt*14);
    const pace=this.state===PLAYER_ANIMATIONS.RUN?13:this.state===PLAYER_ANIMATIONS.WALK?8:2.5;
    const stride=Math.sin(this.time*pace);
    const {body,head,legs=[],rightHand}=this.parts;

    let rootTilt=0;
    let rootPitch=0;
    let scaleY=1;
    let bodyBob=this.state===PLAYER_ANIMATIONS.IDLE?Math.sin(this.time*2.5)*.025:0;
    let legSwing=0;
    let handPitch=0;

    if(this.state===PLAYER_ANIMATIONS.WALK) legSwing=stride*.42;
    else if(this.state===PLAYER_ANIMATIONS.RUN){ legSwing=stride*.68; rootTilt=stride*.025; bodyBob=Math.abs(stride)*.035; }
    else if(this.state===PLAYER_ANIMATIONS.JUMP){ legSwing=.48; rootPitch=-.08; }
    else if(this.state===PLAYER_ANIMATIONS.ATTACK){ handPitch=Math.sin((1-this.actionTime/ACTION_DURATION.attack)*Math.PI)*-1.5; rootTilt=-.08; }
    else if(this.state===PLAYER_ANIMATIONS.HURT){ rootTilt=Math.sin(this.actionTime*55)*.12; scaleY=.92; }
    else if(this.state===PLAYER_ANIMATIONS.INTERACT) handPitch=-.8;
    else if(this.state===PLAYER_ANIMATIONS.LAND){ scaleY=.82; legSwing=.3; }
    else if(this.state===PLAYER_ANIMATIONS.DEATH){ rootPitch=Math.PI*.48; legSwing=.15; }

    if(this.root){
      this.root.rotation.x=lerp(this.root.rotation.x||0,rootPitch,blend);
      this.root.rotation.z=lerp(this.root.rotation.z||0,rootTilt,blend);
      this.root.scale.y=lerp(this.root.scale.y||1,scaleY,blend);
    }
    if(body) body.position.y=lerp(body.position.y||0,bodyBob,blend);
    if(head) head.rotation.z=lerp(head.rotation.z||0,this.state===PLAYER_ANIMATIONS.IDLE?Math.sin(this.time*1.4)*.035:0,blend);
    legs.forEach((leg,index)=>{ leg.rotation.z=lerp(leg.rotation.z||0,legSwing*(index%2===0?1:-1),blend); });
    if(rightHand) rightHand.rotation.x=lerp(rightHand.rotation.x||0,handPitch,blend);
    return this.state;
  }
}
