export function validate(d){
  if(!d || typeof d!=='object' || !d.player || typeof d.player!=='object') return false;
  const p=d.player.pos;
  return Number.isFinite(d.player.level) && Number.isFinite(d.player.xp) && Number.isFinite(d.player.coins) && (!p || (Number.isFinite(p.x)&&Number.isFinite(p.z)));
}
