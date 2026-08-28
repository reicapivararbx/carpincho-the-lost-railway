import { ItemDB } from '../data/items.js';
export class Inventory{
  constructor(maxWeight=100){
    this.items = new Map();
    this.maxWeight = maxWeight;
    this._listeners=[];
  }
  onChange(fn){ this._listeners.push(fn) }
  _emit(){ this._listeners.forEach(f=>f(this)) }
  count(id){ return this.items.get(id)||0 }
  item(id){ return ItemDB.lookup(id) }
  weight(){
    let w=0; for(const [id,c] of this.items){ const it=ItemDB.lookup(id); if(it) w+=it.weight*c; } return w;
  }
  canAdd(id,amount=1){
    const it=ItemDB.lookup(id); if(!it) return false;
    const w = this.weight() + it.weight*amount;
    return w <= this.maxWeight;
  }
  add(id,amount=1){
    const it=ItemDB.lookup(id); if(!it) throw new Error('item not found '+id);
    if(!this.canAdd(id,amount)) throw new Error('inventário cheio');
    // stack check
    const cur=this.count(id);
    // single stack limit enforced but MVP ignores multi-stack; just allow via maxWeight
    this.items.set(id, cur+amount);
    this._emit(); return true;
  }
  remove(id,amount=1){
    const cur=this.count(id); if(cur<amount) return false;
    if(cur===amount) this.items.delete(id); else this.items.set(id, cur-amount);
    this._emit(); return true;
  }
  has(id,amount=1){ return this.count(id)>=amount }
  toJSON(){ return {items:[...this.items],maxWeight:this.maxWeight} }
  fromJSON(d){ this.items=new Map(d.items||[]); this.maxWeight=d.maxWeight||100; this._emit(); }
}
export const inventory = new Inventory();
