import test from 'node:test';
import assert from 'node:assert/strict';
import { PlayerAnimator, PLAYER_ANIMATIONS } from '../js/player/playerAnimator.js';
import { resolveCircleMovement } from '../js/player/collision.js';
import { cameraRelativeDirection,facingYaw } from '../js/player/movement.js';

function transform(){
  return {position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}};
}

test('collision blocks penetration but permits sliding and moving away', () => {
  const colliders=[{x:2,z:0,radius:1}];
  const blocked=resolveCircleMovement({x:0,z:0},{x:1,z:.5},colliders,.5);
  assert.equal(blocked.x,0);
  assert.equal(blocked.z,.5);

  const escaped=resolveCircleMovement({x:1.2,z:0},{x:-.4,z:0},colliders,.5);
  assert.ok(Math.abs(escaped.x-.8)<Number.EPSILON);
});

test('movement is relative to camera and model faces every movement direction consistently',()=>{const forward={x:0,z:-1},right={x:-1,z:0};const north=cameraRelativeDirection(forward,right,{forward:true}),west=cameraRelativeDirection(forward,right,{left:true});assert.deepEqual(north,{x:0,z:-1,moving:true});assert.deepEqual(west,{x:-1,z:0,moving:true});assert.equal(facingYaw(north),Math.PI/2);assert.equal(Math.abs(facingYaw(west)),Math.PI)});

test('procedural animator selects locomotion and one-shot action states', () => {
  const root=transform();
  const parts={body:transform(),head:transform(),legs:[transform(),transform()],rightHand:transform()};
  const animator=new PlayerAnimator(root,parts);

  assert.equal(animator.update(.016,{moving:false}),PLAYER_ANIMATIONS.IDLE);
  assert.equal(animator.update(.016,{moving:true}),PLAYER_ANIMATIONS.WALK);
  assert.equal(animator.update(.016,{moving:true,sprinting:true}),PLAYER_ANIMATIONS.RUN);
  assert.equal(animator.update(.016,{grounded:false}),PLAYER_ANIMATIONS.JUMP);
  assert.equal(animator.play(PLAYER_ANIMATIONS.ATTACK),true);
  assert.equal(animator.update(.016),PLAYER_ANIMATIONS.ATTACK);
  assert.notEqual(parts.rightHand.rotation.x,0);
  assert.equal(animator.update(1,{playerState:'DEAD'}),PLAYER_ANIMATIONS.DEATH);
  assert.ok(root.rotation.x>1);
});
