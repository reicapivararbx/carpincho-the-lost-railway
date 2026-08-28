import { Enemy } from './enemy.js';
export class Elite extends Enemy{ constructor(d){ super({...d, hp:d.hp*1.5, damage:d.damage*1.5}); this.elite=true } }
