const mob=(id,name,region,extra={})=>({id,name,region,hp:50,damage:12,defense:2,speed:2,aggroRange:16,attackRange:2,xp:25,loot:'common_loot',level:1,ai:'aggressive',variant:'normal',...extra});

export const ENEMIES=[
  mob('wild_capybara','Capivara Selvagem','plain',{hp:45,damage:8,speed:2.5,ai:'defensive',loot:'herbivore_loot'}),
  mob('predator','Predador da Mata','forest',{hp:70,damage:18,speed:3.1,ai:'tracker',loot:'predator_loot',level:4}),
  mob('scarab','Escaravelho Blindado','desert',{hp:90,damage:16,defense:8,speed:1.4,ai:'heavy',loot:'desert_loot',level:16}),
  mob('scorpion','Escorpião das Dunas','desert',{hp:65,damage:23,speed:2.4,ai:'fast',loot:'desert_loot',level:18}),
  mob('ice_creature','Vulto de Gelo','snow',{hp:110,damage:25,defense:6,speed:1.8,ai:'ranged',loot:'ice_loot',level:24}),
  mob('rock_creature','Colosso Rochoso','mountain',{hp:150,damage:30,defense:12,speed:1.1,ai:'heavy',loot:'mountain_loot',level:12}),
  mob('robot','Autômato Ferroviário','city',{hp:120,damage:26,defense:9,speed:2,ai:'aggressive',loot:'machine_loot',level:20}),
  mob('drone','Drone Sentinela','zero',{hp:70,damage:22,defense:4,speed:3.4,ai:'ranged',loot:'machine_loot',level:34}),
  mob('ash_creature','Criatura de Cinzas','volcano',{hp:135,damage:34,defense:7,speed:2.5,ai:'fast',loot:'volcano_loot',level:29}),
  mob('slime','Gosma da Planície','plain',{hp:30,damage:8,defense:1,speed:2.2,loot:'slime_loot',xp:12}),
  mob('boar','Javali Selvagem','plain',{hp:50,damage:15,defense:3,speed:1.6,loot:'boar_loot',xp:20}),
  mob('spore','Esporos Venenosos','forest',{hp:25,damage:12,defense:0,speed:1.8,loot:'spore_loot',level:3}),
  mob('wolf','Lobo da Floresta','forest',{hp:60,damage:18,speed:3,loot:'wolf_loot',level:4}),
  mob('elite_boar','Javali Alfa','forest',{hp:120,damage:25,defense:5,speed:2,xp:80,loot:'elite_loot',level:6,ai:'heavy',elite:true,variant:'alpha'}),
];

const boss=(id,name,region,level,extra={})=>mob(id,name,region,{boss:true,level,hp:700+level*35,damage:28+level,defense:8+Math.floor(level/5),speed:2,xp:500+level*50,loot:`${id}_loot`,arena:{center:{x:level*8,z:0},radius:22},music:`boss_${id}`,phases:[{hpThreshold:70,attacks:['primary']},{hpThreshold:35,attacks:['primary','special']},{hpThreshold:0,attacks:['primary','special','summon']}],...extra});
export const BOSSES=[
  boss('forest_guardian','Guardião da Floresta','forest',8,{hp:600,quest:'guardian_forest',cutscene:{entry:'guardian_entry',victory:'guardian_victory'},arena:{center:{x:40,z:0},radius:22},attacks:[{id:'slam',damage:30,range:4,cooldown:3},{id:'charge',damage:35,range:12,cooldown:6},{id:'summon',damage:0,range:0,cooldown:10}],phases:[{hpThreshold:70,attacks:['slam']},{hpThreshold:35,attacks:['slam','charge']},{hpThreshold:0,attacks:['slam','charge','summon']}]}),
  boss('mountain_titan','Titã da Montanha','mountain',14),boss('city_overseer','Supervisor da Cidade','city',20),boss('desert_empress','Imperatriz Escorpião','desert',25),boss('frost_colossus','Colosso de Gelo','snow',30),boss('volcano_heart','Coração do Vulcão','volcano',36),boss('zero_conductor','Condutor Zero','zero',45),
];

export function enemyVariant(base,variant='normal'){
  const multipliers={normal:[1,1,1],alpha:[1.35,1.2,1.1],elite:[1.8,1.45,1.25],rare:[1.55,1.65,1.35]}; const [hp,damage,speed]=multipliers[variant]||multipliers.normal;
  return {...base,id:`${base.id}:${variant}`,baseId:base.id,variant,hp:Math.round(base.hp*hp),damage:Math.round(base.damage*damage),speed:base.speed*speed,abilities:variant==='rare'?['elemental']:variant==='elite'?['stun','armor']:variant==='alpha'?['rally']:[]};
}
