import { ItemDB } from '../data/items.js';
export function migrate(data,from='0.1.0',to='1.0.0'){
  const next={...(data||{})};
  if(!next.player) next.player={level:1,xp:0,coins:100,pos:{x:0,y:.9,z:0}};
  if(!next.inventory) next.inventory={};
  if(!Array.isArray(next.hotbar)) next.hotbar=null;
  else next.hotbar=Array.from({length:9},(_,index)=>{const id=next.hotbar[index];return id===null?null:(ItemDB.lookup(id)?id:null)});
  if(!Array.isArray(next.quests)) next.quests=null;
  if(!next.world) next.world={};
  if(!next.profile) next.profile={};
  next.version=to;
  return next;
}
