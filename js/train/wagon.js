import { WagonDB } from '../data/wagons.js';

export class Wagon{
  constructor(type,id=`${type}-${Date.now().toString(36)}`){
    const data=WagonDB.lookup(type); if(!data) throw new TypeError(`tipo de vagão inválido: ${type}`);
    Object.assign(this,data,{id,type,integrity:100,cargoWeight:0,upgrades:[]});
  }
  get totalWeight(){ return this.weight+this.cargoWeight }
  load(weight){ const amount=Math.max(0,Number(weight)||0); if(this.cargoWeight+amount>this.capacity) return false; this.cargoWeight+=amount; return true; }
  unload(weight){ this.cargoWeight=Math.max(0,this.cargoWeight-(Number(weight)||0)); }
  upgrade(id,effect={}){ if(this.upgrades.includes(id)) return false; this.upgrades.push(id); Object.assign(this.effects,{...this.effects,...effect}); return true; }
}
