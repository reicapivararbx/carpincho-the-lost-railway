import test from 'node:test';
import assert from 'node:assert/strict';
import { inventory } from '../js/inventory/inventory.js';
import { canCraft, craft } from '../js/crafting/crafting.js';
import { Furnace } from '../js/crafting/furnace.js';
import { ResourceNode } from '../js/resources/resourceNode.js';
import { mine } from '../js/resources/mining.js';
import { PlayerEquipment } from '../js/player/equipment.js';

function resetInventory() {
  inventory.fromJSON({ items: [], maxWeight: 100 });
}

test('crafting requires its declared station and consumes materials atomically', () => {
  resetInventory();
  inventory.add('wood', 8);
  assert.equal(canCraft('crafting_table', 'hand', 1).ok, true);
  assert.equal(craft('crafting_table', 'hand', 1).ok, true);
  assert.equal(inventory.count('wood'), 0);
  assert.equal(inventory.count('crafting_table'), 1);

  inventory.add('wood', 3);
  inventory.add('stone', 2);
  assert.equal(canCraft('axe_wood', 'hand', 1).ok, false);
  assert.equal(canCraft('axe_wood', 'crafting_table', 1).ok, true);
  assert.equal(craft('axe_wood', 'crafting_table', 1).ok, true);
  assert.equal(inventory.count('axe_wood'), 1);
  assert.equal(inventory.count('wood'), 0);
  assert.equal(inventory.count('stone'), 0);
});

test('furnace only completes a valid ore and fuel pair once', () => {
  let output = null;
  const furnace = new Furnace((item) => { output = item; });
  furnace.setInput('iron_ore');
  furnace.setFuel('coal');
  furnace.tick(4.1);
  assert.equal(output, 'iron_ingot');
  assert.equal(furnace.canSmelt(), false);
  assert.equal(furnace.output, 'iron_ingot');
});

test('mining enforces tool tiers and returns a data-driven multi-drop table',()=>{
  const node=new ResourceNode({id:'iron-1',type:'iron_ore',tier:1,tool:'pick',hp:2,drops:[{item:'iron_ore',amount:[2,3],chance:1},{item:'stone',amount:1,chance:1}]});
  assert.match(mine(node,0).reason,/tier 1/);
  assert.equal(mine(node,1).depleted,false);
  const result=mine(node,1,1,()=>0);
  assert.equal(result.depleted,true);
  assert.deepEqual(result.drops,[{id:'iron_ore',amount:2},{id:'stone',amount:1}]);
});

test('equipment durability is persisted and broken tools leave inventory',()=>{
  resetInventory(); inventory.add('pick_wood',1);
  const equipment=new PlayerEquipment(inventory);
  assert.equal(equipment.equip('pick_wood'),true);
  const save=inventory.toJSON();
  inventory.damageDurability('pick_wood',49);
  assert.equal(inventory.durability('pick_wood'),1);
  assert.equal(inventory.damageDurability('pick_wood',1).broken,true);
  assert.equal(inventory.has('pick_wood'),false);
  inventory.fromJSON(save);
  assert.equal(inventory.durability('pick_wood'),50);
});
