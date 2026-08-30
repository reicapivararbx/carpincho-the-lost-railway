export class WorldStreaming{
  constructor({chunkSize=32,loadRadius=2,onLoad,onUnload,createChunk}={}){
    this.chunkSize=chunkSize; this.loadRadius=loadRadius; this.chunks=new Map();
    this.onLoad=onLoad; this.onUnload=onUnload; this.createChunk=createChunk;
  }
  key(cx,cz){ return `${cx}:${cz}` }
  update(playerPos={x:0,z:0}){
    const cx=Math.floor((Number(playerPos.x)||0)/this.chunkSize);
    const cz=Math.floor((Number(playerPos.z)||0)/this.chunkSize);
    const wanted=new Set();
    for(let x=cx-this.loadRadius;x<=cx+this.loadRadius;x++) for(let z=cz-this.loadRadius;z<=cz+this.loadRadius;z++) wanted.add(this.key(x,z));
    const loaded=[]; const unloaded=[];
    for(const key of wanted) if(!this.chunks.has(key)){ const chunk={key,cx:Number(key.split(':')[0]),cz:Number(key.split(':')[1]),active:true,objects:[],lod:0}; const generated=this.createChunk?.(chunk);if(generated)Object.assign(chunk,generated);this.chunks.set(key,chunk);loaded.push(chunk);this.onLoad?.(chunk); }
    for(const [key,chunk] of this.chunks){ if(!wanted.has(key)){ this.chunks.delete(key); chunk.active=false; chunk.objects?.forEach(object=>{if(object)object.visible=false}); unloaded.push(chunk); this.onUnload?.(chunk); } }
    return {center:{cx,cz},loaded,unloaded,active:[...this.chunks.values()]};
  }
  setLoadRadius(radius){this.loadRadius=Math.max(1,Math.min(5,Math.round(radius)));}
}
