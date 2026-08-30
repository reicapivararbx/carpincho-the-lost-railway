const objective=(id,description,type,target,amount=1)=>({id,description,type,target,amount,progress:0,done:false});
const quest=(id,name,type,region,objectives,nextQuest=null,rewards={xp:150,coins:50})=>({id,name,type,region,requirements:[],objectives,rewards,nextQuest});

export const QUESTS=[
  quest('first_departure','ATO I — PRIMEIRA PARTIDA','MAIN','plain',[objective('inspect','Inspecionar a locomotiva','interact','train'),objective('fuel','Abastecer com 3 carvões','collect','coal',3),objective('enter','Entrar na cabine','interact','enter'),objective('depart','Partir rumo à floresta','travel','depart')],'first_combat',{xp:150,coins:50,recipes:['crafting_table']}),
  quest('first_combat','Primeiro Combate','HUNT','plain',[objective('kill3','Derrote 3 inimigos','kill','any',3)],'forest_threat',{xp:100,coins:80,items:[{id:'bread',amount:2}]}),
  quest('forest_threat','Ameaça da Floresta','HUNT','forest',[objective('kill10','Derrote 10 criaturas','kill','any',10)],'guardian_forest',{xp:300,coins:150,items:[{id:'iron_ingot',amount:5}]}),
  quest('guardian_forest','O Guardião','BOSS','forest',[objective('find','Encontre a ruína','travel','ruin'),objective('defeat','Derrote o Guardião','kill','forest_guardian'),objective('return','Volte à estação','return','plain_station')],'act_2_mountains',{xp:2000,coins:1500,items:[{id:'train_core',amount:1}],recipes:['furnace']}),
  quest('act_2_mountains','ATO II — Ecos da Montanha','MAIN','mountain',[objective('travel','Alcance as montanhas','travel','mountain'),objective('repair','Repare o elevador ferroviário','craft','rail_lift'),objective('boss','Derrote o Titã','kill','mountain_titan')],'act_3_city',{xp:2400,coins:1800,recipes:['engineering_table']}),
  quest('act_3_city','ATO III — Cidade sem Maquinista','MAIN','city',[objective('deliver','Entregue a carga médica','delivery','city_medicine',4),objective('boss','Desative o Supervisor','kill','city_overseer')],'act_4_desert',{xp:2800,coins:2200}),
  quest('act_4_desert','ATO IV — Trilhos de Areia','MAIN','desert',[objective('explore','Localize o observatório','exploration','observatory'),objective('boss','Derrote a Imperatriz','kill','desert_empress')],'act_5_snow',{xp:3300,coins:2600}),
  quest('act_5_snow','ATO V — O Silêncio Branco','MAIN','snow',[objective('recover','Recupere os registros','recovery','frozen_records',3),objective('boss','Derrote o Colosso','kill','frost_colossus')],'act_6_volcano',{xp:3900,coins:3100}),
  quest('act_6_volcano','ATO VI — Coração em Chamas','MAIN','volcano',[objective('defend','Defenda o gerador','defense','volcano_generator',3),objective('boss','Apague o Coração','kill','volcano_heart')],'act_7_zero',{xp:4600,coins:3700}),
  quest('act_7_zero','ATO VII — A Linha Perdida','MAIN','zero',[objective('clues','Reúna pistas do Condutor','discovery','zero_clue',5),objective('arrive','Entre na Estação Zero','travel','zero')],'act_8_finale',{xp:5400,coins:4500}),
  quest('act_8_finale','ATO VIII — Última Partida','MAIN','zero',[objective('boss','Derrote o Condutor Zero','kill','zero_conductor'),objective('choice','Decida o destino da ferrovia','choice','railway_fate')],null,{xp:8000,coins:8000}),
  quest('side_delivery','Correspondência Atrasada','DELIVERY','plain',[objective('cargo','Leve a correspondência','delivery','forest_mail',2)],null,{xp:120,coins:90}),
  quest('side_escort','Último Passageiro','ESCORT','city',[objective('escort','Escolte o engenheiro','escort','engineer')],null,{xp:220,coins:160}),
  quest('side_defense','Noite na Estação','DEFENSE','forest',[objective('waves','Defenda a estação','defense','forest_station',3)],null,{xp:260,coins:180}),
  quest('side_recovery','Peças no Abismo','RECOVERY','mountain',[objective('parts','Recupere peças','recovery','brake_part',4)],null,{xp:280,coins:200}),
  quest('side_hunt','Alfa da Alcateia','HUNT','forest',[objective('alpha','Cace um predador alfa','kill','predator:alpha')],null,{xp:300,coins:220}),
  quest('side_exploration','Cartógrafo Errante','EXPLORATION','desert',[objective('places','Mapeie ruínas','exploration','desert_ruin',3)],null,{xp:260,coins:240}),
  quest('side_mystery','O Sinal na Neblina','MYSTERY','snow',[objective('signal','Decifre o sinal','discovery','radio_signal',3)],null,{xp:400,coins:300}),
];
QUESTS.forEach((q,index)=>{if(index>0&&q.type==='MAIN')q.requirements=[{quest:QUESTS[index-1]?.id}];});
export const QuestDB={lookup(id){return QUESTS.find(q=>q.id===id)||null},all(){return QUESTS}};
