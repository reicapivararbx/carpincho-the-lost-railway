export class CutsceneManager{
  constructor(){ this.active=false; this.timer=null; this.onDone=null }
  play(id,onDone){
    this.finish('replaced');
    this.active=true; const el=document.getElementById('cutscene');
    if(el){ el.style.display='block'; const t=document.getElementById('cutscene-text'); if(t) t.textContent='▶ '+id; }
    this.onDone=onDone;
    this.timer=setTimeout(()=>this.finish('complete'),2600);
  }
  finish(reason){
    if(!this.active) return;
    this.active=false;
    if(this.timer) clearTimeout(this.timer);
    this.timer=null;
    const el=document.getElementById('cutscene'); if(el) el.style.display='none';
    const done=this.onDone; this.onDone=null; done&&done(reason);
  }
  skip(){ this.finish('skipped'); }
}
