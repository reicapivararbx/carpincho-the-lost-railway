export class SaveManager{
  key='carpincho_save';
  save(data){
    try{
      localStorage.setItem(this.key, JSON.stringify({v:'0.1.0',data,ts:Date.now()}));
      if(window.indexedDB){
        const req=indexedDB.open('carpincho',1);
        req.onupgradeneeded=e=>{ const db=e.target.result; if(!db.objectStoreNames.contains('saves')) db.createObjectStore('saves') };
        req.onsuccess=e=>{ const db=e.target.result; const tx=db.transaction('saves','readwrite'); tx.objectStore('saves').put({id:'main',data},'main') };
      }
      return true;
    }catch{ return false }
  }
  load(){
    try{ const raw=localStorage.getItem(this.key); if(!raw) return null; return JSON.parse(raw).data }catch{ return null }
  }
  has(){ return !!localStorage.getItem(this.key) }
}
