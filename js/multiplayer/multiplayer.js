/** Lightweight WebSocket client. World-authoritative actions stay on the server. */
export class Multiplayer {
  constructor(){ this.socket=null; this.connected=false; this.playerId=null; this.roomCode=null; this.handlers=new Set(); }
  onMessage(handler){ this.handlers.add(handler); return ()=>this.handlers.delete(handler); }
  connect(url){
    return new Promise((resolve,reject)=>{
      const socket=new WebSocket(url); this.socket=socket;
      socket.onopen=()=>{ this.connected=true; resolve(); };
      socket.onerror=()=>reject(new Error('Não foi possível conectar ao servidor multiplayer.'));
      socket.onclose=()=>{ this.connected=false; this.roomCode=null; };
      socket.onmessage=(event)=>{
        let message; try { message=JSON.parse(event.data); } catch { return; }
        if(message.type==='WELCOME') this.playerId=message.payload.playerId;
        if(['ROOM_CREATED','JOINED'].includes(message.type)) this.roomCode=message.payload.code;
        this.handlers.forEach(handler=>handler(message));
      };
    });
  }
  send(type,payload={}){ if(this.connected && this.socket.readyState===WebSocket.OPEN) this.socket.send(JSON.stringify({type,payload})); }
  createRoom(name,maxPlayers){ this.send('CREATE_ROOM',{name,maxPlayers}); }
  join(code){ this.send('JOIN',{roomCode:code.trim().toUpperCase()}); }
  sendState(state){ this.send('PLAYER_STATE',state); }
  close(){ this.socket?.close(); }
}
