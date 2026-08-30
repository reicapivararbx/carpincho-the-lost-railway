export const NPCS=[
  {id:'mechanic','name':'Mecânico Nilo',region:'plain',position:{x:5,z:10},shop:'parts',reputation:'railway',routine:[{from:6,to:18,activity:'workshop'},{from:18,to:22,activity:'station'},{from:22,to:6,activity:'sleep'}],dialogue:'mechanic_intro'},
  {id:'herbalist',name:'Iara das Folhas',region:'forest',position:{x:31,z:-4},shop:'herbs',reputation:'forest',routine:[{from:5,to:17,activity:'forage'},{from:17,to:21,activity:'camp'}],dialogue:'herbalist_intro'},
  {id:'engineer',name:'Engenheira Ada',region:'city',position:{x:124,z:8},shop:'engineering',reputation:'city',routine:[{from:7,to:20,activity:'laboratory'}],dialogue:'engineer_intro'},
];
export function npcActivity(npc,hour){return npc.routine.find(entry=>entry.from<=entry.to?(hour>=entry.from&&hour<entry.to):(hour>=entry.from||hour<entry.to))?.activity||'idle'}
