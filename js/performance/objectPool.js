export class ObjectPool{
  constructor(factory,{initial=0,reset=()=>{}}={}){this.factory=factory;this.reset=reset;this.available=[];this.active=new Set();for(let i=0;i<initial;i++)this.available.push(factory())}
  acquire(data){const object=this.available.pop()||this.factory();this.reset(object,data,true);this.active.add(object);return object}
  release(object){if(!this.active.delete(object))return false;this.reset(object,null,false);this.available.push(object);return true}
  releaseAll(){[...this.active].forEach(object=>this.release(object))}
}
