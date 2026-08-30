export const RESOURCE_TYPES = Object.freeze({
  tree:{tool:'axe',tier:0,hp:3,drops:[{item:'wood',amount:[2,4],chance:1}]},
  rock:{tool:'pick',tier:0,hp:3,drops:[{item:'stone',amount:[1,3],chance:1}]},
  coal:{tool:'pick',tier:0,hp:3,drops:[{item:'coal',amount:[1,3],chance:1},{item:'stone',amount:1,chance:.35}]},
  iron_ore:{tool:'pick',tier:1,hp:4,drops:[{item:'iron_ore',amount:[1,3],chance:1},{item:'stone',amount:1,chance:.45}]},
  copper_ore:{tool:'pick',tier:1,hp:4,drops:[{item:'copper_ore',amount:[1,3],chance:1}]},
  crystal:{tool:'pick',tier:2,hp:5,drops:[{item:'crystal',amount:[1,2],chance:1}]},
  titanium_ore:{tool:'pick',tier:2,hp:6,drops:[{item:'titanium_ore',amount:[1,2],chance:1},{item:'crystal',amount:1,chance:.2}]},
  ember_core:{tool:'pick',tier:3,hp:8,drops:[{item:'ember_core',amount:1,chance:1},{item:'crystal',amount:[1,2],chance:.35}]},
  scrap:{tool:'pick',tier:0,hp:2,drops:[{item:'scrap',amount:[1,2],chance:1}]},
  herbs:{tool:'axe',tier:0,hp:1,drops:[{item:'herbs',amount:[1,2],chance:1}]},
});

export function resourceDefinition(type){ return RESOURCE_TYPES[type]||null; }
