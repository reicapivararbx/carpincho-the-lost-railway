import { Locomotive } from './locomotive.js';
import { Wagon } from './wagon.js';
import { acceleration,braking,consumption } from './trainPhysics.js';

export class Train{
  constructor({x=0,z=10,wagons=['cargo']}={}){
    this.x=x; this.z=z; this.speed=0; this.throttle=0; this.slope=0; this.route='main'; this.routeProgress=0; this.inTrain=false;
    this.locomotive=new Locomotive(); this.wagons=wagons.map((wagon,i)=>wagon instanceof Wagon?wagon:new Wagon(wagon,`${wagon}-${i+1}`));
  }
  get fuel(){ return this.locomotive.fuel } set fuel(value){ this.locomotive.fuel=Math.max(0,Math.min(this.locomotive.fuelCapacity,Number(value)||0)) }
  get integrity(){ const values=Object.values(this.locomotive.damage); return values.reduce((sum,n)=>sum+n,0)/values.length }
  get integ(){ return this.integrity } set integ(value){ const v=Math.max(0,Math.min(100,Number(value)||0)); Object.keys(this.locomotive.damage).forEach(key=>this.locomotive.damage[key]=v); }
  get totalWeight(){ return this.locomotive.weight+this.wagons.reduce((sum,w)=>sum+w.totalWeight,0) }
  get weight(){return this.totalWeight} set weight(value){}
  get totalCapacity(){ return this.wagons.reduce((sum,w)=>sum+w.capacity,0) }
  attach(type){ const wagon=new Wagon(type,`${type}-${crypto?.randomUUID?.()||Date.now()}`); this.wagons.push(wagon); return wagon; }
  detach(id){ const index=this.wagons.findIndex(w=>w.id===id); if(index<0)return null; return this.wagons.splice(index,1)[0]; }
  accelerate(amount=.25){ this.throttle=Math.min(1,this.throttle+amount); }
  brake(amount=.4){ this.throttle=Math.max(-1,this.throttle-amount); }
  tick(dt,{slope=this.slope}={}){
    if(this.throttle>0&&this.fuel>0){ this.speed=Math.min(this.locomotive.maxSpeed,this.speed+acceleration(this,slope)*this.throttle*dt); this.fuel-=Math.abs(this.speed)*consumption(this,slope)*dt; }
    else { this.speed=Math.max(0,this.speed-braking(this)*Math.max(.15,-this.throttle)*dt); }
    if(this.fuel<=0){ this.fuel=0; this.throttle=0; }
    this.routeProgress+=this.speed*dt; return {speed:this.speed,fuel:this.fuel,weight:this.totalWeight};
  }
  toJSON(){ return {x:this.x,z:this.z,speed:this.speed,throttle:this.throttle,route:this.route,routeProgress:this.routeProgress,inTrain:this.inTrain,locomotive:this.locomotive,wagons:this.wagons} }
  fromJSON(data={}){if(Number.isFinite(data.x))this.x=data.x;if(Number.isFinite(data.z))this.z=data.z;for(const key of ['speed','throttle','routeProgress'])if(Number.isFinite(data[key]))this[key]=data[key];if(typeof data.route==='string')this.route=data.route;this.inTrain=Boolean(data.inTrain);if(data.locomotive){Object.assign(this.locomotive,data.locomotive);this.locomotive.damage={...this.locomotive.damage,...data.locomotive.damage}}if(Array.isArray(data.wagons))this.wagons=data.wagons.map((saved,i)=>{const wagon=new Wagon(saved.type||'cargo',saved.id||`wagon-${i}`);Object.assign(wagon,saved);return wagon});return this}
}
