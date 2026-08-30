import { ItemDB } from '../data/items.js';
export class Inventory{
  constructor(maxWeight=100){
    this.items = new Map();
    this.instances = new Map();
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
    if((it.category==='tool'||it.category==='weapon') && it.durability){
      const list=this.instances.get(id)||[];
      for(let i=0;i<amount;i++) list.push({durability:it.durability,maxDurability:it.durability});
      this.instances.set(id,list);
    }
    this._emit(); return true;
  }
  remove(id,amount=1){
    const cur=this.count(id); if(cur<amount) return false;
    if(cur===amount) this.items.delete(id); else this.items.set(id, cur-amount);
    if(this.instances.has(id)){
      const list=this.instances.get(id); list.splice(0,amount);
      if(list.length) this.instances.set(id,list); else this.instances.delete(id);
    }
    this._emit(); return true;
  }
  has(id,amount=1){ return this.count(id)>=amount }
  durability(id){ return this.instances.get(id)?.[0]?.durability ?? null }
  damageDurability(id,amount=1){
    const instance=this.instances.get(id)?.[0]; if(!instance) return {ok:false,broken:false,durability:null};
    instance.durability=Math.max(0,instance.durability-Math.max(0,Number(amount)||0));
    const broken=instance.durability===0;
    if(broken) this.remove(id,1); else this._emit();
    return {ok:true,broken,durability:instance.durability,maxDurability:instance.maxDurability};
  }
  toJSON(){ return {items:[...this.items],instances:[...this.instances].map(([id,list])=>[id,list.map(instance=>({...instance}))]),maxWeight:this.maxWeight} }
  fromJSON(d={}){
    this.items=new Map(Array.isArray(d.items)?d.items:[]);
    this.instances=new Map(Array.isArray(d.instances)?d.instances:[]);
    this.maxWeight=Number.isFinite(d.maxWeight)&&d.maxWeight>0?d.maxWeight:100;
    for(const [id,count] of this.items){
      const item=ItemDB.lookup(id);
      if(!item || !Number.isFinite(count) || count<=0){ this.items.delete(id); continue; }
      if((item.category==='tool'||item.category==='weapon')&&item.durability&&!this.instances.has(id)){
        this.instances.set(id,Array.from({length:count},()=>({durability:item.durability,maxDurability:item.durability})));
      }
    }
    this._emit();
  }
}
export const inventory = new Inventory();
