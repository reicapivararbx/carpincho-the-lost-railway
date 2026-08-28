import test from 'node:test';
import assert from 'node:assert/strict';
import { QuestManager } from '../js/quests/questManager.js';
import { Inventory } from '../js/inventory/inventory.js';

test('completed quest grants rewards once',()=>{
  const player={xp:0,coins:0,addXP(n){this.xp+=n}};
  const inventory=new Inventory();
  const manager=new QuestManager(player,inventory);
  const quest=manager.quests[0]; quest.objectives.forEach(o=>o.done=true);
  manager.checkComplete(quest); manager.checkComplete(quest);
  assert.equal(quest.completed,true); assert.equal(player.xp,150); assert.equal(player.coins,50);
});
