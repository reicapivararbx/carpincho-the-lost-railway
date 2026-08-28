export const QUESTS = [
  {
    id:'first_departure',name:'PRIMEIRA PARTIDA',type:'MAIN',region:'plain',
    requirements:[],
    objectives:[
      {id:'inspect',description:'Inspecionar locomotiva (E perto do trem)',type:'interact',target:'train',amount:1,done:false},
      {id:'fuel',description:'Abastecer (colete 3 carvões → E no trem)',type:'collect',target:'coal',amount:3,done:false},
      {id:'enter',description:'Entrar na cabine (E)',type:'interact',target:'enter',amount:1,done:false},
      {id:'depart',description:'Partir (Q acelerar)',type:'travel',target:'depart',amount:1,done:false},
    ],
    rewards:{xp:150,coins:50,items:[],recipes:['crafting_table']},
    nextQuest:'first_combat'
  },
  {
    id:'first_combat',name:'Primeiro Combate',type:'HUNT',region:'plain',
    requirements:[{quest:'first_departure'}],
    objectives:[{id:'kill3',description:'Derrote 3 inimigos',type:'kill',target:'any',amount:3,done:false}],
    rewards:{xp:100,coins:80,items:[{id:'bread',amount:2}]},
    nextQuest:'forest_threat'
  },
  {
    id:'forest_threat',name:'Ameaça da Floresta',type:'HUNT',region:'forest',
    requirements:[{quest:'first_combat'}],
    objectives:[{id:'kill10',description:'Derrote 10 criaturas',type:'kill',target:'any',amount:10,done:false}],
    rewards:{xp:300,coins:150,items:[{id:'iron_ingot',amount:5}]},
    nextQuest:'guardian_forest'
  },
  {
    id:'guardian_forest',name:'O Guardião',type:'BOSS',region:'forest',
    requirements:[{quest:'forest_threat'}],
    objectives:[
      {id:'find',description:'Encontre a ruína na floresta',type:'travel',target:'ruin',amount:1,done:false},
      {id:'defeat',description:'Derrote o Guardião da Floresta',type:'kill',target:'forest_guardian',amount:1,done:false},
      {id:'return',description:'Volte à estação',type:'travel',target:'station',amount:1,done:false},
    ],
    rewards:{xp:2000,coins:1500,items:[{id:'train_core',amount:1}],recipes:['furnace']},
    nextQuest:null
  }
];
export const QuestDB = {
  lookup(id){ return QUESTS.find(q=>q.id===id)||null },
  all(){ return QUESTS },
};
