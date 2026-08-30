export const TRAIN_SYSTEMS=Object.freeze(['engine','tank','hull','electrical','brakes']);
export class TrainDamage{
  constructor(train){ this.train=train }
  damage(system,amount){
    if(!TRAIN_SYSTEMS.includes(system)) return {ok:false,reason:'sistema inválido'};
    const parts=this.train.locomotive?.damage||this.train.damage;
    parts[system]=Math.max(0,parts[system]-(Number(amount)||0)); return {ok:true,system,value:parts[system]};
  }
  repair(system,amount,materials,inventory){
    if(!TRAIN_SYSTEMS.includes(system)) return {ok:false,reason:'sistema inválido'};
    for(const [id,count] of Object.entries(materials||{})) if(!inventory.has(id,count)) return {ok:false,reason:`falta ${id}`};
    Object.entries(materials||{}).forEach(([id,count])=>inventory.remove(id,count));
    const parts=this.train.locomotive?.damage||this.train.damage; parts[system]=Math.min(100,parts[system]+Math.max(0,Number(amount)||0));
    return {ok:true,system,value:parts[system]};
  }
}
