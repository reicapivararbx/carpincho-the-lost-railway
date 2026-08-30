import { ItemDB } from '../data/items.js';

export function consumeItem(inventory,id,player){
  const item=ItemDB.lookup(id);
  if(!item?.consume || !inventory.has(id)) return {ok:false,reason:'item não consumível'};
  if(item.consume.health && player.health.current>=player.health.max) return {ok:false,reason:'vida já está cheia'};
  if(item.consume.stamina && player.stamina.current>=player.stamina.max) return {ok:false,reason:'stamina já está cheia'};
  inventory.remove(id,1);
  if(item.consume.health) player.health.heal(item.consume.health);
  if(item.consume.stamina) player.stamina.current=Math.min(player.stamina.max,player.stamina.current+item.consume.stamina);
  return {ok:true,effects:{...item.consume}};
}
