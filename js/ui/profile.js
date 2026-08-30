export const ACHIEVEMENTS=[{id:'first_rail',name:'Primeiro Trilho',stat:'railsRepaired',target:1},{id:'miner',name:'Minerador',stat:'resourcesMined',target:100},{id:'guardian',name:'Guardião Caído',stat:'bossesDefeated',target:1},{id:'explorer',name:'Além do Horizonte',stat:'regionsDiscovered',target:8}];
export class PlayerProfile{
  constructor(){this.stats={playTime:0,distance:0,resourcesMined:0,enemiesDefeated:0,bossesDefeated:0,railsRepaired:0,regionsDiscovered:1};this.achievements=new Set();this.collections={enemies:new Set(),resources:new Set(),regions:new Set(['plain'])}}
  add(stat,amount=1){this.stats[stat]=(this.stats[stat]||0)+amount;const unlocked=ACHIEVEMENTS.filter(a=>a.stat===stat&&this.stats[stat]>=a.target&&!this.achievements.has(a.id));unlocked.forEach(a=>this.achievements.add(a.id));return unlocked}
  collect(type,id){this.collections[type]?.add(id)}
  toJSON(){return {stats:this.stats,achievements:[...this.achievements],collections:Object.fromEntries(Object.entries(this.collections).map(([key,set])=>[key,[...set]]))}}
  fromJSON(data={}){this.stats={...this.stats,...data.stats};this.achievements=new Set(data.achievements||[]);for(const key of Object.keys(this.collections))this.collections[key]=new Set(data.collections?.[key]||[])}
}
