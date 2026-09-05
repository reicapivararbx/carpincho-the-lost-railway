import test from 'node:test';
import assert from 'node:assert/strict';
import { inventory } from '../js/inventory/inventory.js';
import {
  validateHotbar,
  hotbar,
  moveHotbarItem,
  assignHotbarItem,
  applyHotbarDrop,
  parseHotbarSlotMime,
} from '../js/ui/hotbar.js';
import { migrate } from '../js/save/migration.js';
import { SettingsManager } from '../js/ui/settings.js';
import { consumeItem } from '../js/inventory/consumables.js';
import { Player } from '../js/player/player.js';

test('hotbar migration removes unknown and unavailable references',()=>{
  inventory.fromJSON({items:[['bread',1]],maxWeight:100});
  assert.deepEqual(validateHotbar(['bread','deleted_item','sword_iron',null]).slice(0,4),['bread',null,null,null]);
  const migrated=migrate({player:{level:1,xp:0,coins:0},hotbar:['bread','deleted_item']});
  assert.deepEqual(migrated.hotbar.slice(0,2),['bread',null]);
});

test('hotbar slots can swap in both directions',()=>{
  hotbar.slots=['bread','wood',null,null,null,null,null,null,null];
  assert.equal(moveHotbarItem(0,1),true);
  assert.deepEqual(hotbar.slots.slice(0,2),['wood','bread']);
});

test('empty slot MIME must not parse as index 0',()=>{
  assert.equal(parseHotbarSlotMime(''),null);
  assert.equal(parseHotbarSlotMime(undefined),null);
  assert.equal(parseHotbarSlotMime('0'),0);
  assert.equal(parseHotbarSlotMime('8'),8);
  assert.equal(parseHotbarSlotMime('9'),null);
  assert.equal(parseHotbarSlotMime('abc'),null);
});

test('inventory item can be assigned onto hotbar slot via drop payload',()=>{
  inventory.fromJSON({items:[['bread',2],['wood',1]],maxWeight:100});
  hotbar.slots=[null,null,null,null,null,null,null,null,null];
  // Simulate inventory drag: item MIME only, no slot MIME
  assert.equal(applyHotbarDrop(3,{fromSlot:parseHotbarSlotMime(''),itemId:'bread'}),true);
  assert.equal(hotbar.slots[3],'bread');
  assert.equal(hotbar.slots[0],null);
});

test('hotbar-to-hotbar drop still swaps when slot MIME is present',()=>{
  inventory.fromJSON({items:[['bread',1],['wood',1]],maxWeight:100});
  hotbar.slots=['bread','wood',null,null,null,null,null,null,null];
  assert.equal(applyHotbarDrop(1,{fromSlot:parseHotbarSlotMime('0'),itemId:'bread'}),true);
  assert.deepEqual(hotbar.slots.slice(0,2),['wood','bread']);
});

test('assignHotbarItem rejects items not in inventory',()=>{
  inventory.fromJSON({items:[['bread',1]],maxWeight:100});
  hotbar.slots=[null,null,null,null,null,null,null,null,null];
  assert.equal(assignHotbarItem(0,'wood'),false);
  assert.equal(assignHotbarItem(0,'bread'),true);
  assert.equal(hotbar.slots[0],'bread');
});

test('consumables apply declared effects and consume one unit',()=>{
  inventory.fromJSON({items:[['healing_tonic',1]],maxWeight:100});
  const player=new Player();
  player.health.damage(60);
  assert.equal(consumeItem(inventory,'healing_tonic',player).ok,true);
  assert.equal(player.health.current,85);
  assert.equal(inventory.has('healing_tonic'),false);
});

test('settings persist graphics, audio, accessibility and remapped controls',()=>{
  const store=new Map(),storage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
  const manager=new SettingsManager(storage);
  const next=manager.save({viewDistance:5,music:22,textSize:140,contrast:'high',controls:{interact:'f'}});
  assert.equal(next.viewDistance,5);
  assert.equal(manager.load().controls.interact,'f');
  assert.equal(manager.load().music,22);
});
