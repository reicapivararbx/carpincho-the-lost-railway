export function hasAmmo(p){ return p.mag>0 || p.reserve>0 }
export function validateAmmo(previous,next,shots=0){
  if(![previous?.mag,previous?.reserve,next?.mag,next?.reserve,shots].every(Number.isFinite)) return false;
  if(next.mag<0||next.reserve<0||next.mag>(next.magSize||6)) return false;
  return previous.mag+previous.reserve===next.mag+next.reserve+shots;
}
