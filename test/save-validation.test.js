import test from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../js/save/validation.js';
import { migrate } from '../js/save/migration.js';
import { SaveManager } from '../js/save/saveManager.js';

test('save validation rejects malformed player data',()=>{
  assert.equal(validate(null),false);
  assert.equal(validate({player:{level:'x',xp:0,coins:0}}),false);
  assert.equal(validate({player:{level:1,xp:0,coins:0,pos:{x:0,z:0}}}),true);
});
test('save migration supplies required containers',()=>{
  const data=migrate({player:{level:1,xp:0,coins:10}});
  assert.deepEqual(data.inventory,{});
  assert.equal(data.hotbar,null);
});
test('save checksum detects corruption and restores the previous backup',()=>{
  const values=new Map();globalThis.localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
  const manager=new SaveManager(),first={player:{level:1,xp:0,coins:10,pos:{x:0,z:0}}},second={player:{level:2,xp:5,coins:20,pos:{x:2,z:3}}};
  assert.equal(manager.save(first),true);assert.equal(manager.save(second),true);const corrupted=JSON.parse(values.get(manager.key));corrupted.data.player.coins=999999;values.set(manager.key,JSON.stringify(corrupted));const restored=manager.load();assert.equal(restored.player.coins,10);delete globalThis.localStorage;
});
