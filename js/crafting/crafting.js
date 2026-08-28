import { RecipeDB } from '../data/recipes.js';
import { inventory } from '../inventory/inventory.js';
export function canCraft(recipeId, station='hand', playerLevel=0){
  const r=RecipeDB.lookup(recipeId); if(!r) return {ok:false,reason:'receita inexistente'};
  if(r.stationRequired!==station) return {ok:false,reason:`precisa de ${r.stationRequired}`};
  if(playerLevel < r.levelRequired) return {ok:false,reason:`precisa nível ${r.levelRequired}`};
  for(const ing of r.ingredients){ if(!inventory.has(ing.item, ing.amount)) return {ok:false,reason:`falta ${ing.item}`}; }
  return {ok:true,recipe:r};
}
export function craft(recipeId, station='hand', playerLevel=0){
  const chk=canCraft(recipeId, station, playerLevel);
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
