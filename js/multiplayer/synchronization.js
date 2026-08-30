export class Sync{
  constructor({rate=20,interpolation=.1}={}){this.rate=rate;this.interval=1/rate;this.interpolation=interpolation;this.accumulator=0;this.snapshots=new Map()}
  shouldSend(dt){this.accumulator+=dt;if(this.accumulator<this.interval)return false;this.accumulator%=this.interval;return true}
  push(id,state,at=performance.now()){const list=this.snapshots.get(id)||[];list.push({state:{...state},at});while(list.length>3)list.shift();this.snapshots.set(id,list)}
  sample(id,now=performance.now()){const list=this.snapshots.get(id)||[];if(!list.length)return null;if(list.length===1)return list[0].state;const [a,b]=list.slice(-2),span=Math.max(1,b.at-a.at),t=Math.max(0,Math.min(1,(now-this.interpolation*1000-a.at)/span));const out={...b.state};for(const key of ['x','y','z','yaw','speed'])if(Number.isFinite(a.state[key])&&Number.isFinite(b.state[key]))out[key]=a.state[key]+(b.state[key]-a.state[key])*t;return out}
}
