import { migrate } from './migration.js';
import { validate } from './validation.js';

export class SaveManager{
  key='carpincho_save';
  save(data){
    try{
      const payload={v:'0.1.0',data,ts:Date.now()};
      const serialized=JSON.stringify(payload);
      const previous=localStorage.getItem(this.key); if(previous) localStorage.setItem(this.key+':backup',previous);
      localStorage.setItem(this.key, serialized);
      if(window.indexedDB){
        const req=indexedDB.open('carpincho',1);
        req.onupgradeneeded=e=>{ const db=e.target.result; if(!db.objectStoreNames.contains('saves')) db.createObjectStore('saves') };
        req.onsuccess=e=>{ const db=e.target.result; const tx=db.transaction('saves','readwrite'); tx.objectStore('saves').put({id:'main',data},'main') };
      }
      return true;
    }catch{ return false }
  }
  load(){
    try{
      const raw=localStorage.getItem(this.key) || localStorage.getItem(this.key+':backup');
      if(!raw) return null; const parsed=JSON.parse(raw); const data=migrate(parsed?.data,parsed?.v);
      return validate(data)?data:null;
    }catch{ return null }
  }
  has(){ return !!localStorage.getItem(this.key) }
}
