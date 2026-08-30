export class Codex{
  constructor(){this.entries=new Map();this.clues=new Set();this.discoveries=new Set()}
  discover(id,data={}){const fresh=!this.discoveries.has(id);this.discoveries.add(id);this.entries.set(id,{id,discoveredAt:Date.now(),...data});return fresh}
  addClue(id){this.clues.add(id);return this.clues.size}
  toJSON(){return {entries:[...this.entries],clues:[...this.clues],discoveries:[...this.discoveries]}}
  fromJSON(data={}){this.entries=new Map(data.entries||[]);this.clues=new Set(data.clues||[]);this.discoveries=new Set(data.discoveries||[])}
}
