import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectPool } from '../js/performance/objectPool.js';
import { updateDistanceLOD } from '../js/performance/lod.js';

test('object pool reuses particles, projectiles and temporary mob objects',()=>{let created=0;const pool=new ObjectPool(()=>({id:++created,visible:false}),{initial:1,reset:(object,data,active)=>{object.visible=active;object.data=data}});const first=pool.acquire({kind:'particle'});pool.release(first);const second=pool.acquire({kind:'projectile'});assert.equal(first,second);assert.equal(created,1);assert.equal(second.data.kind,'projectile')});
test('distance LOD culls far objects and marks near/far detail levels',()=>{const objects=[{position:{x:2,z:0},userData:{}},{position:{x:30,z:0},userData:{}},{position:{x:100,z:0},userData:{}}];updateDistanceLOD(objects,{x:0,z:0},{near:10,far:50});assert.deepEqual(objects.map(o=>[o.visible,o.userData.lod]),[[true,0],[true,1],[false,2]])});
