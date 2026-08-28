import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const server = createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end('<h1>CARPINCHO MP Server</h1><p>WS autoritativo ativo em :3000</p>');
});
const wss = new WebSocketServer({ server });

const rooms = new Map(); // code -> {code, players: Map<id, ws>, max}
const players = new Map(); // ws -> {id, name, room}

function genCode(){ return Math.random().toString(36).slice(2,6).toUpperCase(); }
function validateDamage(weaponId){
  const damages={sword_iron:15,pistol_basic:25};
  return damages[weaponId]||10;
}
function validateCraft(recipe, inv){
  // stub: check station/level in real DB
  return true;
}

wss.on('connection', ws=>{
  const id='p_'+Math.random().toString(36).slice(2,7);
  players.set(ws,{id, room:null});
  ws.send(JSON.stringify({type:'WELCOME', payload:{playerId:id}}));

  ws.on('message', raw=>{
    let msg; try{ msg=JSON.parse(raw) }catch{ return }
    const {type,payload}=msg;
    const pl=players.get(ws);

    if(type==='CREATE_ROOM'){
      const code=genCode();
      rooms.set(code,{code, name:payload?.name||'Sala', max:payload?.maxPlayers||4, players:new Map([[id, ws]])});
      pl.room=code;
      ws.send(JSON.stringify({type:'ROOM_CREATED', payload:{code}}));
    } else if(type==='JOIN'){
      const room=rooms.get(payload?.roomCode);
      if(!room) return ws.send(JSON.stringify({type:'ERROR', payload:{msg:'Sala não existe'}}));
      if(room.players.size>=room.max) return ws.send(JSON.stringify({type:'ERROR', payload:{msg:'Sala cheia'}}));
      room.players.set(id, ws); pl.room=room.code;
      ws.send(JSON.stringify({type:'JOINED', payload:{code:room.code}}));
      room.players.forEach((other,oid)=>{ if(oid!==id) other.send(JSON.stringify({type:'PLAYER_JOINED', payload:{playerId:id}})) });
    } else if(type==='PLAYER_STATE'){
      const room=pl.room && rooms.get(pl.room);
      if(!room) return;
      // Reject malformed or impossible client movement before relaying it.
      if(!payload || !['x','z','speed'].every(key=>Number.isFinite(payload[key]))) return;
      if(Math.abs(payload.x)>100 || Math.abs(payload.z)>100 || payload.speed<0 || payload.speed>15) return;
      room.players.forEach((other,oid)=>{ if(oid!==id) other.send(JSON.stringify({type:'PLAYER_STATE', payload:{playerId:id,...payload}})) });
    } else if(type==='DAMAGE_REQUEST'){
      const dmg=validateDamage(payload.weaponId);
      // server authoritative: compute hp? stub broadcast
      const room=pl.room && rooms.get(pl.room);
      if(room) room.players.forEach(o=> o.send(JSON.stringify({type:'DAMAGE_RESULT', payload:{targetId:payload.targetId, damage:dmg, from:id}})));
    } else if(type==='CRAFT_REQUEST'){
      if(!validateCraft(payload.recipeId, payload.inv)) return ws.send(JSON.stringify({type:'CRAFT_RESULT', payload:{ok:false, reason:'validação falhou'}}));
      ws.send(JSON.stringify({type:'CRAFT_RESULT', payload:{ok:true, recipeId:payload.recipeId}}));
    } else if(type==='CHAT'){
      const room=pl.room && rooms.get(pl.room);
      const text=(payload.text||'').slice(0,200);
      if(room) room.players.forEach(o=> o.send(JSON.stringify({type:'CHAT', payload:{from:id, channel:payload.channel||'group', text}})));
    }
  });

  ws.on('close',()=>{
    const pl=players.get(ws); if(pl?.room){ const room=rooms.get(pl.room); if(room){ room.players.delete(pl.id); if(room.players.size===0) rooms.delete(room.code); } }
    players.delete(ws);
  });
});

server.listen(PORT, ()=> console.log(`[MP] CARPINCHO autoritativo em ws://localhost:${PORT}`));
