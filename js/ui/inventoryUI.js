import { inventory } from '../inventory/inventory.js';
import { ItemDB } from '../data/items.js';
import { RecipeDB } from '../data/recipes.js';
import { craft, canCraft } from '../crafting/crafting.js';
import { removeHotbarItem } from './hotbar.js';
export function renderInventory(){
  const grid=document.getElementById('inv-grid'); if(!grid) return;
  grid.innerHTML='';
  grid.ondragover=event=>event.preventDefault();grid.ondrop=event=>{event.preventDefault();const slot=Number(event.dataTransfer?.getData('application/x-carpincho-slot'));if(Number.isInteger(slot))removeHotbarItem(slot)};
  for(const [id,count] of inventory.items){
    const it=ItemDB.lookup(id); if(!it) continue;
    const d=document.createElement('div'); d.className='slot';
    d.draggable=true; d.dataset.itemId=id;
    d.innerHTML=`<span>${it.icon}</span><small>${it.name} x${count}</small>`;
    const durability=inventory.durability(id);
    if(durability!==null){ const meter=document.createElement('i'); meter.className='durability'; meter.style.setProperty('--durability',`${durability/it.durability*100}%`); meter.title=`Durabilidade ${durability}/${it.durability}`; d.appendChild(meter); }
    d.addEventListener('dragstart',event=>event.dataTransfer?.setData('application/x-carpincho-item',id));
    d.addEventListener('dblclick',()=>window.carpinchoGame?.useItem(id));
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
        if(result.ok){ window.carpinchoGame?.advanceObjective('craft',result.recipe.output,result.recipe.outputQuantity||1); renderInventory(); }
      };
      quick.appendChild(button);
    }
  }
}
