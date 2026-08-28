import { Enemy } from './enemy.js';
export class MiniBoss extends Enemy{ constructor(d){ super({...d, hp:d.hp*2}); this.mini=true } }
