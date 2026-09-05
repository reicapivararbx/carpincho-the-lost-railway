import { inventory } from '../inventory/inventory.js';
import { ItemDB } from '../data/items.js';

const DEFAULT_SLOTS=['sword_iron','pick_wood','axe_wood','pistol_basic','bread','wood','stone','scrap',null];
const MIME_ITEM='application/x-carpincho-item';
const MIME_SLOT='application/x-carpincho-slot';

export const hotbar={slots:[...DEFAULT_SLOTS],selected:0};

/** Parse hotbar source slot from DnD payload. Empty MIME must NOT become 0. */
export function parseHotbarSlotMime(raw){
  if(typeof raw!=='string' || raw==='') return null;
  const n=Number(raw);
  if(!Number.isInteger(n) || n<0 || n>=hotbar.slots.length) return null;
  return n;
}

export function applyHotbarDrop(targetIndex,{fromSlot=null,itemId=null}={}){
  if(!Number.isInteger(targetIndex) || targetIndex<0 || targetIndex>=hotbar.slots.length) return false;
  if(fromSlot!==null && fromSlot!==undefined) return moveHotbarItem(fromSlot,targetIndex);
  if(itemId==='' || itemId===undefined) return false;
  return assignHotbarItem(targetIndex,itemId);
}

export function renderHotbar(){
  if(typeof document==='undefined') return;
  const root=document.getElementById('hotbar'); if(!root) return;
  root.innerHTML='';
  hotbar.slots.forEach((id,index)=>{
    const el=document.createElement('button'); el.type='button'; el.className='hotbar-slot'+(index===hotbar.selected?' selected':'');
    el.draggable=Boolean(id); el.dataset.itemId=id||'';
    el.dataset.slot=String(index); el.title=id?(ItemDB.lookup(id)?.name||id):'Vazio — solte um item do inventário';
    const item=id&&ItemDB.lookup(id); const count=id?inventory.count(id):0;
    el.innerHTML=`<b>${index+1}</b><span>${item?.icon||''}</span><small>${count>0?count:''}</small>`;
    el.addEventListener('click',()=>selectHotbar(index));
    el.addEventListener('dragstart',event=>{
      if(!id || !event.dataTransfer) return;
      event.dataTransfer.effectAllowed='move';
      event.dataTransfer.setData(MIME_ITEM,id);
      event.dataTransfer.setData(MIME_SLOT,String(index));
    });
    el.addEventListener('dragenter',event=>{ event.preventDefault(); el.classList.add('drag-over'); });
    el.addEventListener('dragleave',()=>el.classList.remove('drag-over'));
    el.addEventListener('dragover',event=>{
      event.preventDefault();
      el.classList.add('drag-over');
      if(event.dataTransfer) event.dataTransfer.dropEffect='move';
    });
    el.addEventListener('drop',event=>{
      event.preventDefault();
      event.stopPropagation();
      el.classList.remove('drag-over');
      const fromSlot=parseHotbarSlotMime(event.dataTransfer?.getData(MIME_SLOT)??'');
      const itemId=event.dataTransfer?.getData(MIME_ITEM) || null;
      applyHotbarDrop(index,{fromSlot,itemId});
    });
    root.appendChild(el);
  });
}

export function selectHotbar(index){
  if(index<0||index>=hotbar.slots.length) return;
  hotbar.selected=index; renderHotbar();
  const id=hotbar.slots[index];
  if(id==='sword_iron') window.carpinchoGame?.equipWeapon('sword');
  if(id==='pistol_basic') window.carpinchoGame?.equipWeapon('pistol');
  if(id && !['sword_iron','pistol_basic'].includes(id)) window.carpinchoGame?.equipTool(id);
}

export function selectedItem(){ return hotbar.slots[hotbar.selected]; }

export function assignHotbarItem(index,id){
  if(index<0||index>=hotbar.slots.length) return false;
  if(id!==null){
    if(typeof id!=='string' || !ItemDB.lookup(id) || !inventory.has(id)) return false;
  }
  hotbar.slots[index]=id; renderHotbar(); return true;
}

export function moveHotbarItem(from,to){
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=hotbar.slots.length||to>=hotbar.slots.length) return false;
  [hotbar.slots[from],hotbar.slots[to]]=[hotbar.slots[to],hotbar.slots[from]]; hotbar.selected=to; renderHotbar(); return true;
}

export function removeHotbarItem(index){ return assignHotbarItem(index,null); }

export function validateHotbar(slots){
  const input=Array.isArray(slots)?slots:DEFAULT_SLOTS;
  return Array.from({length:9},(_,i)=>{
    const id=input[i]; return id===null?null:(typeof id==='string'&&ItemDB.lookup(id)&&inventory.has(id)?id:null);
  });
}

export function hotbarFromJSON(slots){ hotbar.slots=validateHotbar(slots); hotbar.selected=Math.min(hotbar.selected,8); renderHotbar(); }
export function hotbarToJSON(){ return [...hotbar.slots]; }
