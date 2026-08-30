export const TRAVEL_EVENTS=[
  {id:'broken_axle',title:'Eixo superaquecido',choices:{repair:{cost:{scrap:2},result:'train_repaired'},detour:{fuel:8,result:'route_detour'},explore:{risk:.35,result:'rare_loot'},stop:{time:2,result:'safe'}}},
  {id:'collapsed_tunnel',title:'Túnel desabado',choices:{repair:{cost:{stone:4},result:'tunnel_open'},detour:{fuel:12,result:'route_detour'},explore:{risk:.5,result:'cave_discovered'},stop:{time:3,result:'safe'}}},
  {id:'distress_signal',title:'Sinal de socorro',choices:{repair:{cost:{scrap:1},result:'traveler_saved'},detour:{fuel:5,result:'ignored'},explore:{risk:.25,result:'mystery_clue'},stop:{time:1,result:'ambush'}}},
];
export class TravelEventManager{
  constructor(random=Math.random){this.random=random;this.active=null;this.history=[]}
  roll(chance=.12){if(this.active||this.random()>chance)return null;this.active=TRAVEL_EVENTS[Math.floor(this.random()*TRAVEL_EVENTS.length)];return this.active}
  choose(choice,{inventory,train}={}){const option=this.active?.choices?.[choice];if(!option)return {ok:false,reason:'escolha inválida'};for(const [id,count] of Object.entries(option.cost||{}))if(!inventory?.has(id,count))return {ok:false,reason:`falta ${id}`};Object.entries(option.cost||{}).forEach(([id,count])=>inventory.remove(id,count));if(option.fuel&&train){if(train.fuel<option.fuel)return {ok:false,reason:'combustível insuficiente'};train.fuel-=option.fuel}const result={ok:true,event:this.active.id,choice,result:option.result,risk:option.risk||0};this.history.push(result);this.active=null;return result}
}
