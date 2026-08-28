export function grantRewards(q,player,inventory){ if(q.rewards.xp) player.addXP(q.rewards.xp); if(q.rewards.coins) player.coins+=q.rewards.coins }
