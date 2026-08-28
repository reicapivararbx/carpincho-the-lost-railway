import { QUESTS } from '../data/quests.js';
import { grantRewards } from './rewards.js';
export class QuestManager{
  constructor(player=null,inventory=null){ this.player=player; this.inventory=inventory; this.quests=QUESTS.map(q=>({...q, active:q.id==='first_departure', objectives:q.objectives.map(o=>({...o}))})) }
  active(){ return this.quests.find(q=>q.active && !q.completed) }
  update(id,cb){ const q=this.quests.find(x=>x.id===id); if(q) cb(q); this.checkComplete(q) }
  checkComplete(q){
    if(!q || q.completed) return;
    const done=q.objectives.every(o=>o.done);
    if(done){
      q.completed=true;
      if(!q._rewardsGranted && this.player){ grantRewards(q,this.player,this.inventory); q._rewardsGranted=true; }
      if(q.nextQuest){ const nxt=this.quests.find(x=>x.id===q.nextQuest); if(nxt) nxt.active=true; }
    }
  }
  progress(){ const q=this.active(); if(!q) return 0; return q.objectives.filter(o=>o.done).length/q.objectives.length }
}
