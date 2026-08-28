import { inventory } from '../inventory/inventory.js';
import { ItemDB } from '../data/items.js';

const DEFAULT_SLOTS=['sword_iron','pick_wood','axe_wood','pistol_basic','bread','wood','stone','scrap',null];
export const hotbar={slots:[...DEFAULT_SLOTS],selected:0};

export function renderHotbar(){
  const root=document.getElementById('hotbar'); if(!root) return;
  root.innerHTML='';
  hotbar.slots.forEach((id,index)=>{
    const el=document.createElement('button'); el.type='button'; el.className='hotbar-slot'+(index===hotbar.selected?' selected':'');
    el.dataset.slot=String(index); el.title=id?(ItemDB.lookup(id)?.name||id):'Vazio';
    const item=id&&ItemDB.lookup(id); const count=id?inventory.count(id):0;
    el.innerHTML=`<b>${index+1}</b><span>${item?.icon||''}</span><small>${count>0?count:''}</small>`;
    el.addEventListener('click',()=>selectHotbar(index)); root.appendChild(el);
  });
}
export function selectHotbar(index){
  if(index<0||index>=hotbar.slots.length) return;
  hotbar.selected=index; renderHotbar();
  const id=hotbar.slots[index];
  if(id==='sword_iron') window.carpinchoGame?.equipWeapon('sword');
  if(id==='pistol_basic') window.carpinchoGame?.equipWeapon('pistol');
}
export function selectedItem(){ return hotbar.slots[hotbar.selected]; }
export function hotbarFromJSON(slots){ if(Array.isArray(slots)) hotbar.slots=DEFAULT_SLOTS.map((fallback,i)=>slots[i]===null?null:(slots[i]||fallback)); renderHotbar(); }
export function hotbarToJSON(){ return [...hotbar.slots]; }
