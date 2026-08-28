export function scheduleRespawn(node, ms=30000, cb){ setTimeout(()=>{ node.hp=node.maxHp; node.depleted=false; cb&&cb()}, ms) }
