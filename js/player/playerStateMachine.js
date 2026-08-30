export const PLAYER_STATES = Object.freeze({
  ON_FOOT: 'ON_FOOT',
  COMBAT: 'COMBAT',
  ENTERING_TRAIN: 'ENTERING_TRAIN',
  IN_TRAIN: 'IN_TRAIN',
  DRIVING: 'DRIVING',
  CUTSCENE: 'CUTSCENE',
  MENU: 'MENU',
  DEAD: 'DEAD',
});

const TRANSITIONS = Object.freeze({
  [PLAYER_STATES.ON_FOOT]: new Set([
    PLAYER_STATES.COMBAT,
    PLAYER_STATES.ENTERING_TRAIN,
    PLAYER_STATES.CUTSCENE,
    PLAYER_STATES.MENU,
    PLAYER_STATES.DEAD,
  ]),
  [PLAYER_STATES.COMBAT]: new Set([
    PLAYER_STATES.ON_FOOT,
    PLAYER_STATES.CUTSCENE,
    PLAYER_STATES.MENU,
    PLAYER_STATES.DEAD,
  ]),
  [PLAYER_STATES.ENTERING_TRAIN]: new Set([
    PLAYER_STATES.ON_FOOT,
    PLAYER_STATES.IN_TRAIN,
    PLAYER_STATES.CUTSCENE,
    PLAYER_STATES.DEAD,
  ]),
  [PLAYER_STATES.IN_TRAIN]: new Set([
    PLAYER_STATES.ON_FOOT,
    PLAYER_STATES.DRIVING,
    PLAYER_STATES.CUTSCENE,
    PLAYER_STATES.MENU,
    PLAYER_STATES.DEAD,
  ]),
  [PLAYER_STATES.DRIVING]: new Set([
    PLAYER_STATES.ON_FOOT,
    PLAYER_STATES.IN_TRAIN,
    PLAYER_STATES.CUTSCENE,
    PLAYER_STATES.MENU,
    PLAYER_STATES.DEAD,
  ]),
  [PLAYER_STATES.CUTSCENE]: new Set([
    PLAYER_STATES.ON_FOOT,
    PLAYER_STATES.COMBAT,
    PLAYER_STATES.ENTERING_TRAIN,
    PLAYER_STATES.IN_TRAIN,
    PLAYER_STATES.DRIVING,
    PLAYER_STATES.MENU,
    PLAYER_STATES.DEAD,
  ]),
  [PLAYER_STATES.MENU]: new Set([
    PLAYER_STATES.ON_FOOT,
    PLAYER_STATES.COMBAT,
    PLAYER_STATES.ENTERING_TRAIN,
    PLAYER_STATES.IN_TRAIN,
    PLAYER_STATES.DRIVING,
    PLAYER_STATES.CUTSCENE,
    PLAYER_STATES.DEAD,
  ]),
  [PLAYER_STATES.DEAD]: new Set([PLAYER_STATES.ON_FOOT]),
});

const MOVEMENT_STATES = new Set([PLAYER_STATES.ON_FOOT, PLAYER_STATES.COMBAT]);
const COMBAT_STATES = new Set([PLAYER_STATES.ON_FOOT, PLAYER_STATES.COMBAT]);
const TRAIN_STATES = new Set([
  PLAYER_STATES.ENTERING_TRAIN,
  PLAYER_STATES.IN_TRAIN,
  PLAYER_STATES.DRIVING,
]);
const PAUSED_STATES = new Set([
  PLAYER_STATES.CUTSCENE,
  PLAYER_STATES.MENU,
  PLAYER_STATES.DEAD,
]);

export class PlayerStateMachine {
  constructor(initialState = PLAYER_STATES.ON_FOOT, onTransition = null) {
    if (!TRANSITIONS[initialState]) throw new TypeError(`Estado inicial inválido: ${initialState}`);
    this.state = initialState;
    this.previousState = null;
    this.onTransition = onTransition;
  }

  is(...states) {
    return states.includes(this.state);
  }

  canTransition(nextState) {
    return nextState === this.state || Boolean(TRANSITIONS[this.state]?.has(nextState));
  }

  transition(nextState, context = {}) {
    if (!TRANSITIONS[nextState]) throw new TypeError(`Estado inválido: ${nextState}`);
    if (nextState === this.state) return false;
    if (!this.canTransition(nextState)) return false;

    const previousState = this.state;
    this.previousState = previousState;
    this.state = nextState;
    this.onTransition?.({ previousState, state: nextState, context });
    return true;
  }

  get canMove() {
    return MOVEMENT_STATES.has(this.state);
  }

  get canCombat() {
    return COMBAT_STATES.has(this.state);
  }

  get isInTrain() {
    return TRAIN_STATES.has(this.state);
  }

  get isPaused() {
    return PAUSED_STATES.has(this.state);
  }
}
