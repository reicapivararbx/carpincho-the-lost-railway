import { inventory } from '../inventory/inventory.js';
import { ItemDB } from '../data/items.js';
import { RecipeDB } from '../data/recipes.js';
import { craft, canCraft } from '../crafting/crafting.js';
import { parseHotbarSlotMime, removeHotbarItem } from './hotbar.js';

const MIME_ITEM='application/x-carpincho-item';
const MIME_SLOT='application/x-carpincho-slot';

export function renderInventory(){
  const grid=document.getElementById('inv-grid'); if(!grid) return;
  grid.innerHTML='';
  grid.ondragover=event=>{
    event.preventDefault();
    if(event.dataTransfer) event.dataTransfer.dropEffect='move';
  };
  grid.ondrop=event=>{
    event.preventDefault();
    const fromSlot=parseHotbarSlotMime(event.dataTransfer?.getData(MIME_SLOT)??'');
    if(fromSlot!==null) removeHotbarItem(fromSlot);
  };
  for(const [id,count] of inventory.items){
    const it=ItemDB.lookup(id); if(!it) continue;
    const d=document.createElement('div'); d.className='slot';
    d.draggable=true; d.dataset.itemId=id;
    d.title=`Arraste para a hotbar · duplo clique usa`;
    d.innerHTML=`<span>${it.icon}</span><small>${it.name} x${count}</small>`;
    const durability=inventory.durability(id);
    if(durability!==null){
      const meter=document.createElement('i');
      meter.className='durability';
      meter.style.setProperty('--durability',`${durability/it.durability*100}%`);
      meter.title=`Durabilidade ${durability}/${it.durability}`;
      d.appendChild(meter);
    }
    d.addEventListener('dragstart',event=>{
      if(!event.dataTransfer) return;
      d.classList.add('dragging');
      event.dataTransfer.effectAllowed='copyMove';
      // Only item MIME — never set slot MIME (empty string becomes Number 0).
      event.dataTransfer.setData(MIME_ITEM,id);
      event.dataTransfer.setData('text/plain',id);
    });
    d.addEventListener('dragend',()=>d.classList.remove('dragging'));
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
