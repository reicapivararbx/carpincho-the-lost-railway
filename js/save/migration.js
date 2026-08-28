export function migrate(data,from='0.1.0',to='0.1.0'){
  const next={...(data||{})};
  if(!next.player) next.player={level:1,xp:0,coins:100,pos:{x:0,y:.9,z:0}};
  if(!next.inventory) next.inventory={};
  if(!Array.isArray(next.hotbar)) next.hotbar=null;
  if(!Array.isArray(next.quests)) next.quests=null;
  return next;
}
