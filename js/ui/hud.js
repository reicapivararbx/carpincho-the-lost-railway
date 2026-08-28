export function updateHUD(s){
  const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v };
  set('hud-hp',Math.round(s.hp)); set('hud-stamina',Math.round(s.stamina)); set('hud-lv',s.lv);
  const xp=document.getElementById('hud-xp'); if(xp) xp.textContent=s.xp+'/100 XP';
  set('hud-coins',s.coins); set('hud-fuel',Math.round(s.fuel)); set('hud-integ',Math.round(s.integ));
  set('hud-weapon',s.weapon||'—');
  const bh=document.getElementById('bar-hp'); if(bh) bh.style.width=s.hp+'%';
  const bs=document.getElementById('bar-stamina'); if(bs) bs.style.width=s.stamina+'%';
  const rg=document.getElementById('hud-region'); if(rg) rg.textContent='🗺️ '+(s.region||'Planície');
}
