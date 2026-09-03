import { Game } from './game.js';
import { renderInventory } from './ui/inventoryUI.js';
import { renderRecipes } from './ui/craftingUI.js';
import { inventory } from './inventory/inventory.js';
import { craft } from './crafting/crafting.js';
import { showNotif } from './ui/ui.js';
import { Multiplayer } from './multiplayer/multiplayer.js';
import { renderHotbar } from './ui/hotbar.js';
import { SettingsManager } from './ui/settings.js';
import { MenuScene } from './ui/menuScene.js';
import { AudioManager } from './audio/audioManager.js';

let game=null;
let multiplayer=null;
const settingsManager=new SettingsManager();
let menuScene=null;
const menuAudio=new AudioManager();
function initMenu(){
  const $=id=>document.getElementById(id);
  menuScene=new MenuScene($('menu-canvas'));window.addEventListener('resize',()=>menuScene?.resize());
  document.querySelectorAll('#menu button,#config button').forEach(button=>button.addEventListener('click',()=>menuAudio.play('ui_click',{channel:'interface'})));
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
  const settings=settingsManager.load();
  const fields={quality:'cfg-quality',volume:'cfg-volume',music:'cfg-music',effects:'cfg-effects',ambient:'cfg-ambient',interface:'cfg-interface',ui:'cfg-ui',textSize:'cfg-text-size',contrast:'cfg-contrast',sensitivity:'cfg-sensitivity',cameraDistance:'cfg-camera-distance',cameraShake:'cfg-camera-shake',resolution:'cfg-resolution',viewDistance:'cfg-view-distance',textures:'cfg-textures',vegetation:'cfg-vegetation'};
  for(const [key,id]of Object.entries(fields))if($(id))$(id).value=settings[key];for(const [key,id]of Object.entries({fullscreen:'cfg-fullscreen',vsync:'cfg-vsync',particles:'cfg-particles',postProcessing:'cfg-post'}))if($(id))$(id).checked=settings[key];for(const action of ['interact','forward','back','left','right','sprint','jump'])$(`cfg-key-${action}`).value=settings.controls[action];
  const applySettings=()=>{
    const controls={};for(const action of ['interact','forward','back','left','right','sprint','jump'])controls[action]=$(`cfg-key-${action}`).value.toLowerCase()||settings.controls[action];const patch={controls};for(const [key,id]of Object.entries(fields))patch[key]=['quality','contrast','textures'].includes(key)?$(id).value:Number($(id).value);for(const [key,id]of Object.entries({fullscreen:'cfg-fullscreen',vsync:'cfg-vsync',particles:'cfg-particles',postProcessing:'cfg-post'}))patch[key]=$(id).checked;const next=settingsManager.save(patch);
    document.documentElement.style.setProperty('--ui-scale',next.ui/100);document.documentElement.style.setProperty('--text-scale',next.textSize/100);document.documentElement.dataset.contrast=next.contrast;
    game?.applySettings(next);
  };
  $('btn-config').onclick=()=>{ document.getElementById('menu').classList.remove('active'); document.getElementById('config').classList.add('active'); };
  document.querySelectorAll('#config input,#config select').forEach(element=>{element.addEventListener(element.type==='range'?'input':'change',applySettings)});applySettings();
  $('btn-config-back').onclick=()=>{ applySettings(); document.getElementById('config').classList.remove('active'); document.getElementById('menu').classList.add('active'); };
  $('btn-creditos').onclick=()=> showNotif('CARPINCHO: THE LOST RAILWAY • MVP web');
  $('btn-projects').onclick=()=> window.location.assign('/');
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
    const wsProtocol=location.protocol==='https:'?'wss':'ws';
    await multiplayer.connect(`${wsProtocol}://${location.host}/capyrails/ws`);
    return multiplayer;
  };
  $('btn-mp-create').onclick=async()=>{
    $('mp-status').textContent='Conectando ao servidor…';
    try { const mp=await connectMultiplayer(); mp.createRoom($('mp-name').value,Number($('mp-max').value),{private:$('mp-private').checked,password:$('mp-password').value}); }
    catch(error){ $('mp-status').textContent=error.message; }
  };
  $('btn-mp-join').onclick=async()=>{
    $('mp-status').textContent='Conectando ao servidor…';
    try { const mp=await connectMultiplayer(); mp.join($('mp-code').value,$('mp-password').value,$('mp-role').value); }
    catch(error){ $('mp-status').textContent=error.message; }
  };
  $('btn-sair').onclick=()=> showNotif('Até logo!');
  // in-game UI
  $('inv-close')?.addEventListener('click',()=> game?.closeMenu());
  $('craft-close')?.addEventListener('click',()=> game?.closeMenu());
  $('furnace-close')?.addEventListener('click',()=> game?.closeMenu());
  $('map-close')?.addEventListener('click',()=> game?.closeMenu());
  $('quests-close')?.addEventListener('click',()=> game?.closeMenu());
  $('profile-close')?.addEventListener('click',()=>game?.closeMenu());
  $('npc-close')?.addEventListener('click',()=>game?.closeMenu());$('npc-buy')?.addEventListener('click',()=>game?.buyFromNpc());
  $('btn-resume')?.addEventListener('click',()=> game?.closeMenu());
  $('btn-inventory')?.addEventListener('click',()=>{ $('pause-menu').classList.remove('active'); $('inventory-panel').classList.add('active'); renderInventory(); });
  $('btn-map')?.addEventListener('click',()=>{ $('pause-menu').classList.remove('active'); $('map-panel').classList.add('active');game?.renderMap() });
  $('btn-quests')?.addEventListener('click',()=>{ $('pause-menu').classList.remove('active'); $('quests-panel').classList.add('active'); });
  $('btn-profile')?.addEventListener('click',()=>{$('pause-menu').classList.remove('active');$('profile-panel').classList.add('active');game?.renderProfile()});
  document.querySelectorAll('[data-travel-choice]').forEach(button=>button.addEventListener('click',()=>game?.chooseTravelEvent(button.dataset.travelChoice)));
  $('chat-send')?.addEventListener('click',()=>{const text=$('chat-input').value.trim();if(text&&multiplayer?.connected){multiplayer.chat(text,$('chat-channel').value);$('chat-input').value=''}});$('chat-input')?.addEventListener('keydown',event=>{if(event.key==='Enter')$('chat-send').click()});
  $('btn-save')?.addEventListener('click',()=> game?.doSave());
  $('btn-quit-menu')?.addEventListener('click',()=> location.reload());
  $('btn-respawn')?.addEventListener('click',()=>{
    if(game?.respawn({x:0,z:0})) showNotif('Respawn!');
  });
  $('btn-checkpoint')?.addEventListener('click',()=>{
    if(game) game.respawn(game.checkpoint);
  });
  $('btn-death-quit')?.addEventListener('click',()=> location.reload());
  $('btn-skip')?.addEventListener('click',()=> game?.skipCutscene());
  $('btn-craft')?.addEventListener('click',()=>{
    const sel=window._selectedRecipe;
    if(!sel) return;
    const res=craft(sel, window._selectedStation||'crafting_table', game?.player.level||0,game?.craftingContext?.()||{});
    if(res.ok){ game?.advanceObjective('craft',res.recipe.output, res.recipe.outputQuantity||1);if(res.recipe.category==='train')game?.attachWagon(res.recipe.output);showNotif('Craftou '+res.recipe.name+' — pressione B para posicionar estruturas'); renderInventory(); renderRecipes(window._selectedStation, game?.player.level||1); } else showNotif(res.reason);
  });
  $('btn-smelt')?.addEventListener('click',()=>{
    const ore=inventory.has('iron_ore')?'iron_ore':inventory.has('copper_ore')?'copper_ore':null;
    if(ore && inventory.has('coal',1)){
      inventory.remove(ore,1); inventory.remove('coal',1);
      game.furnace.setInput(ore); game.furnace.setFuel('coal'); showNotif('Fundindo...');
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
  menuScene?.stop();
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('game').classList.add('active');
  document.getElementById('loading').style.display='none';
  const canvas=document.getElementById('game-canvas');
  game?.destroy();
  game=new Game(canvas);
  window.carpinchoGame=game;
  const settings=settingsManager.load();game.applySettings(settings);
  if(mp) game.attachMultiplayer(mp);
  // apply fur color if opts
  if(opts?.fur) game.setFurColor?.(opts.fur);
  game.start();
  if(!cont)game.playCutscene('Introdução — a locomotiva perdida desperta',()=>{});
  if(cont) showNotif('Continuando aventura...');
  else showNotif(`Bem-vindo, ${opts?.name||'Carpincho'}! ${game.touchControls?.isTouchInput?'Use as setas para mover e ☝️ para interagir':'WASD para mover, E para interagir'}`);
  // hide loading
  document.getElementById('loading').style.display='none';
}
window.addEventListener('DOMContentLoaded',()=>{
  initMenu();
  document.getElementById('loading').style.display='none';
  // auto bind furnace bar callback
});
