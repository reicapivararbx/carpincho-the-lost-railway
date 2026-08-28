export class Reputation{ constructor(){ this.map=new Map() } level(r){ return this.map.get(r)||0 } add(r,n){ this.map.set(r,(this.map.get(r)||0)+n) } }
