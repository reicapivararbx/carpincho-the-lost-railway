import { migrate } from './migration.js';
import { validate,checksum } from './validation.js';

export class SaveManager{
  key='carpincho_save';
  save(data){
    try{
      if(!validate(data))return false;
      const content=JSON.stringify(data); const payload={v:'1.0.0',playerData:data.player,worldData:data.world||{},data,meta:{ts:Date.now(),checksum:checksum(content)}};
      const serialized=JSON.stringify(payload);
      const previous=localStorage.getItem(this.key); if(previous) localStorage.setItem(this.key+':backup',previous);
      localStorage.setItem(this.key, serialized);
      if(globalThis.indexedDB){
        const req=globalThis.indexedDB.open('carpincho',1);
        req.onupgradeneeded=e=>{ const db=e.target.result; if(!db.objectStoreNames.contains('saves')) db.createObjectStore('saves') };
        req.onsuccess=e=>{ const db=e.target.result; const tx=db.transaction('saves','readwrite'); tx.objectStore('saves').put({id:'main',data},'main') };
      }
      return true;
    }catch{ return false }
  }
  load(){
    try{
      const raw=localStorage.getItem(this.key) || localStorage.getItem(this.key+':backup');
      if(!raw) return null; const parsed=JSON.parse(raw); const rawData=parsed?.data||{player:parsed?.playerData,world:parsed?.worldData};
      if(parsed?.meta?.checksum&&checksum(JSON.stringify(rawData))!==parsed.meta.checksum){const backup=localStorage.getItem(this.key+':backup');if(backup&&backup!==raw){const restored=JSON.parse(backup);return validate(restored.data)?migrate(restored.data,restored.v):null}return null}
      const data=migrate(rawData,parsed?.v); return validate(data)?data:null;
    }catch{ return null }
  }
  has(){ return !!localStorage.getItem(this.key) }
}
