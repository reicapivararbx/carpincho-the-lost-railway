export class FogOfWar{
  constructor({cellSize=16}={}){this.cellSize=cellSize;this.revealed=new Set();this.markers=new Map()}
  key(x,z){return `${Math.floor(x/this.cellSize)}:${Math.floor(z/this.cellSize)}`}
  reveal(position,radius=1){const cx=Math.floor(position.x/this.cellSize),cz=Math.floor(position.z/this.cellSize),fresh=[];for(let x=cx-radius;x<=cx+radius;x++)for(let z=cz-radius;z<=cz+radius;z++){const key=`${x}:${z}`;if(!this.revealed.has(key)){this.revealed.add(key);fresh.push(key)}}return fresh}
  isRevealed(position){return this.revealed.has(this.key(position.x,position.z))}
  addMarker(id,marker){this.markers.set(id,{id,...marker})}
  visibleMarkers(){return [...this.markers.values()].filter(marker=>this.isRevealed(marker))}
  toJSON(){return {revealed:[...this.revealed],markers:[...this.markers]}}
  fromJSON(data={}){this.revealed=new Set(data.revealed||[]);this.markers=new Map(data.markers||[])}
}
