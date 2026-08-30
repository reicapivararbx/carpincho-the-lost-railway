import test from 'node:test';
import assert from 'node:assert/strict';
import { Sword } from '../js/combat/sword.js';
import { Pistol } from '../js/combat/pistol.js';
import { Enemy } from '../js/enemies/enemy.js';
import { EnemyAI } from '../js/enemies/enemyAI.js';
import { ENEMIES,BOSSES,enemyVariant } from '../js/data/enemies.js';
import { Boss } from '../js/enemies/boss.js';

test('sword supports combo, heavy attack and blocking mitigation',()=>{const sword=new Sword();const a=sword.attack(1);const b=sword.attack(1.5);assert.equal(a.combo,1);assert.equal(b.combo,2);const heavy=sword.attack(2.5,{heavy:true});assert.equal(heavy.damage,30);sword.setBlocking(true);assert.equal(sword.mitigate(100),35)});
test('pistol reload has duration and preserves ammunition',()=>{const pistol=new Pistol();assert.equal(pistol.shoot(()=>.5).ok,true);assert.equal(pistol.mag,5);assert.equal(pistol.reload(),true);assert.equal(pistol.shoot().reason,'recarregando');pistol.tick(1.3);assert.equal(pistol.mag,6);assert.equal(pistol.reserve,35)});
test('AI uses perception, memory, stun and flee states',()=>{const enemy=new Enemy({id:'x',hp:100,speed:2,aggroRange:12,x:0,z:0});const ai=new EnemyAI(enemy);ai.update(1,{x:5,z:0});assert.equal(enemy.state,'CHASE');ai.update(1,{x:30,z:0},{hasLineObstacle:()=>true});assert.equal(enemy.state,'CHASE');enemy.takeDamage(90);ai.update(.3,{x:30,z:0},{hasLineObstacle:()=>true});assert.equal(enemy.state,'FLEE');enemy.takeDamage(10);assert.equal(enemy.state,'DEAD')});
test('nine requested species, four variants and seven regional bosses are data driven',()=>{for(const id of ['wild_capybara','predator','scarab','scorpion','ice_creature','rock_creature','robot','drone','ash_creature'])assert.ok(ENEMIES.some(e=>e.id===id));assert.equal(BOSSES.length,7);assert.deepEqual(['normal','alpha','elite','rare'].map(v=>enemyVariant(ENEMIES[0],v).variant),['normal','alpha','elite','rare'])});
test('forest guardian changes all three phases and unlocks phase attacks',()=>{const boss=new Boss('forest_guardian');assert.equal(boss.updatePhase().attacks[0],'slam');boss.hp=boss.maxHp*.5;assert.equal(boss.updatePhase().attacks.includes('charge'),true);boss.hp=boss.maxHp*.2;assert.equal(boss.updatePhase().attacks.includes('summon'),true)});
