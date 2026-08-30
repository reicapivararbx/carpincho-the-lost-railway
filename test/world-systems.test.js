import test from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS,RegionDB } from '../js/data/regions.js';
import { Weather,WEATHER_TYPES } from '../js/world/weather.js';
import { FogOfWar } from '../js/world/fogOfWar.js';
import { TravelEventManager } from '../js/world/travelEvents.js';
import { Inventory } from '../js/inventory/inventory.js';

test('all eight regions expose identity, landmarks, climates and bounds',()=>{assert.equal(REGIONS.length,8);for(const region of REGIONS){assert.ok(region.color);assert.ok(region.landmarks.length);assert.ok(region.climates.every(c=>WEATHER_TYPES[c]));assert.equal(RegionDB.at(region.center).id,region.id)}});
test('weather transitions expose gameplay and particle effects',()=>{const weather=new Weather();weather.set('sandstorm',0);assert.equal(weather.state.particles,'sand');assert.ok(weather.state.visibility<.5);assert.ok(weather.state.traction<1)});
test('fog of war persists revealed cells and filters map markers',()=>{const fog=new FogOfWar({cellSize:10});fog.addMarker('station',{x:5,z:5});fog.addMarker('boss',{x:105,z:5});fog.reveal({x:0,z:0});assert.deepEqual(fog.visibleMarkers().map(m=>m.id),['station']);const copy=new FogOfWar();copy.fromJSON(fog.toJSON());assert.equal(copy.isRevealed({x:5,z:5}),true)});
test('travel choices validate repair materials and fuel',()=>{const events=new TravelEventManager(()=>0);const inventory=new Inventory();const train={fuel:20};events.roll(1);assert.equal(events.choose('repair',{inventory,train}).ok,false);inventory.add('scrap',2);assert.equal(events.choose('repair',{inventory,train}).ok,true)});
