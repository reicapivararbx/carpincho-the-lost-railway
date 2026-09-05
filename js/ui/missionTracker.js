const SESSION_COLLAPSE_KEY = 'capy_mission_tracker_collapsed';
const TOAST_MS = 2200;
const OBJECTIVE_FLASH_MS = 480;

export function splitObjectiveHint(description) {
  const raw = String(description || '').trim();
  if (!raw) return { body: '', hint: null };
  const stripped = raw
    .replace(/\s*\([Ee]\s+perto[^)]*\)\s*$/i, '')
    .replace(/\s*\[[Ee]\]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { body: stripped || raw, hint: null };
}

export function formatTrackerContent(quest) {
  if (!quest) {
    return { title: '', body: 'Nenhum objetivo ativo', progress: '', done: false, empty: true };
  }
  const next = quest.objectives.find((o) => !o.done);
  if (!next) {
    return {
      title: quest.name,
      body: 'Objetivos concluídos',
      progress: '',
      done: true,
      empty: false,
    };
  }
  const { body } = splitObjectiveHint(next.description);
  const progress =
    next.amount > 1 ? `${Math.min(next.progress || 0, next.amount)}/${next.amount}` : '';
  return {
    title: quest.name,
    body,
    progress,
    done: false,
    empty: false,
  };
}

function rootEl() {
  return document.getElementById('objective-tracker');
}

function toastHost() {
  return document.getElementById('mission-toast');
}

function writeSessionCollapsed(collapsed) {
  try {
    sessionStorage.setItem(SESSION_COLLAPSE_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore blocked storage */
  }
}

export function readSessionCollapsed() {
  try {
    return sessionStorage.getItem(SESSION_COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

export function ensureMissionTrackerDom() {
  const el = rootEl();
  if (!el) return null;
  if (el.dataset.ready === '1') return el;

  el.dataset.ready = '1';
  el.classList.add('mission-tracker');
  el.setAttribute('role', 'status');
  el.innerHTML = [
    '<div class="mission-tracker__head">',
    '  <span class="mission-tracker__icon" aria-hidden="true">🎯</span>',
    '  <span class="mission-tracker__title" data-mt-title></span>',
    '  <button type="button" class="mission-tracker__toggle" data-mt-toggle aria-label="Recolher missão" title="Recolher/expandir">−</button>',
    '</div>',
    '<div class="mission-tracker__body" data-mt-body-wrap>',
    '  <p class="mission-tracker__objective" data-mt-body></p>',
    '  <span class="mission-tracker__progress" data-mt-progress hidden></span>',
    '</div>',
  ].join('');

  const toggle = el.querySelector('[data-mt-toggle]');
  if (toggle) {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setCollapsed(!el.classList.contains('is-collapsed'));
    });
  }

  setCollapsed(readSessionCollapsed(), { silent: true });
  return el;
}

export function setCollapsed(collapsed, opts = {}) {
  const el = ensureMissionTrackerDom();
  if (!el) return;
  el.classList.toggle('is-collapsed', collapsed);
  const toggle = el.querySelector('[data-mt-toggle]');
  if (toggle) {
    toggle.textContent = collapsed ? '+' : '−';
    toggle.setAttribute('aria-label', collapsed ? 'Expandir missão' : 'Recolher missão');
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }
  if (!opts.silent) writeSessionCollapsed(collapsed);
}

export function toggleCollapsed() {
  const el = rootEl();
  if (!el) return;
  setCollapsed(!el.classList.contains('is-collapsed'));
}

export function showMissionToast(kind, title) {
  const host = toastHost();
  if (!host) return;
  host.replaceChildren();
  const toast = document.createElement('div');
  toast.className = `mission-toast mission-toast--${kind}`;
  const label =
    kind === 'new' ? 'NOVA MISSÃO' : kind === 'complete' ? 'MISSÃO CONCLUÍDA' : 'OBJETIVO';
  const mark = kind === 'complete' ? '✅' : kind === 'new' ? '🎯' : '▸';
  toast.innerHTML = `<span class="mission-toast__label">${mark} ${label}</span><span class="mission-toast__title">${escapeHtml(title)}</span>`;
  host.appendChild(toast);
  void toast.offsetWidth;
  toast.classList.add('is-visible');
  const later = globalThis.setTimeout.bind(globalThis);
  later(() => {
    toast.classList.remove('is-visible');
    toast.classList.add('is-leaving');
    later(() => toast.remove?.(), 280);
  }, TOAST_MS);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function flashObjective(el, body) {
  const bodyEl = el.querySelector('[data-mt-body]');
  if (!bodyEl) return;
  bodyEl.classList.remove('is-flash');
  void bodyEl.offsetWidth;
  bodyEl.classList.add('is-flash');
  bodyEl.textContent = body;
  globalThis.setTimeout(() => bodyEl.classList.remove('is-flash'), OBJECTIVE_FLASH_MS);
}

export class MissionTracker {
  constructor() {
    this._sig = '';
    this._questId = null;
    this._objectiveId = null;
    this._wasComplete = false;
    this._primed = false;
    ensureMissionTrackerDom();
  }

  render(quest, opts = {}) {
    const el = ensureMissionTrackerDom();
    if (!el) return;

    const content = formatTrackerContent(quest);
    const objective = quest?.objectives?.find((o) => !o.done) || null;
    const questId = quest?.id || null;
    const objectiveId = objective?.id || null;
    const sig = `${questId}|${objectiveId}|${content.body}|${content.progress}|${content.done}|${content.empty}`;

    if (!opts.force && sig === this._sig) return;

    const prevQuestId = this._questId;
    const prevObjectiveId = this._objectiveId;
    const announce = this._primed;

    if (announce && prevQuestId && (!quest || quest.id !== prevQuestId) && !this._wasComplete) {
      const titleEl = el.querySelector('[data-mt-title]');
      showMissionToast('complete', titleEl?.textContent || 'Missão');
    }

    if (announce && quest && questId !== prevQuestId && !content.empty) {
      showMissionToast('new', content.title);
      setCollapsed(false, { silent: true });
      writeSessionCollapsed(false);
    }

    const objectiveAdvanced =
      announce &&
      quest &&
      questId === prevQuestId &&
      objectiveId &&
      prevObjectiveId &&
      objectiveId !== prevObjectiveId;

    if (objectiveAdvanced) {
      flashObjective(el, content.body);
      showMissionToast('update', content.body);
    }

    const titleEl = el.querySelector('[data-mt-title]');
    const bodyEl = el.querySelector('[data-mt-body]');
    const progressEl = el.querySelector('[data-mt-progress]');

    if (content.empty) {
      el.classList.add('is-empty');
      el.classList.remove('is-done');
      if (titleEl) titleEl.textContent = 'Missões';
      if (bodyEl) bodyEl.textContent = content.body;
      if (progressEl) {
        progressEl.hidden = true;
        progressEl.textContent = '';
      }
    } else {
      el.classList.remove('is-empty');
      el.classList.toggle('is-done', content.done);
      if (titleEl) titleEl.textContent = content.title;
      if (bodyEl && !objectiveAdvanced) bodyEl.textContent = content.body;
      if (progressEl) {
        if (content.progress) {
          progressEl.hidden = false;
          progressEl.textContent = content.progress;
        } else {
          progressEl.hidden = true;
          progressEl.textContent = '';
        }
      }
    }

    this._sig = sig;
    this._questId = questId;
    this._objectiveId = objectiveId;
    this._wasComplete = Boolean(content.done || content.empty);
    this._primed = true;
  }
}
