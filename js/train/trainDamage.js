export class TrainDamage{ constructor(train){ this.train=train } damage(n){ this.train.integrity=Math.max(0,this.train.integrity-n) } }
