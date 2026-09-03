import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../js/game2d.js';
import { Inventory } from '../js/inventory/inventory.js';
import { detectTouchInput, interactionPrompt, TouchControls } from '../js/ui/touchControls.js';

class FakeButton {
  constructor(dataset = {}) {
    this.dataset = dataset;
    this.listeners = new Map();
    this.attributes = new Map();
    this.classList = {
      active: new Set(),
      add: name => this.classList.active.add(name),
      remove: name => this.classList.active.delete(name),
      toggle: (name, force) => this.classList.active[force ? 'add' : 'delete'](name),
      contains: name => this.classList.active.has(name)
    };
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  removeEventListener(type) {
    this.listeners.delete(type);
  }

  setAttribute(name,value) {
    this.attributes.set(name,String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name)??null;
  }

  dispatch(type, pointerId) {
    this.listeners.get(type)?.({
      currentTarget: this,
      pointerId,
      preventDefault() {},
      setPointerCapture() {}
    });
  }
}

function createTouchRoot() {
  const forward = new FakeButton({ touchAction: 'forward' });
  const interact = new FakeButton({ touchInteraction: '' });
  return {
    hidden: false,
    forward,
    interact,
    querySelectorAll: () => [forward],
    querySelector: () => interact
  };
}

test('touch controls activate on mobile input without replacing controls on a hybrid desktop', () => {
  const coarsePointer = { navigator: { maxTouchPoints: 0 }, matchMedia: query => ({ matches: query === '(pointer: coarse)' }) };
  const touchPoints = { navigator: { maxTouchPoints: 2 }, matchMedia: query => ({ matches: query === '(hover: none)' }) };
  const mobileDevice = { navigator: { maxTouchPoints: 1, userAgentData: { mobile: true } }, matchMedia: () => ({ matches: false }) };
  const hybridDesktop = { navigator: { maxTouchPoints: 2 }, matchMedia: query => ({ matches: query === '(pointer: fine)' || query === '(hover: hover)' }) };
  const desktop = { navigator: { maxTouchPoints: 0 }, matchMedia: () => ({ matches: false }) };

  assert.equal(detectTouchInput(coarsePointer), true);
  assert.equal(detectTouchInput(touchPoints), true);
  assert.equal(detectTouchInput(mobileDevice), true);
  assert.equal(detectTouchInput(hybridDesktop), false);
  assert.equal(detectTouchInput(desktop), false);
});

test('game touch callbacks share movement state and the interaction path', () => {
  const game = {
    keys: {},
    brokenRepaired: true,
    train: { inTrain: false },
    player: { pos: { x: 0, z: 0 } },
    playerState: { is: () => false },
    nearBrokenRail() { return false; },
    interactionCount: 0,
    tryInteract() {
      this.interactionCount += 1;
    }
  };

  Game.prototype.onTouchInput.call(game, 'forward', true);
  Game.prototype.onTouchInput.call(game, 'forward', false);
  Game.prototype.onTouchInteract.call(game);

  assert.deepEqual(game.keys, { forward: false });
  assert.equal(game.interactionCount, 1);
});

test('touch arrows drive the train and touch interaction is blocked while the game is paused', () => {
  let accelerated = 0;
  let interactions = 0;
  const game = {
    keys: {},
    train: { inTrain: true, brake() {} },
    brokenRepaired: true,
    player: { pos: { x: 0, z: 0 } },
    playerState: { is: (...states) => states.includes('IN_TRAIN') },
    nearBrokenRail() { return false; },
    accelerate() { accelerated += 1; },
    tryInteract() { interactions += 1; }
  };

  assert.equal(Game.prototype.onTouchInput.call(game, 'forward', true), true);
  assert.equal(accelerated, 1);

  game.playerState.is = (...states) => states.includes('MENU');
  assert.equal(Game.prototype.onTouchInteract.call(game), false);
  assert.equal(interactions, 0);
});

test('inventory listener unsubscribe stops future change notifications', () => {
  const inventory = new Inventory();
  let notifications = 0;
  const unsubscribe = inventory.onChange(() => { notifications += 1; });

  inventory._emit();
  unsubscribe();
  unsubscribe();
  inventory._emit();

  assert.equal(notifications, 1);
});

test('touch controls hold directional input, invoke interaction, and release each action once on cleanup', () => {
  const root = createTouchRoot();
  const inputs = [];
  let interactions = 0;
  const controls = new TouchControls(root, {
    onInput: (action, active) => inputs.push([action, active]),
    onInteract: () => { interactions += 1; }
  }, { navigator: { maxTouchPoints: 1 }, matchMedia: () => ({ matches: true }) });

  root.forward.dispatch('pointerdown', 1);
  root.forward.dispatch('pointerdown', 2);
  root.interact.dispatch('pointerdown', 3);
  assert.equal(root.hidden, false);
  assert.equal(root.forward.getAttribute('aria-pressed'), 'true');
  assert.equal(root.interact.getAttribute('aria-pressed'), 'true');
  controls.destroy();

  assert.equal(root.hidden, true);
  assert.deepEqual(inputs, [['forward', true], ['forward', false]]);
  assert.equal(interactions, 1);
  assert.equal(root.forward.classList.contains('active'), false);
  assert.equal(root.interact.classList.contains('active'), false);
  assert.equal(root.forward.getAttribute('aria-pressed'), 'false');
  assert.equal(root.interact.getAttribute('aria-pressed'), 'false');
});

test('touch controls release held movement when the window loses focus', () => {
  const root = createTouchRoot();
  const listeners = new Map();
  const documentListeners = new Map();
  const platform = {
    navigator: { maxTouchPoints: 1 },
    matchMedia: query => ({ matches: query === '(pointer: coarse)' }),
    addEventListener: (type,listener) => listeners.set(type,listener),
    removeEventListener: type => listeners.delete(type),
    document: {
      hidden: false,
      addEventListener: (type,listener) => documentListeners.set(type,listener),
      removeEventListener: type => documentListeners.delete(type)
    }
  };
  const inputs = [];
  const controls = new TouchControls(root, {
    onInput: (action,active) => inputs.push([action,active]),
    onInteract() {}
  }, platform);

  root.forward.dispatch('pointerdown', 7);
  listeners.get('blur')();

  assert.deepEqual(inputs, [['forward',true],['forward',false]]);
  assert.equal(root.forward.classList.contains('active'), false);
  controls.destroy();
  assert.equal(listeners.size, 0);
  assert.equal(documentListeners.size, 0);
});

test('touch controls hide and release movement while a menu or cutscene is active', () => {
  const root=createTouchRoot();
  const inputs=[];
  const controls=new TouchControls(root,{
    onInput:(action,active)=>inputs.push([action,active]),
    onInteract() {}
  },{navigator:{maxTouchPoints:1},matchMedia:query=>({matches:query==='(pointer: coarse)'})});

  root.forward.dispatch('pointerdown',21);
  controls.setEnabled(false);

  assert.equal(root.hidden,true);
  assert.deepEqual(inputs,[['forward',true],['forward',false]]);
  controls.setEnabled(true);
  assert.equal(root.hidden,false);
  controls.destroy();
});

test('game destruction cancels its frame and removes every lifecycle listener', () => {
  const removedWindowListeners = [];
  const removedCanvasListeners = [];
  const cancelledFrames = [];
  const previousRemoveEventListener = globalThis.removeEventListener;
  const previousCancelAnimationFrame = globalThis.cancelAnimationFrame;
  const touchControls = { destroyed: false, destroy() { this.destroyed = true; } };
  const keyDown = () => {};
  const keyUp = () => {};
  const resize = () => {};
  const debugKey = () => {};
  const mouseMove = () => {};
  const mouseDown = () => {};
  const mouseUp = () => {};
  const contextMenu = () => {};
  const wheel = () => {};
  let cleanups = 0;
  const game = {
    running: true,
    _animationFrameId: 12,
    touchControls,
    _onKeyDown: keyDown,
    _onKeyUp: keyUp,
    _onResize: resize,
    _onDebugKey: debugKey,
    _onMouseMove: mouseMove,
    _onMouseDown: mouseDown,
    _onMouseUp: mouseUp,
    _onContextMenu: contextMenu,
    _onWheel: wheel,
    _cleanup: [() => { cleanups += 1; }],
    canvas: { removeEventListener: (type, listener) => removedCanvasListeners.push([type, listener]) }
  };

  globalThis.removeEventListener = (type, listener) => removedWindowListeners.push([type, listener]);
  globalThis.cancelAnimationFrame = frameId => cancelledFrames.push(frameId);
  try {
    Game.prototype.destroy.call(game);
  } finally {
    globalThis.removeEventListener = previousRemoveEventListener;
    globalThis.cancelAnimationFrame = previousCancelAnimationFrame;
  }

  assert.equal(game.running, false);
  assert.equal(touchControls.destroyed, true);
  assert.deepEqual(cancelledFrames, [12]);
  assert.deepEqual(removedWindowListeners, [['keydown', keyDown], ['keyup', keyUp], ['resize', resize], ['keydown', debugKey]]);
  assert.deepEqual(removedCanvasListeners, [
    ['mousemove', mouseMove],
    ['mousedown', mouseDown],
    ['mouseup', mouseUp],
    ['contextmenu', contextMenu],
    ['wheel', wheel]
  ]);
  assert.equal(cleanups, 1);
});
