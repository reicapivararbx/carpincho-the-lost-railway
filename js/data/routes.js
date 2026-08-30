export const ROUTES=Object.freeze([
  {id:'main',name:'Linha Principal',risk:1,cost:1,length:520,features:['curves','bridge','tunnel','slope_up','slope_down'],destinations:['plain','forest','mountain','city','zero']},
  {id:'canyon',name:'Desvio do Cânion',risk:3,cost:1.35,length:410,features:['junction','bridge','slope_up'],destinations:['desert','volcano']},
  {id:'frozen',name:'Ramal Congelado',risk:2,cost:1.2,length:460,features:['junction','tunnel','slope_down'],destinations:['snow','zero']},
]);
export const RouteDB={lookup(id){return ROUTES.find(route=>route.id===id)||null},all(){return ROUTES}};
