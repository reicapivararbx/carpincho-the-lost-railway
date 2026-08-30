import { RecipeDB } from '../data/recipes.js';
import { canCraft } from '../crafting/crafting.js';
export function renderRecipes(station='hand', level=1){
  const c=document.getElementById('recipe-list'); if(!c) return;
  c.innerHTML='';
  for(const r of RecipeDB.byStation(station)){
    const d=document.createElement('div'); d.className='recipe';
    const check=canCraft(r.id, station, level,window.carpinchoGame?.craftingContext?.()||{});
    d.textContent=r.name+' ('+r.ingredients.map(i=>i.item+' x'+i.amount).join(', ')+')'+(check.ok?'':' — '+check.reason);
    d.classList.toggle('locked', !check.ok);
    d.onclick=()=>{
      window._selectedRecipe=r.id; window._selectedStation=station;
      const t=document.getElementById('crafting-title'); if(t) t.textContent=r.name;
      const out=document.getElementById('craft-output'); if(out) out.textContent=r.output;
      document.getElementById('btn-craft').disabled=!check.ok;
    };
    c.appendChild(d);
  }
}
