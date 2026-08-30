export class ResourceNode{
  constructor({id,type,x=0,y=0,z=0,hp=3,tier=0,tool='pick',drops=[],respawnTime=30000}){
    this.id=id; this.type=type; this.x=x; this.y=y; this.z=z; this.hp=hp; this.maxHp=hp; this.tier=tier; this.tool=tool; this.drops=drops; this.respawnTime=respawnTime; this.depleted=false;
  }
  hit({tool,tier=-1,power=1,random=Math.random}={}){
    if(this.depleted) return {ok:false,reason:'recurso esgotado'};
    if(tool!==this.tool) return {ok:false,reason:`precisa de ${this.tool==='axe'?'machado':'picareta'}`};
    if(tier<this.tier) return {ok:false,reason:`ferramenta tier ${this.tier} necessária`};
    this.hp=Math.max(0,this.hp-Math.max(.1,Number(power)||1));
    if(this.hp>0) return {ok:true,depleted:false,hp:this.hp,ratio:this.hp/this.maxHp,drops:[]};
    this.depleted=true;
    const drops=this.drops.filter(drop=>random()<=(drop.chance??1)).map(drop=>({id:drop.item,amount:typeof drop.amount==='number'?drop.amount:drop.amount[0]+Math.floor(random()*(drop.amount[1]-drop.amount[0]+1))}));
    return {ok:true,depleted:true,hp:0,ratio:0,drops};
  }
  damage(n){ this.hp=Math.max(0,this.hp-n); if(this.hp<=0){ this.depleted=true; return true } return false }
  respawn(){ this.hp=this.maxHp; this.depleted=false; }
}
