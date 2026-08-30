import test from 'node:test';
import assert from 'node:assert/strict';
import { PlayerStateMachine, PLAYER_STATES } from '../js/player/playerStateMachine.js';

test('player state machine exposes the eight states required by the game', () => {
  assert.deepEqual(Object.keys(PLAYER_STATES).sort(), [
    'COMBAT',
    'CUTSCENE',
    'DEAD',
    'DRIVING',
    'ENTERING_TRAIN',
    'IN_TRAIN',
    'MENU',
    'ON_FOOT',
  ]);
});

test('player follows the complete on-foot and train state flow', () => {
  const transitions=[];
  const machine=new PlayerStateMachine(PLAYER_STATES.ON_FOOT, event=>transitions.push(event));

  assert.equal(machine.canMove, true);
  assert.equal(machine.transition(PLAYER_STATES.ENTERING_TRAIN), true);
  assert.equal(machine.isInTrain, true);
  assert.equal(machine.transition(PLAYER_STATES.IN_TRAIN), true);
  assert.equal(machine.transition(PLAYER_STATES.DRIVING), true);
  assert.equal(machine.canMove, false);
  assert.equal(machine.transition(PLAYER_STATES.IN_TRAIN), true);
  assert.equal(machine.transition(PLAYER_STATES.ON_FOOT), true);

  assert.deepEqual(transitions.map(event=>event.state), [
    PLAYER_STATES.ENTERING_TRAIN,
    PLAYER_STATES.IN_TRAIN,
    PLAYER_STATES.DRIVING,
    PLAYER_STATES.IN_TRAIN,
    PLAYER_STATES.ON_FOOT,
  ]);
});

test('menu and cutscene pause play and can restore the previous playable state', () => {
  const machine=new PlayerStateMachine();

  machine.transition(PLAYER_STATES.MENU);
  assert.equal(machine.isPaused, true);
  assert.equal(machine.canCombat, false);
  assert.equal(machine.transition(PLAYER_STATES.ON_FOOT), true);
  machine.transition(PLAYER_STATES.COMBAT);
  machine.transition(PLAYER_STATES.CUTSCENE);
  assert.equal(machine.isPaused, true);
  assert.equal(machine.transition(PLAYER_STATES.COMBAT), true);
  assert.equal(machine.canCombat, true);
});

test('invalid transitions are rejected without corrupting state', () => {
  const machine=new PlayerStateMachine();

  assert.equal(machine.transition(PLAYER_STATES.DRIVING), false);
  assert.equal(machine.state, PLAYER_STATES.ON_FOOT);
  assert.equal(machine.previousState, null);
  assert.throws(()=>machine.transition('FLYING'), /Estado inválido/);

  machine.transition(PLAYER_STATES.DEAD);
  assert.equal(machine.transition(PLAYER_STATES.MENU), false);
  assert.equal(machine.state, PLAYER_STATES.DEAD);
  assert.equal(machine.transition(PLAYER_STATES.ON_FOOT), true);
});
