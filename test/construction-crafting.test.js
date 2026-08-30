import test from 'node:test';
import assert from 'node:assert/strict';
import { Inventory } from '../js/inventory/inventory.js';
import { ConstructionManager } from '../js/world/construction.js';
import { canCraft } from '../js/crafting/crafting.js';

test('structures are placed, serialized and removed with inventory refund',()=>{
  const inventory=new Inventory(200); inventory.add('chest',1);
  const construction=new ConstructionManager(inventory); const placed=construction.place('chest',{x:3,z:4});
  assert.equal(placed.ok,true); assert.equal(inventory.has('chest'),false);
  const snapshot=construction.toJSON(); const restored=new ConstructionManager(inventory); restored.fromJSON(snapshot);
  assert.equal(restored.placed[0].type,'chest'); assert.equal(restored.remove(restored.placed[0].id).ok,true); assert.equal(inventory.has('chest'),true);
});

test('discoverable recipes enforce quest, technology and reputation gates',()=>{
  assert.match(canCraft('engineering_table','crafting_table',10).reason,/quest/);
  assert.notEqual(canCraft('engineering_table','crafting_table',10,{completedQuests:['act_2_mountains']}).reason,'receita bloqueada: quest');
  assert.match(canCraft('laboratory','engineering_table',20,{completedQuests:[]}).reason,/reputation/);
});
