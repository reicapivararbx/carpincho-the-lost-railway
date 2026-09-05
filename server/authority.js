import { RecipeDB } from '../js/data/recipes.js';
import { ItemDB } from '../js/data/items.js';
import { calcDamage } from '../js/combat/damage.js';

const WEAPONS={sword_iron:{damage:15,cooldown:320,ammo:false},pistol_basic:{damage:25,cooldown:220,ammo:true}};
const cleanText=text=>String(text||'').replace(/<[^>]*>/g,'').replace(/\b(?:idiota|burro|spam)\b/gi,'***').trim().slice(0,200);
const token=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);

export function createPlayer(id,name='Carpincho'){
  return {id,name:cleanText(name).slice(0,24)||'Carpincho',hp:100,maxHp:100,x:0,z:0,speed:0,inventory:{wood:8,ammo_pistol:36},ammo:{mag:6,reserve:36},xp:0,coins:100,quests:{},upgrades:[],lastAction:{},lastStateAt:Date.now(),hasState:false,reconnectToken:token()};
}
export class Authority{
  constructor({now=()=>Date.now(),random=Math.random}={}){this.now=now;this.random=random;this.rooms=new Map();this.players=new Map();this.usedSeq=new Map();this.worldSaves=new Map();this.playerSaves=new Map()}
  roomCode(){let code;do code=this.random().toString(36).slice(2,6).toUpperCase().padEnd(4,'X');while(this.rooms.has(code));return code}
  addPlayer(id,name){const player=createPlayer(id,name);this.players.set(id,player);return player}
  createRoom(playerId,{name='Sala',maxPlayers=4,private:privateRoom=false,password='',serverId=null,portalServerId=null}={}){
    const preferred = String(portalServerId||serverId||'').trim();
    let code;
    if(preferred && preferred.length===4 && !this.rooms.has(preferred.toUpperCase())){
      code=preferred.toUpperCase();
    } else {
      code=this.roomCode();
    }
    const room={
      code,
      name:cleanText(name).slice(0,30),
      max:Math.max(2,Math.min(8,Number(maxPlayers)||4)),
      private:Boolean(privateRoom),
      password:privateRoom?String(password).slice(0,40):'',
      hostId:playerId,
      players:new Set([playerId]),
      roles:new Map([[playerId,'host']]),
      portalServerId: preferred || null,
      world:{train:{x:0,z:10,speed:0,fuel:80},mobs:{},bosses:{},loot:{},events:[],revision:0},
    };
    this.rooms.set(code,room);
    this.players.get(playerId).room=code;
    return room;
  }
  joinRoom(playerId,{roomCode,password='',role='crew',serverId=null}={}){
    let room=this.rooms.get(String(roomCode||'').toUpperCase());
    if(!room && serverId){
      for(const r of this.rooms.values()){
        if(r.portalServerId && String(r.portalServerId)===String(serverId)){ room=r; break; }
      }
    }
    if(!room)return {ok:false,reason:'Sala não existe'};
    if(room.players.size>=room.max)return {ok:false,reason:'Sala cheia'};
    if(room.private&&room.password!==String(password))return {ok:false,reason:'Senha inválida'};
    room.players.add(playerId);
    room.roles.set(playerId,['crew','engineer','guard','scout'].includes(role)?role:'crew');
    this.players.get(playerId).room=room.code;
    return {ok:true,room};
  }
  leave(playerId){
    const player=this.players.get(playerId),room=this.rooms.get(player?.room);
    if(!room)return null;
    room.players.delete(playerId);
    room.roles.delete(playerId);
    if(room.hostId===playerId){
      room.hostId=room.players.values().next().value||null;
      if(room.hostId)room.roles.set(room.hostId,'host');
    }
    const emptied=!room.players.size;
    if(emptied)this.rooms.delete(room.code);
    player.room=null;
    room._emptied=emptied;
    return room;
  }
  checkSeq(playerId,seq){if(!Number.isSafeInteger(seq)||seq<0)return false;const key=`${playerId}:${seq}`;if(this.usedSeq.has(key))return false;this.usedSeq.set(key,this.now());return true}
  playerState(playerId,payload){const p=this.players.get(playerId);if(!p||!payload||!['x','z','speed'].every(key=>Number.isFinite(payload[key])))return {ok:false,reason:'estado inválido'};if(Math.abs(payload.x)>10000||Math.abs(payload.z)>10000||payload.speed<0||payload.speed>6.5)return {ok:false,reason:'velocidade impossível'};const elapsed=Math.min(1.5,Math.max(.01,(this.now()-p.lastStateAt)/1000)),distance=Math.hypot(payload.x-p.x,payload.z-p.z);if(p.hasState&&distance>6.5*elapsed+2.5)return {ok:false,reason:'movimento impossível'};Object.assign(p,{x:payload.x,z:payload.z,speed:payload.speed,lastStateAt:this.now(),hasState:true});return {ok:true,state:{playerId,...payload,hp:p.hp}}}
  craft(playerId,{recipeId,station='hand',level=1,seq}={}){const p=this.players.get(playerId);if(!p||!this.checkSeq(playerId,seq))return {ok:false,reason:'sequência duplicada'};const recipe=RecipeDB.lookup(recipeId);if(!recipe)return {ok:false,reason:'receita inexistente'};if(recipe.stationRequired!==station)return {ok:false,reason:'estação inválida'};if(level<recipe.levelRequired)return {ok:false,reason:'nível insuficiente'};for(const ingredient of recipe.ingredients)if((p.inventory[ingredient.item]||0)<ingredient.amount)return {ok:false,reason:`ingrediente insuficiente: ${ingredient.item}`};for(const ingredient of recipe.ingredients)p.inventory[ingredient.item]-=ingredient.amount;p.inventory[recipe.output]=(p.inventory[recipe.output]||0)+recipe.outputQuantity;return {ok:true,output:recipe.output,outputQuantity:recipe.outputQuantity,inventory:{...p.inventory}}}
  damage(playerId,{targetId,weaponId,seq,distance=0}={}){const p=this.players.get(playerId),target=this.players.get(targetId),weapon=WEAPONS[weaponId];if(!p||!target||!weapon||!this.checkSeq(playerId,seq))return {ok:false,reason:'pedido de dano inválido'};const now=this.now();if(now-(p.lastAction.damage||0)<weapon.cooldown)return {ok:false,reason:'ataque impossível'};if(distance>(weaponId==='sword_iron'?2.4:32))return {ok:false,reason:'alcance impossível'};if(weapon.ammo){if(p.ammo.mag<=0)return {ok:false,reason:'sem munição'};p.ammo.mag--}p.lastAction.damage=now;const applied=calcDamage(weapon.damage,target.defense||0);target.hp=Math.max(0,target.hp-applied);return {ok:true,targetId,targetHp:target.hp,damage:applied,ammo:{...p.ammo}}}
  loot(playerId,{lootId,seq}={}){const p=this.players.get(playerId),room=this.rooms.get(p?.room),loot=room?.world.loot[lootId];if(!p||!loot||!this.checkSeq(playerId,seq))return {ok:false,reason:'loot inválido'};if(loot.claimed||Math.hypot(p.x-loot.x,p.z-loot.z)>3)return {ok:false,reason:'loot indisponível'};loot.claimed=playerId;p.inventory[loot.item]=(p.inventory[loot.item]||0)+loot.amount;return {ok:true,item:loot.item,amount:loot.amount}}
  updateQuest(playerId,{questId,objectiveId,amount=1,serverEvent=false}={}){if(!serverEvent)return {ok:false,reason:'quest somente pelo servidor'};const p=this.players.get(playerId);if(!p)return {ok:false};p.quests[questId]??={};p.quests[questId][objectiveId]=(p.quests[questId][objectiveId]||0)+amount;return {ok:true,quests:p.quests}}
  spend(playerId,{coins=0,upgrade}={}){const p=this.players.get(playerId);if(!p||!Number.isFinite(coins)||coins<0||p.coins<coins||typeof upgrade!=='string')return {ok:false,reason:'transação inválida'};if(p.upgrades.includes(upgrade))return {ok:false,reason:'upgrade duplicado'};p.coins-=coins;p.upgrades.push(upgrade);return {ok:true,coins:p.coins,upgrades:[...p.upgrades]}}
  chat(playerId,{text,channel='group'}={}){const p=this.players.get(playerId);if(!p)return {ok:false};return {ok:true,message:{from:playerId,channel:['group','proximity'].includes(channel)?channel:'group',text:cleanText(text),x:p.x,z:p.z}}}
  saveRoom(code){const room=this.rooms.get(code);if(room)this.worldSaves.set(code,structuredClone(room.world))}
  savePlayer(id){const p=this.players.get(id);if(p)this.playerSaves.set(id,structuredClone({...p,room:undefined}))}
}
