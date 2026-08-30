import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTS } from '../js/data/quests.js';
import { QuestManager } from '../js/quests/questManager.js';
import { Dialogue } from '../js/cinematic/dialogue.js';

test('main narrative contains all eight acts and side quest archetypes',()=>{for(let act=1;act<=8;act++)assert.ok(QUESTS.some(q=>q.name.includes(`ATO ${['','I','II','III','IV','V','VI','VII','VIII'][act]}`)));for(const type of ['DELIVERY','ESCORT','DEFENSE','RECOVERY','HUNT','EXPLORATION','MYSTERY'])assert.ok(QUESTS.some(q=>q.type===type))});
test('objective event engine tracks collection, craft, travel, damage, delivery and return',()=>{const manager=new QuestManager();const q=manager.quests[0];for(const type of ['collect','craft','travel','damage','delivery','return']){q.objectives=[{id:type,type,target:'x',amount:2,progress:0,done:false}];q.active=true;q.completed=false;manager.record(type,'x',2);assert.equal(q.objectives[0].done,true)}});
test('dialogue choices persist consequences',()=>{const dialogue=new Dialogue();const entry=dialogue.show('Ada','Qual rota?', [{response:'Pelo cânion',flag:'route',value:'canyon',consequence:'risk'}]);const result=dialogue.choose(entry,0);assert.equal(result.consequence,'risk');assert.equal(dialogue.flags.route,'canyon')});
