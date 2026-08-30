import { RecipeDB } from '../data/recipes.js';
import { inventory } from '../inventory/inventory.js';
function hasUnlock(requirement,context={}){
  if(!requirement) return true;
  if(requirement.type==='level') return (context.level||0)>=Number(requirement.id);
  if(requirement.type==='quest') return context.completedQuests?.includes(requirement.id);
  if(requirement.type==='discovery') return context.discoveries?.includes(requirement.id);
  if(requirement.type==='technology') return context.technologies?.includes(requirement.id);
  if(requirement.type==='reputation'){ const [region,level]=requirement.id.split(':'); return (context.reputation?.[region]||0)>=Number(level||1); }
  return false;
}
export function canCraft(recipeId, station='hand', playerLevel=0,context={}){
  const r=RecipeDB.lookup(recipeId); if(!r) return {ok:false,reason:'receita inexistente'};
  if(r.stationRequired!==station) return {ok:false,reason:`precisa de ${r.stationRequired}`};
  if(playerLevel < r.levelRequired) return {ok:false,reason:`precisa nível ${r.levelRequired}`};
  if(!hasUnlock(r.unlockRequirement,{...context,level:playerLevel})) return {ok:false,reason:`receita bloqueada: ${r.unlockRequirement.type}`};
  for(const ing of r.ingredients){ if(!inventory.has(ing.item, ing.amount)) return {ok:false,reason:`falta ${ing.item}`}; }
  return {ok:true,recipe:r};
}
export function craft(recipeId, station='hand', playerLevel=0,context={}){
  const chk=canCraft(recipeId, station, playerLevel,context);
  if(!chk.ok) return chk;
  const r=chk.recipe;
  // Validate output weight before touching ingredients. This keeps the transaction
  // all-or-nothing when a backpack is full.
  const removedWeight = r.ingredients.reduce((total, ing) => {
    const item = inventory.item(ing.item);
    return total + (item ? item.weight * ing.amount : 0);
  }, 0);
  const result = inventory.item(r.output);
  if (!result || inventory.weight() - removedWeight + result.weight * r.outputQuantity > inventory.maxWeight) {
    return {ok:false, reason:'inventário cheio'};
  }
  for(const ing of r.ingredients){ inventory.remove(ing.item, ing.amount); }
  inventory.add(r.output, r.outputQuantity);
  return {ok:true,recipe:r};
}
