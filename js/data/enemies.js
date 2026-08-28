export const ENEMIES = [
  {id:'slime',name:'Gosma da Planície',hp:30,damage:8,defense:1,speed:2.2,aggroRange:12,xp:12,loot:'slime_loot',region:'plain',level:1,ai:'fast'},
  {id:'boar',name:'Javali Selvagem',hp:50,damage:15,defense:3,speed:1.6,aggroRange:14,xp:20,loot:'boar_loot',region:'plain',level:2,ai:'heavy'},
  {id:'spore',name:'Esporos Venenosos',hp:25,damage:12,defense:0,speed:1.8,aggroRange:16,xp:15,loot:'spore_loot',region:'forest',level:3,ai:'ranged'},
  {id:'wolf',name:'Lobo da Floresta',hp:60,damage:18,defense:2,speed:3,aggroRange:18,xp:30,loot:'wolf_loot',region:'forest',level:4,ai:'tracker'},
  {id:'elite_boar',name:'Javali Alfa',hp:120,damage:25,defense:5,speed:2,xp:80,loot:'elite_loot',region:'forest',level:6,ai:'heavy',elite:true},
];
export const BOSSES = [
  {
    id:'forest_guardian',name:'Guardião da Floresta',hp:600,damage:30,defense:8,speed:2.2,xp:500,loot:'guardian_loot',region:'forest',level:8,
    phases:[
      {hpThreshold:70,attacks:['slam','charge'],intro:'Fase 1 — Golpes físicos'},
      {hpThreshold:35,attacks:['slam','charge','summon'],intro:'Fase 2 — Invoca criaturas'},
      {hpThreshold:0,attacks:['slam','charge','summon','rage'],intro:'Fase 3 — Fúria'},
    ],
    attacks:[
      {id:'slam',name:'Esmagamento',damage:30,range:4,cooldown:3},
      {id:'charge',name:'Investida',damage:35,range:12,cooldown:6},
      {id:'summon',name:'Invocar',damage:0,range:0,cooldown:10},
      {id:'rage',name:'Fúria',damage:40,range:6,cooldown:8},
    ],
    arena:{center:{x:40,z:0},radius:22},
    quest:'guardian_forest',cutscene:{entry:'guardian_entry',victory:'guardian_victory'}
  }
];
