const BUILDABLE=new Set(['crafting_table','furnace','chest','workshop','engineering_table','laboratory']);

export class ConstructionManager{
  constructor(inventory=null){ this.inventory=inventory; this.placed=[]; }
  place(type,position,rotation=0,{consume=true,id}={}){
    if(!BUILDABLE.has(type)) return {ok:false,reason:'estrutura inválida'};
    if(!position||![position.x,position.z].every(Number.isFinite)) return {ok:false,reason:'posição inválida'};
    if(this.placed.some(entry=>Math.hypot(entry.x-position.x,entry.z-position.z)<1.5)) return {ok:false,reason:'área ocupada'};
    if(consume && (!this.inventory||!this.inventory.remove(type,1))) return {ok:false,reason:`falta ${type}`};
    const structure={id:id||`build-${Date.now().toString(36)}-${this.placed.length}`,type,x:position.x,y:position.y||0,z:position.z,rotation,contents:[]};
    this.placed.push(structure); return {ok:true,structure};
  }
  remove(id,{refund=true}={}){
    const index=this.placed.findIndex(item=>item.id===id); if(index<0)return {ok:false,reason:'estrutura inexistente'};
    const [structure]=this.placed.splice(index,1);
    if(refund&&this.inventory){ try{this.inventory.add(structure.type,1)}catch{ this.placed.splice(index,0,structure); return {ok:false,reason:'inventário cheio'}; } }
    return {ok:true,structure};
  }
  toJSON(){ return this.placed.map(item=>({...item,contents:[...(item.contents||[])]})); }
  fromJSON(data){ this.placed=Array.isArray(data)?data.filter(item=>BUILDABLE.has(item.type)&&Number.isFinite(item.x)&&Number.isFinite(item.z)).map(item=>({...item,contents:Array.isArray(item.contents)?item.contents:[]})):[]; }
}

export function isBuildable(type){ return BUILDABLE.has(type); }
