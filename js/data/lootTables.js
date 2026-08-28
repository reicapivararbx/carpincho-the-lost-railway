export const LOOT_TABLES = {
  slime_loot:[{item:'scrap',amount:1,chance:0.6},{item:'herbs',amount:1,chance:0.3}],
  boar_loot:[{item:'scrap',amount:1,chance:0.5},{item:'wood',amount:2,chance:0.4}],
  spore_loot:[{item:'herbs',amount:2,chance:0.5}],
  wolf_loot:[{item:'scrap',amount:2,chance:0.4},{item:'iron_ore',amount:1,chance:0.2}],
  elite_loot:[{item:'iron_ingot',amount:2,chance:1},{item:'crystal',amount:1,chance:0.3}],
  guardian_loot:[{item:'train_core',amount:1,chance:1},{item:'iron_ingot',amount:8,chance:1},{item:'crystal',amount:3,chance:1}],
};
export function rollLoot(tableId){
  const table = LOOT_TABLES[tableId]||[];
  const out=[];
  for(const e of table){ if(Math.random()<e.chance) out.push({id:e.item,amount:e.amount}); }
  return out;
}
