export const WEATHER_TYPES=Object.freeze({
  sun:{visibility:1,traction:1,particles:null,ambient:1},rain:{visibility:.8,traction:.82,particles:'rain',ambient:.75},storm:{visibility:.55,traction:.65,particles:'rain',ambient:.48,lightning:true},fog:{visibility:.38,traction:.95,particles:'mist',ambient:.65},snow:{visibility:.65,traction:.7,particles:'snow',ambient:.82},sandstorm:{visibility:.28,traction:.78,particles:'sand',ambient:.55},ashstorm:{visibility:.35,traction:.85,particles:'ash',ambient:.5},
});
export class Weather{
  constructor(){this.current='sun';this.intensity=0;this.target='sun';this.transition=0}
  set(weather,duration=2){if(!WEATHER_TYPES[weather])return false;this.target=weather;this.transition=Math.max(0,duration);if(duration===0){this.current=weather;this.intensity=1}return true}
  tick(dt){if(this.current===this.target){this.intensity=Math.min(1,this.intensity+dt);return this.state}this.transition-=dt;this.intensity=Math.max(0,this.intensity-dt*1.5);if(this.transition<=0||this.intensity===0){this.current=this.target;this.intensity=0}return this.state}
  get state(){return {type:this.current,intensity:this.intensity,...WEATHER_TYPES[this.current]}}
}
