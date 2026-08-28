import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldStreaming } from '../js/world/worldStreaming.js';

test('world streaming loads nearby chunks and unloads distant chunks',()=>{
  const loaded=[]; const unloaded=[];
  const stream=new WorldStreaming({chunkSize:10,loadRadius:1,onLoad:c=>loaded.push(c.key),onUnload:c=>unloaded.push(c.key)});
  const first=stream.update({x:0,z:0});
  assert.equal(first.active.length,9);
  const second=stream.update({x:30,z:0});
  assert.equal(second.center.cx,3);
  assert.ok(second.loaded.length>0);
  assert.ok(unloaded.length>0);
  assert.equal(stream.chunks.size,9);
});
