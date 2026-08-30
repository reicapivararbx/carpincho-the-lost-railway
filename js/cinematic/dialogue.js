export class Dialogue{
  constructor(){this.history=[];this.flags={}}
  show(npc,text,choices=[]){const entry={npc,text,choices,at:Date.now()};this.history.push(entry);return entry}
  choose(entry,index){const choice=entry?.choices?.[index];if(!choice)return {ok:false};if(choice.flag)this.flags[choice.flag]=choice.value??true;return {ok:true,text:choice.response,consequence:choice.consequence}}
  toJSON(){return {history:this.history,flags:this.flags}}
}
