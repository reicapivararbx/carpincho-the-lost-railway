import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTrackerContent,
  splitObjectiveHint,
  MissionTracker,
  setCollapsed,
  readSessionCollapsed,
  ensureMissionTrackerDom,
} from '../js/ui/missionTracker.js';

function installDom() {
  const store = new Map();
  globalThis.sessionStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };

  const tracker = {
    id: 'objective-tracker',
    className: '',
    dataset: {},
    classList: {
      _s: new Set(),
      add(...xs) {
        xs.forEach((x) => this._s.add(x));
        tracker.className = [...this._s].join(' ');
      },
      remove(...xs) {
        xs.forEach((x) => this._s.delete(x));
        tracker.className = [...this._s].join(' ');
      },
      toggle(x, force) {
        const on = force === undefined ? !this._s.has(x) : !!force;
        if (on) this._s.add(x);
        else this._s.delete(x);
        tracker.className = [...this._s].join(' ');
        return on;
      },
      contains(x) {
        return this._s.has(x);
      },
    },
    innerHTML: '',
    children: [],
    attributes: {},
    setAttribute(k, v) {
      this.attributes[k] = v;
    },
    querySelector(sel) {
      return this._nodes.get(sel) || null;
    },
    _nodes: new Map(),
  };

  const toastHost = {
    id: 'mission-toast',
    children: [],
    replaceChildren() {
      this.children = [];
    },
    appendChild(n) {
      if (!n.classList) {
        n.classList = {
          _s: new Set(String(n.className || '').split(/\s+/).filter(Boolean)),
          add(x) {
            this._s.add(x);
            n.className = [...this._s].join(' ');
          },
          remove(x) {
            this._s.delete(x);
            n.className = [...this._s].join(' ');
          },
        };
      }
      if (n.offsetWidth == null) n.offsetWidth = 1;
      if (!n.remove) n.remove = () => {};
      this.children.push(n);
    },
  };

  function makeNode(tag, attrs = {}) {
    let className = attrs.class || '';
    const classSet = new Set(className.split(/\s+/).filter(Boolean));
    const node = {
      tag,
      textContent: '',
      hidden: false,
      attributes: { ...attrs },
      get className() {
        return className;
      },
      set className(value) {
        className = String(value || '');
        classSet.clear();
        className.split(/\s+/).filter(Boolean).forEach((c) => classSet.add(c));
      },
      classList: {
        add(x) {
          classSet.add(x);
          className = [...classSet].join(' ');
        },
        remove(x) {
          classSet.delete(x);
          className = [...classSet].join(' ');
        },
        contains(x) {
          return classSet.has(x);
        },
      },
      setAttribute(k, v) {
        this.attributes[k] = v;
      },
      getAttribute(k) {
        return this.attributes[k];
      },
      style: {},
      offsetWidth: 1,
      remove() {},
    };
    return node;
  }

  globalThis.document = {
    getElementById(id) {
      if (id === 'objective-tracker') return tracker;
      if (id === 'mission-toast') return toastHost;
      return null;
    },
    createElement(tag) {
      return makeNode(tag);
    },
  };

  Object.defineProperty(tracker, 'innerHTML', {
    get() {
      return this._html || '';
    },
    set(html) {
      this._html = html;
      const title = makeNode('span', { 'data-mt-title': '' });
      const body = makeNode('p', { 'data-mt-body': '', class: 'mission-tracker__objective' });
      const progress = makeNode('span', { 'data-mt-progress': '' });
      progress.hidden = true;
      const toggle = makeNode('button', { 'data-mt-toggle': '' });
      toggle.textContent = '−';
      tracker._nodes.set('[data-mt-title]', title);
      tracker._nodes.set('[data-mt-body]', body);
      tracker._nodes.set('[data-mt-progress]', progress);
      tracker._nodes.set('[data-mt-toggle]', toggle);
      tracker._toggleHandler = null;
      toggle.addEventListener = (_ev, fn) => {
        tracker._toggleHandler = fn;
      };
    },
    configurable: true,
  });

  return { tracker, toastHost, store };
}

function sampleQuest(overrides = {}) {
  return {
    id: 'first_departure',
    name: 'ATO I — PRIMEIRA PARTIDA',
    objectives: [
      {
        id: 'inspect',
        description: 'Inspecionar a locomotiva (E perto do trem)',
        amount: 1,
        progress: 0,
        done: false,
      },
      {
        id: 'fuel',
        description: 'Abastecer com 3 carvões',
        amount: 3,
        progress: 0,
        done: false,
      },
    ],
    ...overrides,
  };
}

test('splitObjectiveHint strips keybind clutter from tracker body', () => {
  assert.equal(
    splitObjectiveHint('Inspecionar a locomotiva (E perto do trem)').body,
    'Inspecionar a locomotiva',
  );
  assert.equal(splitObjectiveHint('[E] Coletar carvão').body, 'Coletar carvão');
});

test('formatTrackerContent keeps title/objective compact without world-space coords', () => {
  const content = formatTrackerContent(sampleQuest());
  assert.equal(content.title, 'ATO I — PRIMEIRA PARTIDA');
  assert.equal(content.body, 'Inspecionar a locomotiva');
  assert.equal(content.progress, '');
  assert.equal(content.empty, false);
  assert.ok(!content.body.includes('E perto'));
});

test('formatTrackerContent shows progress for multi-amount objectives', () => {
  const quest = sampleQuest({
    objectives: [
      { id: 'inspect', description: 'Inspecionar', amount: 1, progress: 1, done: true },
      { id: 'fuel', description: 'Abastecer com 3 carvões', amount: 3, progress: 1, done: false },
    ],
  });
  const content = formatTrackerContent(quest);
  assert.equal(content.body, 'Abastecer com 3 carvões');
  assert.equal(content.progress, '1/3');
});

test('MissionTracker renders into fixed #objective-tracker and collapse persists in session', () => {
  const { tracker } = installDom();
  const mt = new MissionTracker();
  ensureMissionTrackerDom();
  mt.render(sampleQuest());

  const title = tracker.querySelector('[data-mt-title]');
  const body = tracker.querySelector('[data-mt-body]');
  assert.equal(title.textContent, 'ATO I — PRIMEIRA PARTIDA');
  assert.equal(body.textContent, 'Inspecionar a locomotiva');
  assert.ok(tracker.classList.contains('mission-tracker') || tracker.dataset.ready === '1');

  setCollapsed(true);
  assert.equal(tracker.classList.contains('is-collapsed'), true);
  assert.equal(readSessionCollapsed(), true);
  setCollapsed(false);
  assert.equal(readSessionCollapsed(), false);
});

test('MissionTracker first paint is silent; objective advance flashes update toast', () => {
  const { toastHost } = installDom();
  const mt = new MissionTracker();
  const quest = sampleQuest();
  mt.render(quest);
  assert.equal(toastHost.children.length, 0, 'first paint must not spam center toast');

  quest.objectives[0].done = true;
  mt.render(quest);
  assert.ok(toastHost.children.length >= 1, 'objective change should toast');
  assert.ok(String(toastHost.children[0].className).includes('mission-toast--update'));
});

test('MissionTracker never assigns left/top inline that would center over player', () => {
  const { tracker } = installDom();
  const mt = new MissionTracker();
  mt.render(sampleQuest());
  assert.equal(tracker.style?.left, undefined);
  assert.equal(tracker.style?.top, undefined);
  assert.equal(tracker.style?.transform, undefined);
});
