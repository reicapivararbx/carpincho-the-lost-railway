export function grantRewards(q,player,inventory){
  const rewards=q.rewards||{};
  if(rewards.xp) player.addXP(rewards.xp);
  if(rewards.coins) player.coins+=rewards.coins;
  for(const item of rewards.items||[]){ try{ inventory?.add(item.id,item.amount||1); }catch{} }
  if(rewards.recipes){ player.unlockedRecipes=[...(player.unlockedRecipes||[]),...rewards.recipes.filter(id=>!(player.unlockedRecipes||[]).includes(id))]; }
}
