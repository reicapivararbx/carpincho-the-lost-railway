import { inventory } from '../inventory/inventory.js';
import { ItemDB } from '../data/items.js';
import { RecipeDB } from '../data/recipes.js';
import { craft, canCraft } from '../crafting/crafting.js';
export function renderInventory(){
  const grid=document.getElementById('inv-grid'); if(!grid) return;
  grid.innerHTML='';
  for(const [id,count] of inventory.items){
    const it=ItemDB.lookup(id); if(!it) continue;
    const d=document.createElement('div'); d.className='slot';
    d.innerHTML=`<span>${it.icon}</span><small>${it.name} x${count}</small>`;
    grid.appendChild(d);
  }
  const w=document.getElementById('inv-weight'); if(w) w.textContent=inventory.weight().toFixed(1)+'/'+inventory.maxWeight+' KG';
  const quick=document.getElementById('quick-recipes');
  if(quick){
    quick.innerHTML='';
    for(const recipe of RecipeDB.byStation('hand')){
      const button=document.createElement('button');
      const check=canCraft(recipe.id, 'hand', window.carpinchoGame?.player.level||1);
      button.className='btn small'; button.disabled=!check.ok;
      button.textContent=`${recipe.name} (${recipe.ingredients.map(i=>`${i.item} x${i.amount}`).join(', ')})`;
      button.onclick=()=>{
        const result=craft(recipe.id, 'hand', window.carpinchoGame?.player.level||1);
        if(result.ok) renderInventory();
      };
      quick.appendChild(button);
    }
  }
}
