import { QUESTS } from '../data/quests.js';
import { grantRewards } from './rewards.js';
export class QuestManager{
  constructor(player=null,inventory=null){ this.player=player; this.inventory=inventory; this.quests=QUESTS.map(q=>({...q,status:q.id==='first_departure'?'active':'locked',active:q.id==='first_departure',completed:false,objectives:q.objectives.map(o=>({...o,progress:o.progress||0}))})) }
  active(){ return this.quests.find(q=>q.active && !q.completed) }
  update(id,cb){ const q=this.quests.find(x=>x.id===id); if(q) cb(q); this.checkComplete(q) }
  record(type,target,amount=1,meta={}){
    const changed=[];
    for(const q of this.quests.filter(q=>q.active&&!q.completed)) for(const o of q.objectives.filter(o=>!o.done&&o.type===type&&(o.target===target||o.target==='any'))){o.progress=Math.min(o.amount,(o.progress||0)+amount);o.done=o.progress>=o.amount;o.meta={...(o.meta||{}),...meta};changed.push({quest:q.id,objective:o.id,progress:o.progress,done:o.done});this.checkComplete(q)}
    return changed;
  }
  checkComplete(q){
    if(!q || q.completed) return;
    const done=q.objectives.every(o=>o.done);
    if(done){
      q.completed=true;
      q.status='completed'; q.active=false;
      if(!q._rewardsGranted && this.player){ grantRewards(q,this.player,this.inventory); q._rewardsGranted=true; }
      if(q.nextQuest){ const nxt=this.quests.find(x=>x.id===q.nextQuest); if(nxt){nxt.active=true;nxt.status='active'} }
    }
  }
  progress(){ const q=this.active(); if(!q) return 0; return q.objectives.filter(o=>o.done).length/q.objectives.length }
}
