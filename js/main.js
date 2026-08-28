import { Game } from './game.js';
import { renderInventory } from './ui/inventoryUI.js';
import { renderRecipes } from './ui/craftingUI.js';
import { inventory } from './inventory/inventory.js';
import { craft } from './crafting/crafting.js';
import { showNotif } from './ui/ui.js';
import { Multiplayer } from './multiplayer/multiplayer.js';
import { renderHotbar } from './ui/hotbar.js';

let game=null;
let multiplayer=null;
function initMenu(){
  const $=id=>document.getElementById(id);
  $('btn-jogar').onclick=()=>{
    document.getElementById('menu').classList.remove('active');
    document.getElementById('char-creation').classList.add('active');
  };
  $('btn-char-back').onclick=()=>{
    document.getElementById('char-creation').classList.remove('active');
    document.getElementById('menu').classList.add('active');
  };
  $('btn-char-confirm').onclick=()=>{
    const name=$('capy-name').value||'Carpincho';
    const fur=$('capy-fur').value;
    document.getElementById('char-creation').classList.remove('active');
    startGame({name,fur});
  };
  $('btn-continuar').onclick=()=>{
    document.getElementById('menu').classList.remove('active');
    startGame(null, true);
  };
  const settings=JSON.parse(localStorage.getItem('carpincho_settings')||'{"quality":"Alta","volume":80,"ui":100}');
  $('cfg-quality').value=settings.quality; $('cfg-volume').value=settings.volume; $('cfg-ui').value=settings.ui;
  const applySettings=()=>{
    const next={quality:$('cfg-quality').value,volume:Number($('cfg-volume').value),ui:Number($('cfg-ui').value)};
    localStorage.setItem('carpincho_settings',JSON.stringify(next));
    document.documentElement.style.setProperty('--ui-scale',next.ui/100);
    game?.setQuality(next.quality); game?.audio.setVolume(next.volume/100);
  };
  $('btn-config').onclick=()=>{ document.getElementById('menu').classList.remove('active'); document.getElementById('config').classList.add('active'); };
  $('cfg-quality').onchange=applySettings; $('cfg-volume').oninput=applySettings; $('cfg-ui').oninput=applySettings; applySettings();
  $('btn-config-back').onclick=()=>{ applySettings(); document.getElementById('config').classList.remove('active'); document.getElementById('menu').classList.add('active'); };
  $('btn-creditos').onclick=()=> showNotif('CARPINCHO: THE LOST RAILWAY • MVP web');
  $('btn-multiplayer').onclick=()=>{ $('menu').classList.remove('active'); $('multiplayer').classList.add('active'); };
  $('btn-mp-back').onclick=()=>{ $('multiplayer').classList.remove('active'); $('menu').classList.add('active'); };
  const launchMultiplayer=(code)=>{
    $('multiplayer').classList.remove('active');
    startGame({name:'Carpincho'},false,multiplayer);
    showNotif(`Sala ${code} ativa — cooperação conectada.`);
  };
  const connectMultiplayer=async()=>{
    if(multiplayer?.connected) return multiplayer;
    multiplayer=new Multiplayer();
    multiplayer.onMessage(message=>{
      const status=$('mp-status');
      if(message.type==='ROOM_CREATED'){ status.textContent=`Sala criada: ${message.payload.code}`; launchMultiplayer(message.payload.code); }
      else if(message.type==='JOINED'){ status.textContent=`Entrou na sala: ${message.payload.code}`; launchMultiplayer(message.payload.code); }
      else if(message.type==='ERROR') status.textContent=message.payload.msg;
    });
    const host=location.hostname||'localhost';
    await multiplayer.connect(`${location.protocol==='https:'?'wss':'ws'}://${host}:3000`);
    return multiplayer;
  };
  $('btn-mp-create').onclick=async()=>{
    $('mp-status').textContent='Conectando ao servidor…';
    try { const mp=await connectMultiplayer(); mp.createRoom($('mp-name').value,Number($('mp-max').value)); }
    catch(error){ $('mp-status').textContent=error.message; }
  };
  $('btn-mp-join').onclick=async()=>{
    $('mp-status').textContent='Conectando ao servidor…';
    try { const mp=await connectMultiplayer(); mp.join($('mp-code').value); }
    catch(error){ $('mp-status').textContent=error.message; }
  };
  $('btn-sair').onclick=()=> showNotif('Até logo!');
  // in-game UI
  $('inv-close')?.addEventListener('click',()=> $('inventory-panel').classList.remove('active'));
  $('craft-close')?.addEventListener('click',()=> $('crafting-panel').classList.remove('active'));
  $('furnace-close')?.addEventListener('click',()=> $('furnace-panel').classList.remove('active'));
  $('map-close')?.addEventListener('click',()=> $('map-panel').classList.remove('active'));
  $('quests-close')?.addEventListener('click',()=> $('quests-panel').classList.remove('active'));
  $('btn-resume')?.addEventListener('click',()=> $('pause-menu').classList.remove('active'));
  $('btn-inventory')?.addEventListener('click',()=>{ $('pause-menu').classList.remove('active'); $('inventory-panel').classList.add('active'); renderInventory(); });
  $('btn-map')?.addEventListener('click',()=>{ $('pause-menu').classList.remove('active'); $('map-panel').classList.add('active'); });
  $('btn-quests')?.addEventListener('click',()=>{ $('pause-menu').classList.remove('active'); $('quests-panel').classList.add('active'); });
  $('btn-save')?.addEventListener('click',()=> game?.doSave());
  $('btn-quit-menu')?.addEventListener('click',()=> location.reload());
  $('btn-respawn')?.addEventListener('click',()=>{
    if(game){ game.player.health.current=game.player.health.max; game.player.pos={x:0,y:0.9,z:0}; document.getElementById('death-screen').style.display='none'; showNotif('Respawn!'); }
  });
  $('btn-checkpoint')?.addEventListener('click',()=>{
    if(game){ game.player.health.current=game.player.health.max; game.player.pos={...game.checkpoint,y:0.9}; document.getElementById('death-screen').style.display='none'; }
  });
  $('btn-death-quit')?.addEventListener('click',()=> location.reload());
  $('btn-skip')?.addEventListener('click',()=> game?.cutscene.skip());
  $('btn-craft')?.addEventListener('click',()=>{
    const sel=window._selectedRecipe;
    if(!sel) return;
    const res=craft(sel, window._selectedStation||'crafting_table', game?.player.level||0);
    if(res.ok){ showNotif('Craftou '+res.recipe.name+' — pressione B para posicionar estruturas'); renderInventory(); renderRecipes(window._selectedStation, game?.player.level||1); } else showNotif(res.reason);
  });
  $('btn-smelt')?.addEventListener('click',()=>{
    if(inventory.has('iron_ore',1) && inventory.has('coal',1)){
      inventory.remove('iron_ore',1); inventory.remove('coal',1);
      game.furnace.setInput('iron_ore'); game.furnace.setFuel('coal'); showNotif('Fundindo...');
    } else showNotif('Precisa 1 minério +1 carvão');
  });
  // quick recipes click
  renderRecipes('hand', 1);
  renderHotbar();
  // check save
  const has=localStorage.getItem('carpincho_save');
  if(has) $('btn-continuar').disabled=false;
}
function startGame(opts, cont=false, mp=null){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('game').classList.add('active');
  document.getElementById('loading').style.display='none';
  const canvas=document.getElementById('game-canvas');
  game=new Game(canvas);
  window.carpinchoGame=game;
  const settings=JSON.parse(localStorage.getItem('carpincho_settings')||'{"quality":"Alta"}');
  game.setQuality(settings.quality||'Alta');
  if(mp) game.attachMultiplayer(mp);
  // apply fur color if opts
  if(opts?.fur && game.playerMesh){
    game.playerMesh.children.forEach(c=>{ if(c.material) c.material.color.set(opts.fur) });
  }
  game.start();
  if(cont) showNotif('Continuando aventura...');
  else showNotif('Bem-vindo, '+(opts?.name||'Carpincho')+'! WASD para mover, E para interagir');
  // hide loading
  document.getElementById('loading').style.display='none';
}
window.addEventListener('DOMContentLoaded',()=>{
  initMenu();
  document.getElementById('loading').style.display='none';
  // auto bind furnace bar callback
});
