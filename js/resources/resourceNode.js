export class ResourceNode{
  constructor({id,type,x,y,z,hp=3,tier=0,drops=[]}){
    this.id=id; this.type=type; this.x=x; this.y=y; this.z=z; this.hp=hp; this.maxHp=hp; this.tier=tier; this.drops=drops; this.depleted=false;
  }
  damage(n){ this.hp-=n; if(this.hp<=0){ this.depleted=true; return true } return false }
}
