/** Lightweight WebSocket client. World-authoritative actions stay on the server. */
export class Multiplayer {
  constructor(){ this.socket=null; this.connected=false; this.playerId=null; this.roomCode=null; this.handlers=new Set(); this.seq=0; this.reconnectToken=null; this.url=null; this.reconnectAttempts=0; this.intentionalClose=false;this.hostId=null;this.role='crew'; }
  onMessage(handler){ this.handlers.add(handler); return ()=>this.handlers.delete(handler); }
  connect(url){
    return new Promise((resolve,reject)=>{
      this.url=url; this.intentionalClose=false; const socket=new WebSocket(url); this.socket=socket;
      socket.onopen=()=>{ this.connected=true; resolve(); };
      socket.onerror=()=>reject(new Error('Não foi possível conectar ao servidor multiplayer.'));
      socket.onclose=()=>{ this.connected=false; if(!this.intentionalClose&&this.reconnectAttempts<5){const delay=Math.min(8000,500*2**this.reconnectAttempts++);setTimeout(()=>this.connect(this.url).catch(()=>{}),delay)}else this.roomCode=null; };
      socket.onmessage=(event)=>{
        let message; try { message=JSON.parse(event.data); } catch { return; }
        if(message.type==='WELCOME'){ this.playerId=message.payload.playerId; this.reconnectToken=message.payload.reconnectToken; this.reconnectAttempts=0; }
        if(['ROOM_CREATED','JOINED'].includes(message.type)){this.roomCode=message.payload.code;this.hostId=message.payload.hostId;this.role=message.payload.role||'host'}if(message.type==='PLAYER_LEFT'&&message.payload.hostId)this.hostId=message.payload.hostId;
        this.handlers.forEach(handler=>handler(message));
      };
    });
  }
  send(type,payload={}){ if(this.connected && this.socket.readyState===WebSocket.OPEN) this.socket.send(JSON.stringify({type,payload,seq:this.seq++})); }
  createRoom(name,maxPlayers,options={}){ this.send('CREATE_ROOM',{name,maxPlayers,...options}); }
  join(code,password='',role='crew'){ this.send('JOIN',{roomCode:code.trim().toUpperCase(),password,role}); }
  sendState(state){ this.send('PLAYER_STATE',state); }
  sendTrain(state){this.send('TRAIN_STATE',state)}
  sendWorld(state){this.send('WORLD_STATE',state)}
  chat(text,channel='group'){this.send('CHAT',{text,channel})}
  get isHost(){return this.playerId===this.hostId}
  close(){ this.intentionalClose=true; this.socket?.close(); }
}
