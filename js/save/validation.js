export function validate(d){
  if(!d || typeof d!=='object' || !d.player || typeof d.player!=='object') return false;
  const p=d.player.pos;
  if(!(Number.isFinite(d.player.level)&&d.player.level>=1&&Number.isFinite(d.player.xp)&&d.player.xp>=0&&Number.isFinite(d.player.coins)&&d.player.coins>=0))return false;
  if(p&&(!Number.isFinite(p.x)||!Number.isFinite(p.z)||Math.abs(p.x)>10000||Math.abs(p.z)>10000))return false;
  if(d.inventory?.items&&!Array.isArray(d.inventory.items))return false;
  return true;
}
export function checksum(text){let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619)}return (hash>>>0).toString(16).padStart(8,'0')}
