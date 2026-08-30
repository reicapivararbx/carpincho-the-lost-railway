import test from 'node:test';
import assert from 'node:assert/strict';
import { inventory } from '../js/inventory/inventory.js';
import { validateHotbar,hotbar,moveHotbarItem } from '../js/ui/hotbar.js';
import { migrate } from '../js/save/migration.js';
import { SettingsManager } from '../js/ui/settings.js';
import { consumeItem } from '../js/inventory/consumables.js';
import { Player } from '../js/player/player.js';

test('hotbar migration removes unknown and unavailable references',()=>{inventory.fromJSON({items:[['bread',1]],maxWeight:100});assert.deepEqual(validateHotbar(['bread','deleted_item','sword_iron',null]).slice(0,4),['bread',null,null,null]);const migrated=migrate({player:{level:1,xp:0,coins:0},hotbar:['bread','deleted_item']});assert.deepEqual(migrated.hotbar.slice(0,2),['bread',null])});
test('hotbar slots can swap in both directions',()=>{hotbar.slots=['bread','wood',null,null,null,null,null,null,null];assert.equal(moveHotbarItem(0,1),true);assert.deepEqual(hotbar.slots.slice(0,2),['wood','bread'])});
test('consumables apply declared effects and consume one unit',()=>{inventory.fromJSON({items:[['healing_tonic',1]],maxWeight:100});const player=new Player();player.health.damage(60);assert.equal(consumeItem(inventory,'healing_tonic',player).ok,true);assert.equal(player.health.current,85);assert.equal(inventory.has('healing_tonic'),false)});
test('settings persist graphics, audio, accessibility and remapped controls',()=>{const store=new Map(),storage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};const manager=new SettingsManager(storage);const next=manager.save({viewDistance:5,music:22,textSize:140,contrast:'high',controls:{interact:'f'}});assert.equal(next.viewDistance,5);assert.equal(manager.load().controls.interact,'f');assert.equal(manager.load().music,22)});
