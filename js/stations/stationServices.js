export function shopBuy(item, player){ if(player.coins>=10){ player.coins-=10; return true } return false }
