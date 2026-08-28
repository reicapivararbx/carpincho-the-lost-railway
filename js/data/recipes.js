export const RECIPES = [
  {id:'crafting_table',name:'Mesa de Crafting',category:'stations',ingredients:[{item:'wood',amount:8}],stationRequired:'hand',levelRequired:0,output:'crafting_table',outputQuantity:1},
  {id:'furnace',name:'Fornalha',category:'stations',ingredients:[{item:'stone',amount:8}],stationRequired:'hand',levelRequired:0,output:'furnace',outputQuantity:1},
  {id:'axe_wood',name:'Machado de Madeira',category:'tools',ingredients:[{item:'wood',amount:3},{item:'stone',amount:2}],stationRequired:'crafting_table',levelRequired:0,output:'axe_wood',outputQuantity:1},
  {id:'pick_wood',name:'Picareta de Madeira',category:'tools',ingredients:[{item:'wood',amount:3},{item:'stone',amount:2}],stationRequired:'crafting_table',levelRequired:0,output:'pick_wood',outputQuantity:1},
  {id:'axe_stone',name:'Machado de Pedra',category:'tools',ingredients:[{item:'wood',amount:2},{item:'stone',amount:3}],stationRequired:'crafting_table',levelRequired:2,output:'axe_stone',outputQuantity:1},
  {id:'pick_stone',name:'Picareta de Pedra',category:'tools',ingredients:[{item:'wood',amount:2},{item:'stone',amount:3}],stationRequired:'crafting_table',levelRequired:2,output:'pick_stone',outputQuantity:1},
  {id:'axe_iron',name:'Machado de Ferro',category:'tools',ingredients:[{item:'iron_ingot',amount:3},{item:'wood',amount:2}],stationRequired:'crafting_table',levelRequired:5,output:'axe_iron',outputQuantity:1},
  {id:'pick_iron',name:'Picareta de Ferro',category:'tools',ingredients:[{item:'iron_ingot',amount:3},{item:'wood',amount:2}],stationRequired:'crafting_table',levelRequired:5,output:'pick_iron',outputQuantity:1},
  {id:'iron_ingot',name:'Lingote de Ferro',category:'materials',ingredients:[{item:'iron_ore',amount:1},{item:'coal',amount:1}],stationRequired:'furnace',levelRequired:0,output:'iron_ingot',outputQuantity:1},
  {id:'sword_iron',name:'Espada de Ferro',category:'weapons',ingredients:[{item:'iron_ingot',amount:2},{item:'wood',amount:1}],stationRequired:'crafting_table',levelRequired:3,output:'sword_iron',outputQuantity:1},
  {id:'pistol_basic',name:'Pistola Básica',category:'weapons',ingredients:[{item:'iron_ingot',amount:4},{item:'scrap',amount:6}],stationRequired:'crafting_table',levelRequired:5,output:'pistol_basic',outputQuantity:1},
  {id:'ammo_pistol',name:'Munição Pistola x12',category:'weapons',ingredients:[{item:'iron_ingot',amount:1},{item:'coal',amount:2}],stationRequired:'crafting_table',levelRequired:5,output:'ammo_pistol',outputQuantity:12},
  {id:'chest',name:'Baú',category:'stations',ingredients:[{item:'wood',amount:8}],stationRequired:'crafting_table',levelRequired:1,output:'chest',outputQuantity:1},
  {id:'copper_ingot',name:'Lingote de Cobre',category:'materials',ingredients:[{item:'copper_ore',amount:1},{item:'coal',amount:1}],stationRequired:'furnace',levelRequired:3,output:'copper_ingot',outputQuantity:1},
];
export const RecipeDB = {
  lookup(id){ return RECIPES.find(r=>r.id===id)||null },
  byStation(station){ return RECIPES.filter(r=>r.stationRequired===station) },
  all(){ return RECIPES },
};
