export class Sword{ constructor(){ this.combo=0; this.last=0 } attack(now){ if(now-this.last>0.8) this.combo=0; this.combo=(this.combo+1)%4; this.last=now; return this.combo } }
