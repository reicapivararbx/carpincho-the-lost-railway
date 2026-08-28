import test from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../js/save/validation.js';
import { migrate } from '../js/save/migration.js';

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
