import test from 'node:test';
import assert from 'node:assert/strict';
import { Train } from '../js/train/train.js';
import { TrainDamage } from '../js/train/trainDamage.js';
import { Inventory } from '../js/inventory/inventory.js';
import * as THREE from 'three';
import { MissionCargoManager } from '../js/quests/deliveryCargo.js';

test('wagon composition changes weight, capacity, acceleration and consumption',()=>{
  const light=new Train({wagons:[]}); const heavy=new Train({wagons:['cargo','generator']});
  light.accelerate(1); heavy.accelerate(1); light.tick(1); heavy.tick(1);
  assert.ok(light.speed>heavy.speed); assert.ok(heavy.totalWeight>light.totalWeight); assert.equal(heavy.totalCapacity,110);
  assert.ok(heavy.fuel<80);
});

test('train systems take separate damage and repairs consume materials atomically',()=>{
  const train=new Train(); const damage=new TrainDamage(train); const inventory=new Inventory(); inventory.add('scrap',3);
  damage.damage('engine',40); assert.equal(train.locomotive.damage.engine,60); assert.equal(train.locomotive.damage.brakes,100);
  assert.equal(damage.repair('engine',20,{scrap:4},inventory).ok,false); assert.equal(inventory.count('scrap'),3);
  assert.equal(damage.repair('engine',20,{scrap:3},inventory).ok,true); assert.equal(train.locomotive.damage.engine,80); assert.equal(inventory.count('scrap'),0);
});

test('all seven requested wagon roles can compose a train',()=>{
  const types=['cargo','workshop','dormitory','greenhouse','laboratory','generator','defensive'];
  const train=new Train({wagons:types}); assert.deepEqual(train.wagons.map(w=>w.type),types); assert.ok(train.totalCapacity>0);
});

test('entry, driver and exit anchors remain physically attached to a moving locomotive',()=>{const locomotive=new THREE.Group(),entry=new THREE.Object3D(),driver=new THREE.Object3D(),exit=new THREE.Object3D();entry.position.set(-.4,.9,-1.45);driver.position.set(.6,1.65,0);exit.position.set(.4,.9,1.55);locomotive.add(entry,driver,exit);locomotive.position.set(18,0,10);locomotive.updateMatrixWorld(true);const e=new THREE.Vector3(),d=new THREE.Vector3(),x=new THREE.Vector3();entry.getWorldPosition(e);driver.getWorldPosition(d);exit.getWorldPosition(x);assert.equal(d.x,18.6);assert.ok(Math.hypot(e.x-x.x,e.z-x.z)>2.5);assert.ok(x.y>=.9)});
test('delivery cargo occupies a real cargo wagon and changes train weight until delivery',()=>{const train=new Train({wagons:['cargo']}),base=train.totalWeight,missions=new MissionCargoManager(train);assert.equal(missions.load({questId:'delivery',cargoId:'medicine',amount:4,unitWeight:5,destination:'city'}).ok,true);assert.equal(train.totalWeight,base+20);assert.equal(missions.deliver('delivery','forest').ok,false);assert.equal(missions.deliver('delivery','city').ok,true);assert.equal(train.totalWeight,base)});
