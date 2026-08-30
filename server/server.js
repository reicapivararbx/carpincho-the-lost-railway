import { createServer } from 'http';
import { WebSocketServer,WebSocket } from 'ws';
import { Authority } from './authority.js';

const PORT=process.env.PORT||3000,authority=new Authority(),sockets=new Map();
const server=createServer((req,res)=>{res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({service:'carpincho-multiplayer',status:'ok',rooms:authority.rooms.size}))});
const wss=new WebSocketServer({server});
const send=(ws,type,payload)=>{if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type,payload}))};
const roomSockets=room=>[...room.players].map(id=>sockets.get(id)).filter(Boolean);
const broadcast=(room,type,payload,except=null)=>roomSockets(room).forEach(ws=>{if(ws!==except)send(ws,type,payload)});

wss.on('connection',ws=>{
  const id=`p_${Math.random().toString(36).slice(2,8)}`,player=authority.addPlayer(id);sockets.set(id,ws);ws.playerId=id;send(ws,'WELCOME',{playerId:id,reconnectToken:player.reconnectToken});
  ws.on('message',raw=>{
    let message;try{message=JSON.parse(raw)}catch{return send(ws,'ERROR',{msg:'JSON inválido'})}const {type,payload={}}=message,p=authority.players.get(ws.playerId);if(!p)return;
    if(type==='CREATE_ROOM'){const room=authority.createRoom(p.id,payload);send(ws,'ROOM_CREATED',{code:room.code,hostId:room.hostId,private:room.private})}
    else if(type==='JOIN'){const result=authority.joinRoom(p.id,payload);if(!result.ok)return send(ws,'ERROR',{msg:result.reason});send(ws,'JOINED',{code:result.room.code,hostId:result.room.hostId,role:result.room.roles.get(p.id),world:result.room.world});broadcast(result.room,'PLAYER_JOINED',{playerId:p.id,name:p.name},ws)}
    else if(type==='PLAYER_STATE'){const result=authority.playerState(p.id,payload);if(!result.ok)return send(ws,'ERROR',{msg:result.reason});const room=authority.rooms.get(p.room);if(room)broadcast(room,'PLAYER_STATE',result.state,ws)}
    else if(type==='TRAIN_STATE'){const room=authority.rooms.get(p.room);if(!room)return;if(room.hostId!==p.id)return send(ws,'ERROR',{msg:'somente host controla o trem'});if(!['x','z','speed','fuel'].every(key=>Number.isFinite(payload[key]))||payload.speed<0||payload.speed>12||payload.fuel<0||payload.fuel>100)return send(ws,'ERROR',{msg:'estado de trem inválido'});room.world.train={...room.world.train,...payload};room.world.revision++;broadcast(room,'TRAIN_STATE',{...room.world.train,revision:room.world.revision},ws)}
    else if(type==='WORLD_STATE'){const room=authority.rooms.get(p.room);if(!room||room.hostId!==p.id)return send(ws,'ERROR',{msg:'mundo somente pelo host'});const safeList=list=>Array.isArray(list)?list.slice(0,64).filter(item=>typeof item.id==='string'&&Number.isFinite(item.x)&&Number.isFinite(item.z)&&Number.isFinite(item.hp)).map(item=>({id:item.id,x:item.x,z:item.z,hp:Math.max(0,item.hp),state:String(item.state||'IDLE')})):[];room.world.mobs=safeList(payload.mobs);room.world.bosses=safeList(payload.bosses);room.world.events=Array.isArray(payload.events)?payload.events.slice(-16):[];room.world.revision++;broadcast(room,'WORLD_STATE',{mobs:room.world.mobs,bosses:room.world.bosses,events:room.world.events,revision:room.world.revision},ws)}
    else if(type==='DAMAGE_REQUEST'){const result=authority.damage(p.id,{...payload,seq:message.seq??payload.seq});send(ws,result.ok?'DAMAGE_RESULT':'ERROR',result.ok?result:{msg:result.reason});const room=authority.rooms.get(p.room);if(result.ok&&room)broadcast(room,'DAMAGE_RESULT',result,ws)}
    else if(type==='CRAFT_REQUEST'){const result=authority.craft(p.id,{...payload,seq:message.seq??payload.seq});send(ws,'CRAFT_RESULT',result)}
    else if(type==='LOOT_PICKUP'){const result=authority.loot(p.id,{...payload,seq:message.seq??payload.seq});send(ws,result.ok?'LOOT_RESULT':'ERROR',result.ok?result:{msg:result.reason})}
    else if(type==='UPGRADE_REQUEST'){const result=authority.spend(p.id,payload);send(ws,result.ok?'UPGRADE_RESULT':'ERROR',result.ok?result:{msg:result.reason})}
    else if(type==='CHAT'){const result=authority.chat(p.id,payload),room=authority.rooms.get(p.room);if(result.ok&&room)roomSockets(room).forEach(client=>{const other=authority.players.get(client.playerId);if(result.message.channel!=='proximity'||Math.hypot(other.x-p.x,other.z-p.z)<=20)send(client,'CHAT',result.message)})}
    else send(ws,'ERROR',{msg:'mensagem desconhecida'});
  });
  ws.on('close',()=>{const room=authority.leave(ws.playerId);authority.savePlayer(ws.playerId);if(room){authority.saveRoom(room.code);broadcast(room,'PLAYER_LEFT',{playerId:ws.playerId,hostId:room.hostId})}sockets.delete(ws.playerId)});
});

server.listen(PORT,()=>console.log(`[MP] CARPINCHO autoritativo em ws://localhost:${PORT}`));
