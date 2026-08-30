import { ItemDB } from '../data/items.js';

export class PlayerEquipment{
  constructor(inventory=null){ this.inventory=inventory; this.tools=[]; this.weapon=null; this.selected=null }
  equip(id){
    const item=ItemDB.lookup(id);
    if(!item || (this.inventory && !this.inventory.has(id))) return false;
    if(item.category==='weapon') this.weapon=id;
    if(item.category==='tool' && !this.tools.includes(id)) this.tools.push(id);
    this.selected=id; return true;
  }
  tier(kind){
    const candidates=this.tools.filter(id=>id.startsWith(kind));
    return Math.max(-1,...candidates.filter(id=>!this.inventory||this.inventory.has(id)).map(id=>ItemDB.lookup(id)?.tier??-1));
  }
  use(amount=1){ return this.inventory?.damageDurability(this.selected,amount)||{ok:false}; }
  toJSON(){ return {tools:[...this.tools],weapon:this.weapon,selected:this.selected} }
  fromJSON(data={}){ this.tools=Array.isArray(data.tools)?data.tools.filter(id=>ItemDB.lookup(id)):[]; this.weapon=ItemDB.lookup(data.weapon)?data.weapon:null; this.selected=ItemDB.lookup(data.selected)?data.selected:null; }
}
