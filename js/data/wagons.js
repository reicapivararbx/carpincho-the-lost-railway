export const WAGONS = [
  {id:'cargo',name:'Vagão de Carga',type:'cargo',weight:420,capacity:100,effects:{cargo:100},color:0x765133},
  {id:'workshop',name:'Oficina',type:'workshop',weight:520,capacity:30,effects:{repairEfficiency:.35},color:0x59636e},
  {id:'dormitory',name:'Dormitório',type:'dormitory',weight:380,capacity:20,effects:{checkpoint:true},color:0x684c72},
  {id:'greenhouse',name:'Estufa',type:'greenhouse',weight:450,capacity:35,effects:{foodPerMinute:1},color:0x39754b},
  {id:'laboratory',name:'Laboratório',type:'laboratory',weight:560,capacity:20,effects:{research:1},color:0x436a88},
  {id:'generator',name:'Gerador',type:'generator',weight:610,capacity:10,effects:{energy:100},color:0xb07a28},
  {id:'defensive',name:'Defensivo',type:'defensive',weight:680,capacity:10,effects:{armor:25,turret:true},color:0x703c35},
];

export const WagonDB={lookup(type){return WAGONS.find(w=>w.type===type)||null},all(){return WAGONS}};
