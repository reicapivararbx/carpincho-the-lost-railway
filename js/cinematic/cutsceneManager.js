export class CutsceneManager{
  constructor(){ this.active=false }
  play(id,onDone){
    this.active=true; const el=document.getElementById('cutscene');
    if(el){ el.style.display='block'; const t=document.getElementById('cutscene-text'); if(t) t.textContent='▶ '+id; }
    setTimeout(()=>{ this.active=false; if(el) el.style.display='none'; onDone&&onDone(); },2600);
  }
  skip(){ this.active=false; const el=document.getElementById('cutscene'); if(el) el.style.display='none'; }
}
