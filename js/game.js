import * as THREE from 'three';
import { createTerrain } from './world/terrain.js';
import { createRails } from './train/rails.js';
import { Player } from './player/player.js';
import { PlayerStateMachine, PLAYER_STATES } from './player/playerStateMachine.js';
import { PlayerAnimator, PLAYER_ANIMATIONS } from './player/playerAnimator.js';
import { resolveCircleMovement } from './player/collision.js';
import { inventory } from './inventory/inventory.js';
import { Furnace } from './crafting/furnace.js';
import { QuestManager } from './quests/questManager.js';
import { CutsceneManager } from './cinematic/cutsceneManager.js';
import { SaveManager } from './save/saveManager.js';
import { EnemyAI } from './enemies/enemyAI.js';
import { spawnMob } from './enemies/mobSpawner.js';
import { Boss } from './enemies/boss.js';
import { Elite } from './enemies/elite.js';
import { MiniBoss } from './enemies/miniBoss.js';
import { ENEMIES } from './data/enemies.js';
import { Sword } from './combat/sword.js';
import { Pistol } from './combat/pistol.js';
import { calcDamage } from './combat/damage.js';
import { updateHUD } from './ui/hud.js';
import { renderInventory } from './ui/inventoryUI.js';
import { renderRecipes } from './ui/craftingUI.js';
import { showNotif } from './ui/ui.js';
import { rollLoot } from './data/lootTables.js';
import { AudioManager } from './audio/audioManager.js';
import { DayNight } from './world/dayNight.js';
import { Weather } from './world/weather.js';
import { WorldStreaming } from './world/worldStreaming.js';
import { Train } from './train/train.js';
import { TrainDamage } from './train/trainDamage.js';
import { PlayerEquipment } from './player/equipment.js';
import { consumeItem } from './inventory/consumables.js';
import { ResourceNode } from './resources/resourceNode.js';
import { resourceDefinition } from './data/resources.js';
import { ConstructionManager } from './world/construction.js';
import { FogOfWar } from './world/fogOfWar.js';
import { TravelEventManager } from './world/travelEvents.js';
import { RegionDB } from './data/regions.js';
import { Codex } from './quests/codex.js';
import { Dialogue } from './cinematic/dialogue.js';
import { PlayerProfile } from './ui/profile.js';
import { ObjectPool } from './performance/objectPool.js';
import { updateDistanceLOD,configureCulling } from './performance/lod.js';
import { createRegionalWorld } from './world/regionalWorld.js';
import { NPCS,npcActivity } from './data/npcs.js';
import { Shop } from './economy/shop.js';
import { Reputation } from './economy/reputation.js';
import { MissionCargoManager } from './quests/deliveryCargo.js';
import { facingYaw } from './player/movement.js';
import { hotbar, selectHotbar, renderHotbar, hotbarFromJSON, hotbarToJSON, selectedItem } from './ui/hotbar.js';

export class Game{
  constructor(canvas){
    this.canvas=canvas;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x87ceeb);
    this.scene.fog=new THREE.Fog(0x87ceeb, 60, 180);
    this.renderer=new THREE.WebGLRenderer({canvas, antialias:true});
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.15;
    // Cap the default resolution so high-DPI displays do not stall gameplay.
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled=true;
    this.camera=new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 500);
    this.clock=new THREE.Clock();
    this.weather='sol'; this.timeOfDay='dia'; this.fps=0;
    this.dayNight=new DayNight(); this.dayNight.time=9; this.weatherSystem=new Weather();
    this.worldStreaming=new WorldStreaming({chunkSize:32,loadRadius:2}); this.fogOfWar=new FogOfWar(); this.travelEvents=new TravelEventManager();
    this.player=new Player();
    this.quests=new QuestManager(this.player, inventory);
    this.cutscene=new CutsceneManager();
    this.audio=new AudioManager();
    this.equipment=new PlayerEquipment(inventory); this.construction=new ConstructionManager(inventory); this.codex=new Codex(); this.dialogue=new Dialogue(); this.profile=new PlayerProfile();this.shop=new Shop();this.reputation=new Reputation();this.currentNpc=null;
    this.saveMgr=new SaveManager();
    this.furnace=new Furnace((output)=>{
      try { inventory.add(output, 1);this.quests.record('craft',output,1);showNotif(`🔥 Fundição concluída: +1 ${output}`); }
      catch { showNotif('Fundição pronta, mas o inventário está cheio.'); }
    });
    this.sword=new Sword();
    this.pistol=new Pistol();
    this.weapon='sword'; // sword|pistol
    this.train=new Train({x:0,z:10,wagons:['cargo']}); this.trainDamage=new TrainDamage(this.train);
    this.missionCargo=new MissionCargoManager(this.train);
    this.playerState=new PlayerStateMachine(PLAYER_STATES.ON_FOOT);
    this._paused=false;
    this._menuResumeState=null;
    this._combatTimer=0;
    this.trainEnterPoint={x:0,y:0,z:-2.4}; this.driverSeat={x:.6,y:1.65,z:0}; this.trainExitPoint={x:0,y:0,z:-2.8};
    this.keys={};
    this.jumpVelocity=0; this.grounded=true;
    this.mouse={x:0,y:0,down:false,dx:0,dy:0};
    this.yaw=-0.4; this.pitch=0.25; this.dist=9;
    this.cameraSensitivity=1;
    this.settings={controls:{forward:'w',back:'s',left:'a',right:'d',interact:'e',sprint:'shift',jump:' '},cameraShake:100};
    // Safe first frame: avoid a blank/ground-only view while the camera eases in.
    this.camera.position.set(-3.5, 5.6, 18.3);
    this.resources=[];
    this.stations=[];
    this.obstacles=[];
    this.remotePlayers=new Map(); this.multiplayer=null; this.networkTimer=0;
    this.enemies=[];
    this.boss=null;
    this.brokenRepaired=false;
    this.forestLoaded=false;
    this.transitioning=false;
    this.raycaster=new THREE.Raycaster();
    this.mousePos=new THREE.Vector2();
    // Reuse hot-path vectors instead of allocating several Three.js objects every frame.
    this._moveFwd=new THREE.Vector3(); this._moveRight=new THREE.Vector3(); this._moveVec=new THREE.Vector3(); this._up=new THREE.Vector3(0,1,0);
    this._cameraTarget=new THREE.Vector3(); this._cameraPos=new THREE.Vector3();
    this._hudTimer=0; this._lastObjectiveText='';
    this.playerMesh=null; this.trainMesh=null; this.railObj=null;
    this.checkpoint={x:0,z:0};
    this.currentRegion=RegionDB.lookup('plain'); this._worldTimer=0; this._lodTimer=0;
    this.particlePool=new ObjectPool(()=>new THREE.Mesh(new THREE.SphereGeometry(.045,5,4),new THREE.MeshBasicMaterial({color:0xffd166,transparent:true})),{initial:18,reset:(particle,data,active)=>{particle.visible=active;if(data)particle.position.set(data.x,data.y,data.z)}});
    this.projectilePool=new ObjectPool(()=>new THREE.Mesh(new THREE.SphereGeometry(.035,5,4),new THREE.MeshBasicMaterial({color:0xffef9f})),{initial:8,reset:(projectile,data,active)=>{projectile.visible=active;if(data)projectile.position.set(data.x,data.y,data.z)}});
    this.mobPool=new ObjectPool(()=>new THREE.Mesh(new THREE.CapsuleGeometry(.35,.6,4,8),new THREE.MeshStandardMaterial({color:0x6ee7b7})),{initial:6,reset:(mesh,data,active)=>{mesh.visible=active;if(data)mesh.position.set(data.x,.6,data.z)}});
    this.init();
  }
  get state(){ return this.playerState.state; }
  transitionPlayer(nextState, context={}){
    const changed=this.playerState.transition(nextState, context);
    if(changed){
      this._paused=this.playerState.isPaused;
      if(this._paused) this.keys={};
    }
    return changed;
  }
  beginMenu(){
    if(this.playerState.is(PLAYER_STATES.DEAD, PLAYER_STATES.CUTSCENE)) return false;
    if(!this.playerState.is(PLAYER_STATES.MENU)){
      this._menuResumeState=this.state;
      return this.transitionPlayer(PLAYER_STATES.MENU, {reason:'overlay'});
    }
    return true;
  }
  closeMenu(){
    document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('active'));
    if(!this.playerState.is(PLAYER_STATES.MENU)) return false;
    const resume=this._menuResumeState || (this.train.inTrain?PLAYER_STATES.IN_TRAIN:PLAYER_STATES.ON_FOOT);
    this._menuResumeState=null;
    return this.transitionPlayer(resume, {reason:'close-overlay'});
  }
  playCutscene(id, onDone){
    if(this.playerState.is(PLAYER_STATES.DEAD, PLAYER_STATES.CUTSCENE)) return false;
    const resumeState=this.state;
    if(!this.transitionPlayer(PLAYER_STATES.CUTSCENE, {id})) return false;
    this.cutscene.play(id, reason=>{
      if(this.playerState.is(PLAYER_STATES.CUTSCENE)) this.transitionPlayer(resumeState, {reason});
      onDone?.(reason);
    });
    return true;
  }
  skipCutscene(){ this.cutscene.skip(); }
  enterTrain(){
    if(this.playerState.is(PLAYER_STATES.COMBAT)) this.transitionPlayer(PLAYER_STATES.ON_FOOT, {reason:'enter-train'});
    if(!this.transitionPlayer(PLAYER_STATES.ENTERING_TRAIN)) return false;
    this.train.inTrain=true;
    const seat=this.getTrainPoint('driver');this.player.pos={...seat};
    this.transitionPlayer(PLAYER_STATES.IN_TRAIN);
    return true;
  }
  exitTrain(){
    if(!this.playerState.is(PLAYER_STATES.IN_TRAIN, PLAYER_STATES.DRIVING)) return false;
    this.train.inTrain=false;
    this.train.speed=0;
    const exit=this.getTrainPoint('exit');this.player.pos={x:exit.x,y:.9,z:exit.z};
    this.transitionPlayer(PLAYER_STATES.ON_FOOT);
    showNotif('Saiu do trem');
    return true;
  }
  respawn(position={x:0,z:0}){
    if(!this.playerState.is(PLAYER_STATES.DEAD)) return false;
    this.player.health.current=this.player.health.max;
    this.player.pos={x:position.x,y:.9,z:position.z};
    this.train.inTrain=false;
    this.train.speed=0;
    this.keys={};
    const deathScreen=document.getElementById('death-screen'); if(deathScreen) deathScreen.style.display='none';
    this.transitionPlayer(PLAYER_STATES.ON_FOOT, {reason:'respawn'});
    this.playerAnimator?.update(1,{playerState:PLAYER_STATES.ON_FOOT,grounded:true});
    return true;
  }
  damagePlayer(amount){
    const previous=this.player.health.current;
    this.player.health.damage(this.sword.mitigate(amount));
    if(this.player.health.current<previous){this.playerAnimator?.play(PLAYER_ANIMATIONS.HURT);this.cameraShakeOffset=(this.settings.cameraShake||0)/100*.16}
    return previous-this.player.health.current;
  }
  getPlayerColliders(){
    const colliders=[...this.obstacles];
    if(!this.train.inTrain) colliders.push({x:this.train.x,z:this.train.z,radius:1.55});
    this.resources.forEach(resource=>{
      if(!resource.depleted) colliders.push({x:resource.x,z:resource.z,radius:resource.type==='tree'?.65:.5});
    });
    this.stations.forEach(station=>colliders.push({x:station.x,z:station.z,radius:.75}));
    this.npcs?.forEach(npc=>colliders.push({x:npc.x,z:npc.z,radius:.35}));
    return colliders;
  }
  getTrainPoint(name){
    const point=this.trainPoints?.[name];
    if(point){const world=new THREE.Vector3();point.getWorldPosition(world);return {x:world.x,y:world.y,z:world.z}}
    const fallback=this[name]||{x:0,y:0,z:0};return {x:this.train.x+fallback.x,y:fallback.y||.9,z:this.train.z+fallback.z};
  }
  useItem(id=selectedItem()){
    const result=consumeItem(inventory,id,this.player);if(result.ok)showNotif(`Usou ${id}`);else showNotif(result.reason);return result;
  }
  openNpc(npc){if(!this.beginMenu())return false;this.currentNpc=npc;const name=document.getElementById('npc-name'),text=document.getElementById('npc-dialogue'),panel=document.getElementById('npc-panel');if(name)name.textContent=npc.name;if(text)text.textContent=`${npc.dialogue} • Rotina: ${npc.activity||'trabalho'} • Reputação ${this.reputation.level(npc.reputation||this.currentRegion.id)}`;if(panel)panel.classList.add('active');this.dialogue.show(npc.name,npc.dialogue);this.codex.discover(`npc:${npc.id}`,{type:'npc',name:npc.name});return true}
  buyFromNpc(){if(!this.currentNpc)return false;const faction=this.currentNpc.reputation||this.currentRegion.id,result=this.shop.buy('bread',1,this.player,inventory,{region:this.currentRegion.id,reputation:this.reputation.level(faction)});showNotif(result.ok?`Pão comprado por ${result.cost} moedas`:result.reason);if(result.ok)this.reputation.add(faction,2);return result.ok}
  craftingContext(){return {completedQuests:this.quests.quests.filter(q=>q.completed).map(q=>q.id),discoveries:[...this.codex.discoveries],technologies:this.player.technologies||[],reputation:Object.fromEntries(RegionDB.all().map(region=>[region.id,this.reputation.level(region.id)]))}}
  attachWagon(itemId){
    const item=inventory.item(itemId);if(!item?.wagonType||!inventory.remove(itemId,1))return false;const wagon=this.train.attach(item.wagonType);this.createWagonMesh(wagon,this.train.wagons.length-1);showNotif(`${wagon.name} acoplado`);return true;
  }
  init(){
    // lights
    const amb=new THREE.HemisphereLight(0xffffff, 0x2d5a1e, 1.1); this.scene.add(amb);
    const dir=new THREE.DirectionalLight(0xfff6e3, 1.2); dir.position.set(30,50,20); dir.castShadow=true; dir.shadow.mapSize.set(1024,1024); this.scene.add(dir); this.sunLight=dir;
    const weatherGeometry=new THREE.BufferGeometry(),weatherPositions=new Float32Array(240);for(let i=0;i<80;i++){weatherPositions[i*3]=(Math.random()-.5)*34;weatherPositions[i*3+1]=Math.random()*18;weatherPositions[i*3+2]=(Math.random()-.5)*34}weatherGeometry.setAttribute('position',new THREE.BufferAttribute(weatherPositions,3));this.weatherParticles=new THREE.Points(weatherGeometry,new THREE.PointsMaterial({color:0xb9dcff,size:.12,transparent:true,opacity:.7}));this.weatherParticles.visible=false;this.scene.add(this.weatherParticles);
    // terrain
    createTerrain(this.scene, THREE);
    this.regionalWorld=createRegionalWorld(this.scene,THREE);for(const landmark of this.regionalWorld.landmarks)this.fogOfWar.addMarker(landmark.id,{x:landmark.x,z:landmark.z,type:'landmark',name:landmark.type});this.worldStreaming.createChunk=chunk=>({objects:[...this.regionalWorld.groups.values()].filter(group=>group.userData.chunkKey===chunk.key)});this.worldStreaming.onLoad=chunk=>chunk.objects.forEach(object=>object.visible=true);this.worldStreaming.onUnload=chunk=>chunk.objects.forEach(object=>object.visible=false);
    // rails
    this.railObj=createRails(this.scene);
    // station
    const stationGeo=new THREE.BoxGeometry(6,3,4); const stationMat=new THREE.MeshStandardMaterial({color:0x8B4513});
    const station=new THREE.Mesh(stationGeo, stationMat); station.position.set(2,1.5,12); station.castShadow=true; this.scene.add(station);
    this.obstacles.push({x:2,z:12,radius:2.45});
    this.npcs=[];
    const mechanic=new THREE.Group();
    const npcBody=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.7,4,8),new THREE.MeshStandardMaterial({color:0x2d6a9f,roughness:.8})); npcBody.position.y=.7; mechanic.add(npcBody);
    const npcHead=new THREE.Mesh(new THREE.SphereGeometry(.3,12,8),new THREE.MeshStandardMaterial({color:0xc49a6c,roughness:1})); npcHead.position.y=1.35; mechanic.add(npcHead);
    const wrench=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,.45),new THREE.MeshStandardMaterial({color:0xb8c0c8,metalness:.8})); wrench.position.set(.32,.75,-.18); wrench.rotation.x=Math.PI/3; mechanic.add(wrench);
    mechanic.position.set(5,0,10); this.scene.add(mechanic); this.npcs.push({id:'mechanic',name:'Mecânico',x:5,z:10,mesh:mechanic,dialogue:'Os trilhos do norte ainda podem ser reparados. Recolha sucata e lingotes para recuperar a locomotiva.'});
    for(const data of NPCS.filter(npc=>npc.id!=='mechanic')){const group=new THREE.Group(),body=new THREE.Mesh(new THREE.CapsuleGeometry(.3,.65,4,8),new THREE.MeshStandardMaterial({color:data.id==='herbalist'?0x3f7e58:0x604b91})),head=new THREE.Mesh(new THREE.SphereGeometry(.27,10,8),new THREE.MeshStandardMaterial({color:0xc49a6c}));body.position.y=.7;head.position.y=1.3;group.add(body,head);group.position.set(data.position.x,0,data.position.z);group.visible=false;this.scene.add(group);this.npcs.push({...data,x:data.position.x,z:data.position.z,mesh:group,dialogue:`${data.name} oferece suprimentos e novas rotas.`})}
    // The first crafting stations are built by the player; none are pre-placed.
    // capybara mesh
    const capyGroup=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.45,0.9,4,8), new THREE.MeshStandardMaterial({color:0xc49a6c})); body.rotation.z=Math.PI/2; capyGroup.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.42,16,16), new THREE.MeshStandardMaterial({color:0xc49a6c})); head.position.set(0.65,0.35,0); capyGroup.add(head);
    const nose=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,8), new THREE.MeshStandardMaterial({color:0x5a3e1b})); nose.position.set(0.95,0.25,0); capyGroup.add(nose);
    // Capybara silhouette: small ears, restrained eyes, short legs and tail.
    const earMat=new THREE.MeshStandardMaterial({color:0x8f6946,roughness:.95});
    for(const z of [-.27,.27]){ const ear=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),earMat); ear.scale.set(1,.72,.7); ear.position.set(.63,.67,z); capyGroup.add(ear); }
    const eyeMat=new THREE.MeshStandardMaterial({color:0x17120e,roughness:.6});
    for(const z of [-.22,.22]){ const eye=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),eyeMat); eye.position.set(.84,.43,z); capyGroup.add(eye); }
    const legMat=new THREE.MeshStandardMaterial({color:0xa77d52,roughness:.95});
    const legs=[];
    for(const x of [-.28,.28]) for(const z of [-.25,.25]){ const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.38,3,6),legMat); leg.position.set(x,.0,z); capyGroup.add(leg); legs.push(leg); }
    const tail=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),legMat); tail.position.set(-.53,.34,0); capyGroup.add(tail);
    // Readable first-person-side weapon sockets attached to the capybara.
    const rightHand=new THREE.Group(); rightHand.name='rightHand'; rightHand.position.set(.35,.15,-.42); capyGroup.add(rightHand);
    const swordMesh=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,.95),new THREE.MeshStandardMaterial({color:0xd8e5ef,metalness:.8,roughness:.25})); swordMesh.position.z=-.42; swordMesh.rotation.x=-.18; rightHand.add(swordMesh);
    const swordGrip=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.22,8),new THREE.MeshStandardMaterial({color:0x5a3e1b})); swordGrip.position.z=.1; rightHand.add(swordGrip);
    const pistolMesh=new THREE.Mesh(new THREE.BoxGeometry(.14,.16,.42),new THREE.MeshStandardMaterial({color:0x22252a,metalness:.65,roughness:.35})); pistolMesh.position.z=-.2; pistolMesh.visible=false; rightHand.add(pistolMesh);
    const toolMat=new THREE.MeshStandardMaterial({color:0x8b5a2b,roughness:.8});
    const pickMesh=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,.72),toolMat); pickMesh.position.z=-.32; pickMesh.rotation.x=-.35; pickMesh.visible=false; rightHand.add(pickMesh);
    const axeMesh=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,.52),toolMat); axeMesh.position.z=-.24; axeMesh.rotation.x=-.25; axeMesh.visible=false; rightHand.add(axeMesh);
    this.weaponMeshes={sword:swordMesh,pistol:pistolMesh,pick:pickMesh,axe:axeMesh};
    this.playerAnimator=new PlayerAnimator(capyGroup,{body,head,legs,rightHand});
    capyGroup.position.set(0,0.9,0); this.scene.add(capyGroup); this.playerMesh=capyGroup;
    // train mesh
    const trainGroup=new THREE.Group();
    const loco=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.6,1.8), new THREE.MeshStandardMaterial({color:0xb34700})); loco.position.y=1; trainGroup.add(loco);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.8,1.2), new THREE.MeshStandardMaterial({color:0xd4a843})); cab.position.set(0.6,1.5,0); trainGroup.add(cab);
    const wheelGeo=new THREE.CylinderGeometry(0.28,0.28,0.2,12);
    const wheelMat=new THREE.MeshStandardMaterial({color:0x333});
    [ -1,0,1].forEach(x=>{ const w=new THREE.Mesh(wheelGeo,wheelMat); w.rotation.z=Math.PI/2; w.position.set(x*0.9,0.3,0.7); trainGroup.add(w); const w2=w.clone(); w2.position.z=-0.7; trainGroup.add(w2); });
    trainGroup.position.set(0,0,10); this.scene.add(trainGroup); this.trainMesh=trainGroup;
    this.trainPoints={enter:new THREE.Object3D(),driver:new THREE.Object3D(),exit:new THREE.Object3D()};
    this.trainPoints.enter.position.set(-.4,.9,-1.45);this.trainPoints.driver.position.set(.6,1.65,0);this.trainPoints.exit.position.set(.4,.9,1.55);Object.values(this.trainPoints).forEach(point=>trainGroup.add(point));
    const dashboard=new THREE.Group();dashboard.position.set(.15,1.55,-.45);const dashPanel=new THREE.Mesh(new THREE.BoxGeometry(1.05,.38,.18),new THREE.MeshStandardMaterial({color:0x20252b,emissive:0x091015}));dashboard.add(dashPanel);for(let i=0;i<3;i++){const gauge=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.03,16),new THREE.MeshStandardMaterial({color:[0x58b8e8,0xe8c358,0x68d391][i],emissive:[0x12384b,0x4b3912,0x174529][i]}));gauge.rotation.x=Math.PI/2;gauge.position.set((i-1)*.3,.02,-.1);dashboard.add(gauge)}trainGroup.add(dashboard);this.dashboardMesh=dashboard;
    const wagon=new THREE.Group();
    const wagonBody=new THREE.Mesh(new THREE.BoxGeometry(2.8,1.25,1.65),new THREE.MeshStandardMaterial({color:0x5b4636,roughness:.9})); wagonBody.position.set(-3.2,.85,0); wagon.add(wagonBody);
    const wagonRoof=new THREE.Mesh(new THREE.BoxGeometry(3,0.16,1.8),new THREE.MeshStandardMaterial({color:0x30251f,roughness:1})); wagonRoof.position.set(-3.2,1.55,0); wagon.add(wagonRoof);
    const wagonWheel=new THREE.CylinderGeometry(.25,.25,.18,12); for(const z of [-.68,.68]){const w=new THREE.Mesh(wagonWheel,wheelMat);w.rotation.z=Math.PI/2;w.position.set(-3.7,.25,z);wagon.add(w);}
    trainGroup.add(wagon);
    configureCulling(trainGroup);
    // resources Instanced-like but simple meshes
    const resData=[
      {type:'tree',x:8,z:-6},{type:'tree',x:12,z:-8},{type:'tree',x:-10,z:8},{type:'rock',x:6,z:4},{type:'rock',x:14,z:-2},{type:'coal',x:11,z:7},{type:'coal',x:-8,z:-4},{type:'coal',x:-4,z:6},{type:'iron_ore',x:16,z:5},{type:'iron_ore',x:-12,z:-6},{type:'scrap',x:9,z:9},{type:'scrap',x:-6,z:-10},{type:'herbs',x:4,z:-12},
    ];
    this.resources=resData.map((d,i)=>{
      let mesh;
      if(d.type==='tree'){
        const g=new THREE.Group();
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.28,1.2,8), new THREE.MeshStandardMaterial({color:0x5a3e1b})); trunk.position.y=0.6; g.add(trunk);
        const leaves=new THREE.Mesh(new THREE.SphereGeometry(0.85,12,12), new THREE.MeshStandardMaterial({color:0x1a3a0a})); leaves.position.y=1.7; g.add(leaves);
        g.position.set(d.x,0,d.z); this.scene.add(g); mesh=g;
      } else if(d.type==='rock'){
        mesh=new THREE.Mesh(new THREE.DodecahedronGeometry(0.7), new THREE.MeshStandardMaterial({color:0x6a6a6a})); mesh.position.set(d.x,0.5,d.z); this.scene.add(mesh);
      } else if(d.type==='coal'){
        mesh=new THREE.Mesh(new THREE.SphereGeometry(0.45,8,8), new THREE.MeshStandardMaterial({color:0x111111})); mesh.position.set(d.x,0.45,d.z); this.scene.add(mesh);
      } else if(d.type==='iron_ore'){
        mesh=new THREE.Mesh(new THREE.OctahedronGeometry(0.6), new THREE.MeshStandardMaterial({color:0xff8c00})); mesh.position.set(d.x,0.6,d.z); this.scene.add(mesh);
      } else {
        mesh=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.4,0.6), new THREE.MeshStandardMaterial({color:0x8a7a5a})); mesh.position.set(d.x,0.3,d.z); this.scene.add(mesh);
      }
      const definition=resourceDefinition(d.type)||{tool:'pick',tier:0,hp:2,drops:[{item:d.type,amount:1,chance:1}]};
      const node=new ResourceNode({id:'res'+i,...d,...definition});node.mesh=mesh;return node;
    });
    for(const data of this.regionalWorld.resources){const definition=resourceDefinition(data.type);if(!definition)continue;const node=new ResourceNode({...data,...definition});node.mesh=data.mesh;this.resources.push(node)}
    // The opening Planície is a safe tutorial area. Hostile mobs are introduced
    // only after the player reaches the Forest transition.
    // input
    window.addEventListener('keydown',e=>this.onKey(e,true));
    window.addEventListener('keyup',e=>this.onKey(e,false));
    window.addEventListener('mousedown',e=>{ if(e.button===0) this.onShoot({heavy:this.keys['shift']}); if(e.button===2&&this.weapon==='sword')this.sword.setBlocking(true); });
    window.addEventListener('mouseup',e=>{if(e.button===2)this.sword.setBlocking(false)});
    // Use the canvas owned by this Game instance. Referencing the old local
    // constructor argument here caused `canvas is not defined` in init().
    this.canvas.addEventListener('mousemove',e=>{ this.mouse.dx=e.movementX||0; this.mouse.dy=e.movementY||0; if(e.buttons===1){ this.yaw-=this.mouse.dx*0.004*this.cameraSensitivity; this.pitch=Math.max(0.1,Math.min(1.1,this.pitch - this.mouse.dy*0.004*this.cameraSensitivity)); }});
    this.canvas.addEventListener('click',()=>this.canvas.requestPointerLock?.());
    this.canvas.addEventListener('wheel',e=>{
      if(e.ctrlKey){ this.setCameraDistance(this.dist+e.deltaY*.01); e.preventDefault(); return; }
      const step=e.deltaY>0?1:-1; selectHotbar((hotbar.selected+step+hotbar.slots.length)%hotbar.slots.length); e.preventDefault();
    },{passive:false});
    window.addEventListener('resize',()=>this.onResize());
    // inventory listener
    inventory.onChange(()=>{ renderInventory(); this.updateQuestHUD() });
    inventory.onChange(renderHotbar);
    renderRecipes('hand', this.player.level);
    this.updateQuestHUD();
    // load save?
    const saved=this.saveMgr.load();
    if(saved){ this.applySave(saved); showNotif('Save carregado'); }
    const continueButton=document.getElementById('btn-continuar');if(this.saveMgr.has()&&continueButton)continueButton.disabled=false;
    if(!saved){
      inventory.add('axe_wood', 1);
      inventory.add('pick_wood', 1);
      inventory.add('sword_iron',1);
      inventory.add('pistol_basic',1);
      inventory.add('ammo_pistol',36);
      inventory.add('bread', 2);
    }
    // dev F1..F9
    window.addEventListener('keydown',e=>{
      if(!import.meta.env.DEV && e.key!=='F1') return;
      if(e.key==='F1'){ e.preventDefault(); showNotif('FPS: '+this.fps); }
      if(e.key==='F2'){ e.preventDefault(); showNotif(`Posição: ${this.player.pos.x.toFixed(1)}, ${this.player.pos.z.toFixed(1)}`); }
      if(e.key==='F3'){ e.preventDefault(); showNotif(`Trem: ${this.train.speed.toFixed(1)} km/h • combustível ${Math.round(this.train.fuel)}%`); }
      if(e.key==='F4'){ e.preventDefault(); this.player.pos={x:12,y:.9,z:10}; showNotif('F4: teleporte para o trilho quebrado'); }
      if(e.key==='F5'){ e.preventDefault(); ['wood','stone','coal','iron_ore','iron_ingot','scrap'].forEach(id=>inventory.add(id,5)); showNotif('F5 +recursos'); }
      if(e.key==='F6'){ this.player.coins+=500; showNotif('F6 +500 coins'); }
      if(e.key==='F7'){ e.preventDefault(); const q=this.quests.active(); if(q){ q.objectives.forEach(o=>o.done=true); this.quests.checkComplete(q); showNotif(`F7: missão concluída — ${q.name}`); } }
      if(e.key==='F8'){ e.preventDefault(); this.weather=this.weather==='sol'?'neblina':'sol'; this.weatherSystem.set(this.weather); this.scene.fog.color.set(this.weather==='neblina'?0xb9c5bd:0x87ceeb); this.scene.background.set(this.weather==='neblina'?0x9aa9a2:(this.timeOfDay==='noite'?0x10182f:0x87ceeb)); showNotif(`F8: clima ${this.weather}`); }
      if(e.key==='F9'){ e.preventDefault(); this.dayNight.time=this.timeOfDay==='noite'?9:22; this.timeOfDay=this.dayNight.phase(); this.scene.background.set(this.timeOfDay==='noite'?0x10182f:0x87ceeb); showNotif(`F9: ${this.timeOfDay}`); }
    });
  }
  createWagonMesh(wagon,index){
    if(!this.trainMesh||index===0)return null;
    const group=new THREE.Group(),offset=-3.2-index*3.15,material=new THREE.MeshStandardMaterial({color:wagon.color||0x5b4636,roughness:.85});
    const body=new THREE.Mesh(new THREE.BoxGeometry(2.8,1.25,1.65),material);body.position.set(offset,.85,0);group.add(body);
    const roof=new THREE.Mesh(new THREE.BoxGeometry(3,.16,1.8),new THREE.MeshStandardMaterial({color:0x30251f}));roof.position.set(offset,1.55,0);group.add(roof);
    if(wagon.type==='greenhouse'){const glass=new THREE.Mesh(new THREE.BoxGeometry(2.4,.7,1.35),new THREE.MeshStandardMaterial({color:0x7fcda0,transparent:true,opacity:.48}));glass.position.set(offset,1.15,0);group.add(glass)}
    if(wagon.type==='defensive'){const turret=new THREE.Mesh(new THREE.CylinderGeometry(.28,.35,.35,10),material);turret.position.set(offset,1.85,0);group.add(turret)}
    group.userData.wagonId=wagon.id;this.trainMesh.add(group);return group;
  }
  spawnEnemies(){
    // clear
    this.enemies.forEach(e=> e.mesh && this.scene.remove(e.mesh)); this.enemies=[];
    const spots=this.forestLoaded?[[22,6],[28,-5],[34,12],[25,-13],[39,8]]:[[6,6],[-8,5],[14,14],[-14,-8],[10,-12]];
    spots.forEach(([x,z],i)=>{
      const mob=spawnMob(this.forestLoaded?(i%2===0?'spore':'wolf'):(i%2===0?'slime':'boar'), x, z);
      if(!mob) return;
      const geo=mob.id==='slime' ? new THREE.SphereGeometry(.58,12,8) : mob.id==='boar' ? new THREE.ConeGeometry(.62,1.25,6) : mob.id==='spore' ? new THREE.DodecahedronGeometry(.62) : new THREE.CapsuleGeometry(0.4,0.8,4,8);
      const mat=new THREE.MeshStandardMaterial({color: mob.id==='slime'?0x2ecc71:mob.id==='boar'?0x8b4513:mob.id==='spore'?0x9b59b6:0xe67e22,roughness:.7,emissive:mob.id==='spore'?0x260c33:0x321407,emissiveIntensity:.35});
      const mesh=new THREE.Mesh(geo,mat); mesh.position.set(x,0.8,z); this.scene.add(mesh);
      // Give each species a readable silhouette instead of a recolored primitive.
      if(mob.id==='boar'){
        const snout=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),new THREE.MeshStandardMaterial({color:0x4a2617})); snout.position.set(0,0.02,.58); mesh.add(snout);
        for(const ox of [-.3,.3]) for(const oz of [-.28,.28]){ const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.08,.32,3,5),mat); leg.position.set(ox,-.52,oz); mesh.add(leg); }
      } else if(mob.id==='wolf'){
        for(const oz of [-.23,.23]){ const ear=new THREE.Mesh(new THREE.ConeGeometry(.14,.32,4),mat); ear.position.set(0,.62,oz); mesh.add(ear); }
        const tail=new THREE.Mesh(new THREE.CapsuleGeometry(.08,.45,3,5),mat); tail.rotation.x=-.9; tail.position.set(0,-.02,-.52); mesh.add(tail);
      } else if(mob.id==='spore'){
        const cap=new THREE.Mesh(new THREE.SphereGeometry(.72,10,6,0,Math.PI*2,0,Math.PI*.5),mat); cap.position.y=.28; mesh.add(cap);
      } else if(mob.id==='slime'){
        mesh.scale.y=.78;
      }
      [-.13,.13].forEach(offset=>{ const eye=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),new THREE.MeshStandardMaterial({color:0xfef3c7,emissive:0xffdd55,emissiveIntensity:1})); eye.position.set(offset,.22,.34); mesh.add(eye); });
      const aura=new THREE.Mesh(new THREE.TorusGeometry(.52,.025,6,18),new THREE.MeshBasicMaterial({color:i%2===0?0x42f59b:0xffb347,transparent:true,opacity:.7})); aura.rotation.x=Math.PI/2; aura.position.y=-.37; mesh.add(aura);
      mob.mesh=mesh; mob.ai=new EnemyAI(mob); this.enemies.push(mob);
    });
    if(this.forestLoaded){
      const eliteData=ENEMIES.find(enemy=>enemy.id==='elite_boar');
      const elite=new Elite({...eliteData,x:31,z:15});
      elite.mesh=new THREE.Mesh(new THREE.CapsuleGeometry(.7,1.1,4,8),new THREE.MeshStandardMaterial({color:0x9b59b6,emissive:0x260c33}));
      elite.mesh.position.set(elite.x,1.1,elite.z); this.scene.add(elite.mesh); elite.ai=new EnemyAI(elite); this.enemies.push(elite);
      const mini=new MiniBoss({...eliteData,id:'forest_brute',name:'Bruto da Ruína',loot:'elite_loot',xp:160,x:37,z:-11});
      mini.mesh=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.1,1.5),new THREE.MeshStandardMaterial({color:0x7f1d1d,emissive:0x260000}));
      mini.mesh.position.set(mini.x,1.05,mini.z); this.scene.add(mini.mesh); mini.ai=new EnemyAI(mini); this.enemies.push(mini);
    }
    // boss hidden until quest
    const q=this.quests.quests.find(q=>q.id==='guardian_forest');
    if(q && q.active && !q.completed){
      // place boss at 40,0
      this.boss=new Boss('forest_guardian');
      const bgeo=new THREE.BoxGeometry(2.2,2.8,2.2); const bmat=new THREE.MeshStandardMaterial({color:0x4a0a0a});
      const bmesh=new THREE.Mesh(bgeo,bmat); bmesh.position.set(40,1.4,0); bmesh.castShadow=true; this.scene.add(bmesh); this.boss.mesh=bmesh;
      // arena ring
      const ring=new THREE.Mesh(new THREE.RingGeometry(20,21,32), new THREE.MeshStandardMaterial({color:0xff0000, side:THREE.DoubleSide, transparent:true, opacity:0.12})); ring.rotation.x=-Math.PI/2; ring.position.set(40,0.02,0); this.scene.add(ring);
      this.audio.play(this.boss.music,{channel:'music'});this.playCutscene(`Entrada de chefe — ${this.boss.name}`,()=>{});
    }
  }
  onKey(e, down){
    const raw=e.key.toLowerCase(),bindings=this.settings.controls||{},key=Object.entries(bindings).find(([,bound])=>bound===raw)?.[0]||raw;
    if(!down){ this.keys[key]=false; return; }
    if(this.playerState.is(PLAYER_STATES.DEAD, PLAYER_STATES.CUTSCENE)) return;
    if(e.key==='Escape'){ this.togglePause(); return; }
    if(this.playerState.is(PLAYER_STATES.MENU)){
      if(key==='i') this.toggle('inventory-panel');
      else if(key==='m') this.toggle('map-panel');
      else if(key==='j') this.toggle('quests-panel');
      return;
    }
    this.keys[key]=true;
    if(/^[1-9]$/.test(e.key)){ selectHotbar(Number(e.key)-1); return; }
    if(key==='i'){ this.toggle('inventory-panel'); return; }
    if(key==='m'){ this.toggle('map-panel'); return; }
    if(key==='j'){ this.toggle('quests-panel'); return; }
    if(key==='interact'||key==='e'){ this.tryInteract(); return; }
    if(key==='q' && this.playerState.is(PLAYER_STATES.IN_TRAIN, PLAYER_STATES.DRIVING)){ this.accelerate(); return; }
    if(key==='r' && this.weapon!=='pistol'){ this.tryRepair(); return; }
    if(key==='f' && this.exitTrain()) return;
    if(key==='r' && this.weapon==='pistol'){ if(this.pistol.reload()){showNotif(`Recarregando por ${this.pistol.reloadDuration.toFixed(1)}s…`);this.audio.play('pistol_reload',{channel:'effects'})}else showNotif('Não é possível recarregar agora');return }
    if(key==='h' && this.train.inTrain){ showNotif('🚂 BUZINA! Piiiii!') }
    if(key==='b'){ this.placeStation(); }
    if((key==='jump'||e.code==='Space') && inventory.item(selectedItem())?.category==='consumable' && !this.train.inTrain){
      this.useItem(selectedItem());
      return;
    }
    if((key==='jump'||e.code==='Space') && this.playerState.is(PLAYER_STATES.DRIVING)){ this.train.speed*=.15; showNotif('🛑 Freio de emergência'); return; }
    if((key==='jump'||e.code==='Space') && this.grounded && this.playerState.canMove){ this.jumpVelocity=6.5; this.grounded=false;this.audio.play('jump',{channel:'effects'}) }
  }
  equipWeapon(weapon){
    if(weapon!=='sword' && weapon!=='pistol') return;
    this.weapon=weapon;
    this.equipment.equip(weapon==='sword'?'sword_iron':'pistol_basic');
    if(this.weaponMeshes){ Object.values(this.weaponMeshes).forEach(m=>m.visible=false); this.weaponMeshes.sword.visible=weapon==='sword'; this.weaponMeshes.pistol.visible=weapon==='pistol'; }
    showNotif(weapon==='sword'?'Espada equipada':'Pistola equipada');
  }
  equipTool(id){
    if(!this.weaponMeshes || id==='sword_iron' || id==='pistol_basic') return;
    Object.values(this.weaponMeshes).forEach(m=>m.visible=false);
    this.equipment.equip(id);
    if(id.startsWith('pick')) this.weaponMeshes.pick.visible=true;
    else if(id.startsWith('axe')) this.weaponMeshes.axe.visible=true;
  }
  createStation(type, x, z, starter=false,id=null){
    const isTable=type==='crafting_table'||type==='engineering_table';
    const mesh=new THREE.Group();
    const base=new THREE.Mesh(
      new THREE.BoxGeometry(isTable?1.5:1.25, isTable?0.14:1.1, isTable?1:1.25),
      new THREE.MeshStandardMaterial({color:isTable?0x76451f:0x55515a, roughness:0.82})
    );
    base.position.y=isTable?0.85:0.55; mesh.add(base);
    if(isTable){
      for(const [dx,dz] of [[-.55,-.32],[-.55,.32],[.55,-.32],[.55,.32]]){
        const leg=new THREE.Mesh(new THREE.BoxGeometry(.12,1.5,.12), base.material); leg.position.set(dx,.75,dz); mesh.add(leg);
      }
    } else {
      const fire=new THREE.Mesh(new THREE.SphereGeometry(.27,10,8), new THREE.MeshStandardMaterial({color:0xff8d1a, emissive:0xff4e00, emissiveIntensity:1.4})); fire.position.y=1.1; mesh.add(fire);
    }
    mesh.position.set(x,0,z); mesh.castShadow=true; this.scene.add(mesh);
    const station={id:id||`station-${type}-${this.stations.length}`,type,x,z,mesh,starter};this.stations.push(station);return station;
  }
  placeStation(){
    if(this.train.inTrain) return;
    if(this.keys['alt']){const nearest=this.stations.filter(s=>!s.starter).sort((a,b)=>Math.hypot(a.x-this.player.pos.x,a.z-this.player.pos.z)-Math.hypot(b.x-this.player.pos.x,b.z-this.player.pos.z))[0];if(nearest&&Math.hypot(nearest.x-this.player.pos.x,nearest.z-this.player.pos.z)<3){const removed=this.construction.remove(nearest.id);if(removed.ok){this.scene.remove(nearest.mesh);this.stations=this.stations.filter(s=>s!==nearest);showNotif('Estrutura removida e devolvida ao inventário')}return}}
    const type=['crafting_table','furnace','chest','workshop','engineering_table','laboratory'].find(id=>inventory.has(id));
    if(!type){ showNotif('Crie uma Mesa de Crafting ou Fornalha primeiro.'); return; }
    const fwd=new THREE.Vector3(); this.camera.getWorldDirection(fwd);
    const placed=this.construction.place(type,{x:this.player.pos.x+fwd.x*2,z:this.player.pos.z+fwd.z*2});if(!placed.ok){showNotif(placed.reason);return}
    this.createStation(type,placed.structure.x,placed.structure.z,false,placed.structure.id);
    showNotif(`${type==='crafting_table'?'Mesa de Crafting':'Fornalha'} posicionada.`);
  }
  openCrafting(station){
    if(!this.beginMenu()) return;
    document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('active'));
    if(station==='furnace') document.getElementById('furnace-panel').classList.add('active');
    else {
      document.getElementById('crafting-panel').classList.add('active');
      document.getElementById('crafting-title').textContent=station.replaceAll('_',' ').toUpperCase();
      renderRecipes(station, this.player.level);
    }
  }
  onShoot({heavy=false}={}){
    if(!this.playerState.canCombat) return;
    if(this.playerState.is(PLAYER_STATES.ON_FOOT)) this.transitionPlayer(PLAYER_STATES.COMBAT, {weapon:this.weapon});
    this._combatTimer=this.weapon==='sword'?.4:.25;
    if(this.weapon==='sword'){
      const now=performance.now()/1000; const attack=this.sword.attack(now,{heavy});
      if(!attack.ok){showNotif(attack.reason);return}
      if(!this.player.stamina.use(attack.stamina)) { showNotif('Sem stamina!'); return; }
      inventory.damageDurability('sword_iron',heavy?2:1);
      this.playerAnimator?.play(PLAYER_ANIMATIONS.ATTACK);
      // ray hit enemies within 2.2
      let hit=null; let best=2.4;
      for(const en of [...this.enemies, this.boss].filter(Boolean)){
        if(en.state==='DEAD') continue;
        const d=Math.hypot(en.x - this.player.pos.x, en.z - this.player.pos.z);
        if(d<best){ best=d; hit=en }
      }
      if(hit){
        const dmg=calcDamage(attack.damage, hit.defense||2);
        hit.takeDamage(dmg,{stun:heavy?.35:0}); showNotif(`-${dmg} ${hit.name} (${heavy?'pesado':`combo ${attack.combo}`})`);
        if(hit.state==='DEAD'){
          this.onKill(hit);
          if(hit.mesh) { hit.mesh.material.color.set(0x333333); }
        }
      } else showNotif(heavy?'Ataque pesado!':`Swing! (combo ${attack.combo})`);
    } else {
      const shot=this.pistol.shoot();if(!shot.ok){showNotif(shot.reason);return}this.audio.play('pistol_shot',{channel:'effects'});const tracer=this.projectilePool.acquire({x:this.player.pos.x,y:1,z:this.player.pos.z});if(!tracer.parent)this.scene.add(tracer);setTimeout(()=>this.projectilePool.release(tracer),90);
      this.playerAnimator?.play(PLAYER_ANIMATIONS.ATTACK);
      // pistol raycast
      const dir=new THREE.Vector3(); this.camera.getWorldDirection(dir);
      dir.x+=shot.spread.x;dir.y+=shot.spread.y;dir.normalize();
      this.raycaster.far=shot.range;
      this.raycaster.set(new THREE.Vector3(this.player.pos.x,1,this.player.pos.z), dir);
      const meshes=[...this.enemies, this.boss].filter(Boolean).map(e=>e.mesh).filter(Boolean);
      const hit=this.raycaster.intersectObjects(meshes);
      if(hit.length){
        const mesh=hit[0].object;
        const en=[...this.enemies, this.boss].find(e=>e.mesh===mesh || e.mesh?.children?.includes(mesh));
        if(en){
          const dmg=calcDamage(25, en.defense||2);
          en.takeDamage(dmg); this.audio.play('pistol_hit',{channel:'effects'});showNotif(`🔫 -${dmg} ${en.name}`);
          if(en.state==='DEAD') this.onKill(en);
        }
      } else showNotif('🔫 Bang! '+this.pistol.mag+'/'+this.pistol.magSize);
    }
  }
  onKill(en){
    const loot=rollLoot(en.loot||'slime_loot');
    loot.forEach(l=>{ try{ inventory.add(l.id,l.amount); showNotif(`+${l.amount} ${l.id}`) }catch{} });
    this.player.addXP(en.xp||12); this.player.coins+=10;
    this.profile.add('enemiesDefeated');this.profile.collect('enemies',en.baseId||en.id);this.quests.record('kill',en.baseId||en.id,1);if(!this.boss&&this.quests.quests.find(q=>q.id==='guardian_forest')?.active)this.spawnEnemies();
    showNotif(`+${en.xp} XP`);
    // Common enemies recycle after 12 seconds; elite, mini-bosses and bosses do not.
    if(!en.elite && !en.mini && !en.boss) setTimeout(()=>{
      const mob=spawnMob(en.baseId||en.id, (Math.random()-0.5)*30, (Math.random()-0.5)*30);
      if(mob){ const mesh=en.mesh; mesh.position.set(mob.x,0.8,mob.z); mesh.material.color.set(mob.id==='slime'?0x2ecc71:0xe67e22); mob.mesh=mesh; mob.ai=new EnemyAI(mob); mob.hp=mob.maxHp; mob.state='IDLE'; this.enemies.push(mob); }
    },12000);
    // boss check
    if(en.boss){
      this.profile.add('bossesDefeated');this.audio.play(en.music||'boss_victory',{channel:'music'});
      this.playCutscene('Vitória! Guardião derrotado', ()=>{
        showNotif(`🎉 ${en.name} derrotado!`);
        document.getElementById('boss-bar').style.display='none';
      });
    }
  }
  tryInteract(){
    if(this.exitTrain()) return;
    if(!this.playerState.is(PLAYER_STATES.ON_FOOT, PLAYER_STATES.COMBAT)) return;
    this.playerAnimator?.play(PLAYER_ANIMATIONS.INTERACT);
    // near train?
    const dTrain=Math.hypot(this.player.pos.x - this.train.x, this.player.pos.z - this.train.z);
    if(dTrain<2.6){
      // quest inspect
      const q=this.quests.quests.find(x=>x.id==='first_departure');
      if(q && !q.objectives[0].done){ this.quests.record('interact','train');showNotif('Locomotiva inspecionada'); }
      // fuel check
      if(inventory.count('coal')>=3){
        // auto fuel handled via E on train? we do: if has coal, consume 3 and add fuel
        if(q && !q.objectives[1].done && inventory.count('coal')>=3){
          inventory.remove('coal',3); this.train.fuel=Math.min(100,this.train.fuel+30);this.quests.record('collect','coal',3);showNotif('Abastecido +30%');
        } else if(inventory.count('coal')>=1){
          inventory.remove('coal',1); this.train.fuel=Math.min(100,this.train.fuel+10); showNotif('⛽ +10%');
        }
      }
      // enter
      if(q && q.objectives[1].done){
        this.enterTrain();this.quests.record('interact','enter');showNotif('Entrou na cabine — Q para acelerar, E para frear, F para sair');
        this.playCutscene('Cabine: VELO 0 km/h, COMB  '+Math.round(this.train.fuel)+'%, INTEG '+Math.round(this.train.integ)+'%', ()=>{});
      } else {
        this.enterTrain(); showNotif('Cabine');
      }
      return;
    }
    for(const station of this.stations){
      if(Math.hypot(station.x-this.player.pos.x, station.z-this.player.pos.z)<2.25){
        this.openCrafting(station.type);
        showNotif(station.type==='furnace'?'Fornalha aberta':'Mesa de Crafting aberta');
        return;
      }
    }
    for(const npc of this.npcs){
      if(Math.hypot(npc.x-this.player.pos.x,npc.z-this.player.pos.z)<2.3){
        this.openNpc(npc);showNotif('Novo diálogo registrado no diário');return;
      }
    }
    // near resource?
    for(const r of this.resources){
      if(r.depleted) continue;
      const d=Math.hypot(r.x - this.player.pos.x, r.z - this.player.pos.z);
      if(d<2.2){
        const toolId=selectedItem(),tool=inventory.item(toolId),toolKind=toolId?.startsWith('axe')?'axe':toolId?.startsWith('pick')?'pick':null;
        const hit=r.hit({tool:toolKind,tier:tool?.tier??-1,power:tool?.efficiency||1});
        if(!hit.ok){showNotif(hit.reason);return}
        const durability=inventory.damageDurability(toolId,1);if(durability.broken)showNotif(`${tool.name} quebrou!`);
        this.playerAnimator?.play(PLAYER_ANIMATIONS.INTERACT);this.audio.play(r.tool==='axe'?'chop':'mine_hit',{channel:'effects'});
        if(r.mesh){r.mesh.scale.setScalar(Math.max(.62,.7+hit.ratio*.3));r.mesh.traverse?.(child=>{if(child.material?.emissive){child.material.emissive.set(0x5a2600);child.material.emissiveIntensity=1;setTimeout(()=>{child.material.emissiveIntensity=.1},90)}})}
        for(let i=0;i<4;i++){const particle=this.particlePool.acquire({x:r.x+(Math.random()-.5)*.4,y:.6+Math.random()*.5,z:r.z+(Math.random()-.5)*.4});if(!particle.parent)this.scene.add(particle);setTimeout(()=>this.particlePool.release(particle),240)}
        if(hit.depleted){
          if(r.mesh)r.mesh.visible=false;
          for(const drop of hit.drops){try{inventory.add(drop.id,drop.amount);this.quests.record('collect',drop.id,drop.amount);this.profile.collect('resources',drop.id);showNotif(`+${drop.amount} ${drop.id}`)}catch{showNotif('Inventário cheio')}}
          this.profile.add('resourcesMined');setTimeout(()=>{r.respawn();if(r.mesh){r.mesh.visible=true;r.mesh.scale.set(1,1,1)}},r.respawnTime||18000);
        } else showNotif(`Coletando… ${Math.ceil(r.hp)}/${r.maxHp}`);
        return;
      }
    }
    showNotif('Nada para interagir');
  }
  advanceObjective(type,target,amount=1){
    return this.quests.record(type,target,amount);
  }
  chooseTravelEvent(choice){const result=this.travelEvents.choose(choice,{inventory,train:this.train});if(result.ok){document.getElementById('travel-event')?.classList.remove('active');if(this.playerState.is(PLAYER_STATES.MENU))this.closeMenu();showNotif(`Evento resolvido: ${result.result}`);this.quests.record('choice',result.result,1)}else showNotif(result.reason);return result}
  showTransition(title, subtitle, hint, onDone){
    if(this.transitioning) return;
    this.transitioning=true;
    const el=document.getElementById('transition');
    const bar=document.getElementById('transition-bar');
    const t=document.getElementById('transition-title');
    const s=document.getElementById('transition-subtitle');
    const h=document.getElementById('transition-hint');
    if(t) t.textContent=title;
    if(s) s.textContent=subtitle;
    if(h) h.textContent=hint;
    if(el) el.classList.add('active');
    let p=0;
    const iv=setInterval(()=>{
      p+= Math.random()*18+8;
      if(p>100) p=100;
      if(bar) bar.style.width=p+'%';
      if(p>=100){
        clearInterval(iv);
        setTimeout(()=>{
          if(el) el.classList.remove('active');
          if(bar) bar.style.width='0%';
          this.transitioning=false;
          onDone&&onDone();
        }, 420);
      }
    }, 140);
  }
  loadForest(){
    if(this.forestLoaded) return;
    this.forestLoaded=true;
    this.scene.background=new THREE.Color(0x1a3a1a);
    this.scene.fog=new THREE.Fog(0x1a3a1a, 40, 140);
    for(let i=0;i<14;i++){
      const x=22+Math.random()*28;
      const z=(Math.random()-0.5)*34;
      const g=new THREE.Group();
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.3,1.4,7), new THREE.MeshStandardMaterial({color:0x3b2314}));
      trunk.position.y=0.7; g.add(trunk);
      const leaves=new THREE.Mesh(new THREE.SphereGeometry(0.95,10,10), new THREE.MeshStandardMaterial({color:0x0f2a0f}));
      leaves.position.y=1.9; g.add(leaves);
      g.position.set(x,0,z); this.scene.add(g); this.obstacles.push({x,z,radius:.72});
    }
    const extras=[
      {type:'iron_ore',x:26,z:6},{type:'iron_ore',x:30,z:-8},{type:'crystal',x:32,z:4},{type:'coal',x:28,z:10},{type:'scrap',x:24,z:-12},{type:'herbs',x:27,z:-5},
    ];
    extras.forEach(d=>{
      let mesh;
      if(d.type==='iron_ore') mesh=new THREE.Mesh(new THREE.OctahedronGeometry(0.6), new THREE.MeshStandardMaterial({color:0xff8c00}));
      else if(d.type==='crystal') mesh=new THREE.Mesh(new THREE.OctahedronGeometry(0.55), new THREE.MeshStandardMaterial({color:0x7ec8e3, emissive:0x1a5a7a, emissiveIntensity:0.3}));
      else if(d.type==='coal') mesh=new THREE.Mesh(new THREE.SphereGeometry(0.45,8,8), new THREE.MeshStandardMaterial({color:0x111111}));
      else if(d.type==='scrap') mesh=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.4,0.6), new THREE.MeshStandardMaterial({color:0x8a7a5a}));
      else mesh=new THREE.Mesh(new THREE.SphereGeometry(0.4,6,6), new THREE.MeshStandardMaterial({color:0x2d8a4e}));
      mesh.position.set(d.x,0.5,d.z); this.scene.add(mesh);
      const definition=resourceDefinition(d.type)||{tool:'pick',tier:0,hp:2,drops:[{item:d.type,amount:1,chance:1}]};const node=new ResourceNode({id:'forest'+Math.random(),...d,...definition});node.mesh=mesh;this.resources.push(node);
    });
    this.spawnEnemies();
    const q=this.quests.quests.find(x=>x.id==='forest_threat');
    if(q && !q.active && !q.completed){ q.active=true; showNotif('Nova missão: Ameaça da Floresta'); }
  }
  tryRepair(){
    if(this.brokenRepaired) return;
    const d=Math.hypot(14 - this.player.pos.x, 10 - this.player.pos.z);
    if(d<3){
      if(inventory.count('scrap')>=3 && inventory.count('iron_ingot')>=2){
        inventory.remove('scrap',3); inventory.remove('iron_ingot',2);
        this.brokenRepaired=true; if(this.railObj?.broken) this.railObj.broken.visible=false;
        this.profile.add('railsRepaired');
        showNotif('Trilho reparado! Preparando travessia...');
        this.showTransition('Carregando Floresta...', 'Trilho restaurado • 18km à frente', 'Dica: esporos venenosos são fracos contra fogo', ()=>{
          this.loadForest();
          showNotif('🌲 Floresta Antiga desbloqueada! Atravesse o túnel em X≈18');
          this.player.pos.x=18.5; this.player.pos.z=10; if(this.playerMesh) this.playerMesh.position.set(this.player.pos.x,0.9,this.player.pos.z);
          this.doSave(true);
        });
      } else showNotif('Precisa 3 sucata +2 lingotes');
    }
  }
  accelerate(){
    if(this.train.fuel<=0){ showNotif('Sem combustível!'); return }
    this.train.accelerate(.35);
    const q=this.quests.quests.find(x=>x.id==='first_departure');
    if(q && !q.objectives[3].done){this.quests.record('travel','depart');showNotif('Partiu! 🚂');this.playCutscene('Primeira partida completa!',()=>{})}
  }
  toggle(name){
    const el=document.getElementById(name); if(!el) return;
    const is=el.classList.contains('active');
    document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('active'));
    if(is) this.closeMenu();
    else if(this.beginMenu()) el.classList.add('active');
    if(name==='inventory-panel') renderInventory();
    if(name==='quests-panel') this.renderQuests();
    if(name==='map-panel') this.renderMap();
    if(name==='profile-panel') this.renderProfile();
  }
  togglePause(){
    const el=document.getElementById('pause-menu');
    if(this.playerState.is(PLAYER_STATES.MENU)){ this.closeMenu(); return; }
    if(!this.beginMenu()) return;
    document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('active'));
    el.classList.add('active');
  }
  renderQuests(){
    const list=document.getElementById('quest-list'); if(!list) return;
    list.innerHTML='';
    for(const q of this.quests.quests){
      if(!q.active && !q.completed) continue;
      const d=document.createElement('div'); d.className='quest';
      d.innerHTML=`<b>${q.name}</b> ${q.completed?'✅':'🕒'}<br>`+q.objectives.map(o=> (o.done?'☑':'☐')+' '+o.description).join('<br>');
      list.appendChild(d);
    }
  }
  renderMap(){
    const canvas=document.getElementById('map-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');ctx.fillStyle='#101914';ctx.fillRect(0,0,canvas.width,canvas.height);
    for(const region of RegionDB.all()){const x=(region.center.x+50)/520*canvas.width;if(this.fogOfWar.isRevealed(region.center)||region.id==='plain'){ctx.fillStyle=`#${region.color.toString(16).padStart(6,'0')}`;ctx.fillRect(x-15,60,30,50);ctx.fillStyle='#fff';ctx.fillText(region.name,x-14,55)}else{ctx.fillStyle='#050706';ctx.fillRect(x-15,60,30,50)}}
    const px=(this.player.pos.x+50)/520*canvas.width;ctx.fillStyle='#ffd84d';ctx.beginPath();ctx.arc(px,90,4,0,Math.PI*2);ctx.fill();for(const marker of this.fogOfWar.visibleMarkers()){ctx.fillStyle=marker.type==='quest'?'#f6c':'#8cf';ctx.fillRect((marker.x+50)/520*canvas.width,80+marker.z,4,4)}
  }
  renderProfile(){
    const element=document.getElementById('profile-content');if(!element)return;const achievements=[...this.profile.achievements].join(', ')||'Nenhuma ainda';const entries=[...this.codex.entries.values()].map(entry=>`• ${entry.name||entry.id}`).join('\n')||'Nenhuma descoberta';
    element.textContent=`ESTATÍSTICAS\nInimigos: ${this.profile.stats.enemiesDefeated}\nChefes: ${this.profile.stats.bossesDefeated}\nRecursos: ${this.profile.stats.resourcesMined}\nRegiões: ${this.profile.stats.regionsDiscovered}/8\n\nCONQUISTAS\n${achievements}\n\nCODEX E DIÁRIO\n${entries}`;
  }
  renderObjective(){
    const el=document.getElementById('objective-tracker'); if(!el) return;
    const q=this.quests.active();
    if(!q){ if(this._lastObjectiveText!=='Nenhum objetivo ativo'){ el.textContent='Nenhum objetivo ativo'; this._lastObjectiveText='Nenhum objetivo ativo'; } return; }
    const next=q.objectives.find(o=>!o.done);
    const text=`<b>${q.name}</b><br>${next?`▸ ${next.description}${next.amount>1?` (${next.progress||0}/${next.amount})`:''}`:'✓ Objetivos concluídos'}`;
    if(text!==this._lastObjectiveText){ el.innerHTML=text; this._lastObjectiveText=text; }
  }
  updateQuestHUD(){
    const q=this.quests.active();
    if(q){
      // could update top bar if needed
    }
  }
  applySave(data){
    try{
      if(data.inventory) inventory.fromJSON(data.inventory);
      if(data.player){
        this.player.level=Number.isFinite(data.player.level)?data.player.level:1;
        this.player.xp=Number.isFinite(data.player.xp)?data.player.xp:0;
        this.player.coins=Number.isFinite(data.player.coins)?data.player.coins:100;
        const p=data.player.pos;
        if(p && Number.isFinite(p.x) && Number.isFinite(p.z)) this.player.pos={x:p.x,y:Number.isFinite(p.y)?p.y:.9,z:p.z};
        if(data.player.train && Number.isFinite(data.player.train.x) && Number.isFinite(data.player.train.z)){
          this.train.fromJSON(data.player.train);
          if(this.train.inTrain){
            this.transitionPlayer(PLAYER_STATES.ENTERING_TRAIN, {reason:'load-save'});
            this.transitionPlayer(PLAYER_STATES.IN_TRAIN, {reason:'load-save'});
          }
        }
      }
      if(data.quests) this.quests.quests=data.quests;
      hotbarFromJSON(data.hotbar);
      if(data.world){this.brokenRepaired=!!data.world.brokenRepaired;if(this.brokenRepaired&&this.railObj?.broken)this.railObj.broken.visible=false;if(data.world.construction){this.construction.fromJSON(data.world.construction);for(const structure of this.construction.placed)this.createStation(structure.type,structure.x,structure.z,false,structure.id)}if(data.world.fog)this.fogOfWar.fromJSON(data.world.fog);if(data.world.codex)this.codex.fromJSON(data.world.codex);if(data.world.dialogue){this.dialogue.history=data.world.dialogue.history||[];this.dialogue.flags=data.world.dialogue.flags||{}}if(data.world.forestLoaded){this.forestLoaded=false;this.loadForest()}}
      if(data.profile)this.profile.fromJSON(data.profile);if(data.reputation)this.reputation.fromJSON(data.reputation);if(data.missionCargo)this.missionCargo.fromJSON(data.missionCargo);
    }catch{}
  }
  onResize(){
    this.camera.aspect=window.innerWidth/window.innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(window.innerWidth,window.innerHeight);
  }
  setQuality(quality){
    this.renderer.setPixelRatio(quality==='Baixa'?1:quality==='Média'?Math.min(1.5, window.devicePixelRatio):Math.min(2, window.devicePixelRatio));
    this.renderer.shadowMap.enabled=quality!=='Baixa';
  }
  applySettings(settings={}){
    this.settings={...this.settings,...settings,controls:{...this.settings.controls,...(settings.controls||{})}};this.setQuality(settings.quality||'Alta');
    const ratio=(settings.resolution||1)*Math.min(2,window.devicePixelRatio||1);this.renderer.setPixelRatio(ratio);this.renderer.shadowMap.enabled=settings.quality!=='Baixa';this.renderer.toneMappingExposure=settings.postProcessing===false?1:1.15;this.camera.far=90+(settings.viewDistance||2)*85;this.camera.updateProjectionMatrix();this.worldStreaming.setLoadRadius(settings.viewDistance||2);this.weatherParticles.visible=settings.particles!==false&&this.weatherSystem.state.particles;this.cameraSensitivity=(settings.sensitivity||100)/100;this.setCameraDistance(settings.cameraDistance||9,false);
    for(const channel of ['music','effects','ambient','interface'])this.audio.setVolume((settings[channel]??80)/100,channel);this.audio.setVolume((settings.volume??80)/100,'master');
    this.scene.traverse(object=>{if(object.name==='vegetation')object.visible=(settings.vegetation??100)>0;if(object.material?.map)object.material.map.anisotropy=settings.textures==='high'?4:settings.textures==='medium'?2:1});
    if(settings.fullscreen&&!document.fullscreenElement)this.canvas.requestFullscreen?.().catch(()=>{});else if(!settings.fullscreen&&document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
  }
  setCameraDistance(distance, persist=true){
    this.dist=Math.max(4,Math.min(16,Number(distance)||9));
    if(persist){
      try{
        const settings=JSON.parse(localStorage.getItem('carpincho_settings')||'{}');
        settings.cameraDistance=this.dist;
        localStorage.setItem('carpincho_settings',JSON.stringify(settings));
      }catch{}
    }
  }
  attachMultiplayer(multiplayer){
    this.multiplayer=multiplayer;
    document.getElementById('chat')?.classList.add('active');
    multiplayer.onMessage(message=>{
      if(message.type==='PLAYER_STATE'&&message.payload.playerId!==multiplayer.playerId){const state=message.payload;let remote=this.remotePlayers.get(state.playerId);if(!remote){const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(.4,.8,4,8),new THREE.MeshStandardMaterial({color:0x8ecae6}));mesh.position.set(state.x,.8,state.z);this.scene.add(mesh);remote={mesh,x:state.x,z:state.z};this.remotePlayers.set(state.playerId,remote)}remote.x=state.x;remote.z=state.z;remote.mesh.rotation.y=state.yaw||0}
      else if(message.type==='TRAIN_STATE'&&!multiplayer.isHost)this.train.fromJSON({...this.train.toJSON(),...message.payload});
      else if(message.type==='WORLD_STATE'&&!multiplayer.isHost){for(const state of message.payload.mobs||[]){const enemy=this.enemies.find(item=>(item.baseId||item.id)===state.id);if(enemy)Object.assign(enemy,state)}}
      else if(message.type==='CHAT'){const log=document.getElementById('chat-log');if(log){const line=document.createElement('div');line.textContent=`${message.payload.from}: ${message.payload.text}`;log.appendChild(line);log.scrollTop=log.scrollHeight}}
      else if(message.type==='PLAYER_LEFT'){const remote=this.remotePlayers.get(message.payload.playerId);if(remote){this.scene.remove(remote.mesh);this.remotePlayers.delete(message.payload.playerId)}}
    });
  }
  update(dt){
    this._streamTimer=(this._streamTimer||0)-dt;
    if(this._streamTimer<=0){ this._streamTimer=.5; this.worldStreaming.update(this.player.pos);this.fogOfWar.reveal(this.player.pos,1);const region=RegionDB.at(this.player.pos);if(region.id!==this.currentRegion.id){this.currentRegion=region;this.codex.discover(region.id,{type:'region',name:region.name});this.profile.collect('regions',region.id);this.profile.stats.regionsDiscovered=this.profile.collections.regions.size;this.weatherSystem.set(region.climates[0],1);this.quests.record('travel',region.id,1);showNotif(`Região descoberta: ${region.name}`)}for(const landmark of this.regionalWorld.landmarks)if(!landmark.discovered&&Math.hypot(landmark.x-this.player.pos.x,landmark.z-this.player.pos.z)<5){landmark.discovered=true;this.codex.discover(landmark.id,{type:'landmark',name:landmark.type});this.quests.record('exploration',landmark.type,1);showNotif(`Local descoberto: ${landmark.type}`)}for(const npc of this.npcs){npc.activity=npc.routine?npcActivity(npc,this.dayNight.time):'workshop';npc.mesh.visible=Math.abs(npc.x-this.player.pos.x)<70} }
    this.dayNight.tick(dt); this.timeOfDay=this.dayNight.phase();
    const night=this.timeOfDay==='noite'||this.timeOfDay==='madrugada';
    const weatherState=this.weatherSystem.tick(dt);this.weather=weatherState.type;
    if(this.scene.fog){this.scene.fog.near=(night?35:60)*weatherState.visibility;this.scene.fog.far=180*weatherState.visibility;this.scene.fog.color.set(weatherState.type==='sandstorm'?0xb69662:weatherState.type==='snow'?0xbacbd5:weatherState.type==='fog'?0x89958f:(night?0x10182f:0x87ceeb))}if(this.sunLight)this.sunLight.intensity=(night?.28:1.2)*weatherState.ambient;if(this.weatherParticles){this.weatherParticles.visible=Boolean(weatherState.particles);this.weatherParticles.position.set(this.player.pos.x,0,this.player.pos.z);const position=this.weatherParticles.geometry.attributes.position;for(let i=1;i<position.array.length;i+=3){position.array[i]-=dt*(weatherState.type==='snow'?3:12);if(position.array[i]<0)position.array[i]=18}position.needsUpdate=true}
    if(this.playerState.is(PLAYER_STATES.COMBAT)){
      this._combatTimer-=dt;
      if(this._combatTimer<=0) this.transitionPlayer(PLAYER_STATES.ON_FOOT, {reason:'combat-finished'});
    }
    let landed=false;
    if(this.playerState.canMove){
      const wasGrounded=this.grounded;
      this.jumpVelocity-=18*dt; this.player.pos.y+=this.jumpVelocity*dt;
      if(this.player.pos.y<=.9){ this.player.pos.y=.9; this.jumpVelocity=0; this.grounded=true; landed=!wasGrounded; }
      if(landed) this.playerAnimator?.play(PLAYER_ANIMATIONS.LAND);
    }
    // player movement
    if(this.playerState.canMove){
      const fwd=this._moveFwd; this.camera.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
      const right=this._moveRight.crossVectors(fwd, this._up).negate();
      const mv=this._moveVec.set(0,0,0);
      if(this.keys['forward']||this.keys['w']) mv.add(fwd);
      if(this.keys['back']||this.keys['s']) mv.sub(fwd);
      if(this.keys['left']||this.keys['a']) mv.add(right);
      if(this.keys['right']||this.keys['d']) mv.sub(right);
      let moving=false;
      let sprinting=false;
      if(mv.length()>0 && this.grounded){
        mv.normalize();
        moving=true;
        sprinting=(this.keys['sprint']||this.keys['shift']) && this.player.stamina.use(10*dt);
        const spd=sprinting?6:4;
        if(!sprinting) this.player.stamina.regen(dt); else this.player.stamina.regen(dt*.2);
        const next=resolveCircleMovement(this.player.pos,{x:mv.x*spd*dt,z:mv.z*spd*dt},this.getPlayerColliders());
        this.player.pos.x=next.x; this.player.pos.z=next.z;
      } else this.player.stamina.regen(dt);
      if(!this.brokenRepaired && this.player.pos.x>13.2 && Math.abs(this.player.pos.z-10)<4){
        this.player.pos.x=13.2;
        const pr=document.getElementById('prompt'); if(pr) pr.textContent='⛔ Trilho quebrado — pressione R com 3 sucata +2 lingotes';
      }
      if(this.brokenRepaired && !this.forestLoaded && this.player.pos.x>16.5 && Math.abs(this.player.pos.z-10)<5 && !this.transitioning){
        this.showTransition('Entrando na Floresta...', 'Carregando terreno • novos recursos e inimigos', 'Cuidado: Guardião protege a ruína ao norte', ()=>{
          this.loadForest();
          showNotif('Chegou na Floresta!');
        });
      }
      // clamp
      this.player.pos.x=Math.max(-45,Math.min(465,this.player.pos.x));
      this.player.pos.z=Math.max(-45,Math.min(45,this.player.pos.z));
      if(this.playerMesh){
        this.playerMesh.position.set(this.player.pos.x,this.player.pos.y,this.player.pos.z);
        if(moving) this.playerMesh.rotation.y=facingYaw(mv);
        this.playerAnimator?.update(dt,{playerState:this.state,moving,sprinting,grounded:this.grounded});
      }
    } else if(this.playerState.is(PLAYER_STATES.IN_TRAIN, PLAYER_STATES.DRIVING)) {
      // in train: move train along Z? simple
      if(this.keys['e']||this.keys['s']) this.train.brake(.6);
      this.train.tick(dt,{slope:this.train.x>100&&this.train.x<150?.08:this.train.x>280&&this.train.x<330?-.05:0});
      if(this.train.speed>0.01){
        if(this.playerState.is(PLAYER_STATES.IN_TRAIN)) this.transitionPlayer(PLAYER_STATES.DRIVING);
        const nextX=this.train.x + this.train.speed*dt*0.6;
        if(!this.brokenRepaired && nextX>13.2 && Math.abs(this.train.z-10)<3){
          this.train.speed=0;
          showNotif('⛔ Trilho bloqueado — repare antes de prosseguir');
        } else {
          this.train.x=nextX;
          if(!this.forestLoaded && this.brokenRepaired && this.train.x>16.5 && !this.transitioning){
            this.showTransition('Trem entrando na Floresta...', 'Trilhos rangendo • carregando novo bioma', 'Prepare armas — esporos à frente', ()=>{
              this.loadForest();
            });
          }
        }
        if(this.train.x>465) this.train.x=-45;
        if(this.trainMesh) this.trainMesh.position.set(this.train.x,0,this.train.z);
        // player follows train
        const seat=this.getTrainPoint('driver');this.player.pos={...seat};if(this.playerMesh)this.playerMesh.position.set(seat.x,seat.y,seat.z);
        if(this.train.fuel<=0) this.train.speed=0;
        this._worldTimer+=dt;if(this._worldTimer>12&&!this.travelEvents.active){this._worldTimer=0;const event=this.travelEvents.roll(.45);if(event&&this.beginMenu()){this.train.throttle=0;const panel=document.getElementById('travel-event'),title=document.getElementById('travel-event-title');if(title)title.textContent=event.title;if(panel)panel.classList.add('active')}}
      } else if(this.playerState.is(PLAYER_STATES.DRIVING)) {
        this.transitionPlayer(PLAYER_STATES.IN_TRAIN);
      }
      this.player.stamina.regen(dt);
    }
    const dashboard=document.getElementById('train-dashboard');if(dashboard){dashboard.classList.toggle('active',this.train.inTrain);const values={speed:this.train.speed.toFixed(1),distance:(this.train.routeProgress/1000).toFixed(1),fuel:Math.round(this.train.fuel),integrity:Math.round(this.train.integrity)};for(const [key,value]of Object.entries(values)){const element=document.getElementById(`train-${key}`);if(element)element.textContent=value}const destination=document.getElementById('train-destination');if(destination)destination.textContent=`DESTINO: ${this.currentRegion.name.toUpperCase()}`}
    const reload=this.pistol.tick(dt);if(reload?.completed)showNotif(`Recarregado ${reload.mag}/${this.pistol.magSize}`);
    this.profile.add('playTime',dt);
    this._lodTimer-=dt;if(this._lodTimer<=0){this._lodTimer=.5;updateDistanceLOD(this.resources.map(r=>r.mesh).filter(Boolean),this.player.pos,{near:28,far:85})}
    // enemies AI
    for(const en of this.enemies){
      if(en.state==='DEAD') continue;
      en.ai.update(dt, this.player.pos);
      if(en.mesh){ en.mesh.position.set(en.x,0.8,en.z); en.mesh.rotation.y += (en.state==='PATROL'?0.35:1.1)*dt; const bob=en.state==='IDLE'||en.state==='PATROL'?Math.sin(performance.now()/240+en.x)*.035:0; en.mesh.position.y=.8+bob; }
      if(en.state==='ATTACK'){
        // damage player every 1s
        en._cd=(en._cd||0)-dt; if(en._cd<=0){ en._cd=1.1; this.damagePlayer(en.damage||8); showNotif(`-${en.damage} de ${en.name}`); }
      }
    }
    if(this.boss && this.boss.state!=='DEAD'){
      if(!this.boss.ai) this.boss.ai=new EnemyAI(this.boss);
      this.boss.ai.update(dt,this.player.pos);
      if(this.boss.mesh) this.boss.mesh.position.set(this.boss.x,1.4,this.boss.z);
      this.boss.updatePhase();
      const bar=document.getElementById('boss-bar'); if(bar){ bar.style.display='block'; document.getElementById('boss-name').textContent=this.boss.name + ' FASE '+(this.boss.phase+1); document.getElementById('bar-boss').style.width=(this.boss.hp/this.boss.maxHp*100)+'%'; document.getElementById('boss-hp').textContent=Math.round(this.boss.hp/this.boss.maxHp*100)+'%'; }
      const distance=Math.hypot(this.boss.x-this.player.pos.x, this.boss.z-this.player.pos.z);
      this.boss._attackCd=(this.boss._attackCd||0)-dt;
      if(this.boss._attackCd<=0){
        if(this.boss.phase===0 && distance<4){
          this.damagePlayer(20); this.boss._attackCd=2.5; showNotif('Guardião: Esmagamento!');
        } else if(this.boss.phase>=1 && distance<12){
          const dx=this.player.pos.x-this.boss.x, dz=this.player.pos.z-this.boss.z, l=Math.hypot(dx,dz)||1;
          this.boss.x+=dx/l*3.5; this.boss.z+=dz/l*3.5; this.damagePlayer(28); this.boss._attackCd=3.5; showNotif('Guardião: Investida!');
        } else if(this.boss.phase>=2){
          const mob=spawnMob('spore',this.boss.x-2,this.boss.z+2);
          if(mob){const mesh=this.mobPool.acquire({x:mob.x,z:mob.z});if(!mesh.parent)this.scene.add(mesh);mob.mesh=mesh;mob.ai=new EnemyAI(mob);mob.temporary=true;this.enemies.push(mob)}
          this.boss._attackCd=5; showNotif('Guardião: criaturas invocadas!');
        } else this.boss._attackCd=1;
      }
    }
    if(this.player.health.dead && !this.playerState.is(PLAYER_STATES.DEAD)){
      this.train.speed=0;
      this.transitionPlayer(PLAYER_STATES.DEAD, {reason:'health-depleted'});
      this.playerAnimator?.update(dt,{playerState:PLAYER_STATES.DEAD,grounded:true});
      const deathScreen=document.getElementById('death-screen'); if(deathScreen) deathScreen.style.display='flex';
    }
    // camera
    const target=this._cameraTarget.set(this.train.inTrain?this.train.x:this.player.pos.x,this.train.inTrain?this.driverSeat.y:this.player.pos.y,this.train.inTrain?this.train.z:this.player.pos.z);
    const camX=target.x + Math.sin(this.yaw)*this.dist;
    const camZ=target.z + Math.cos(this.yaw)*this.dist;
    const camY=target.y + 4 + Math.sin(this.pitch)*3;
    const shake=this.cameraShakeOffset||0;this.cameraShakeOffset=Math.max(0,shake-dt*.8);this._cameraPos.set(camX+(Math.random()-.5)*shake,camY+(Math.random()-.5)*shake,camZ+(Math.random()-.5)*shake); this.camera.position.lerp(this._cameraPos, 0.12);
    this.camera.lookAt(target);
    // furnace
    this.furnace.tick(dt);
    const fb=document.getElementById('furnace-bar'); if(fb) fb.style.width=(this.furnace.progress*100)+'%';
    // HUD
    this._hudTimer-=dt;
    if(this._hudTimer<=0){
      this._hudTimer=.1;
      updateHUD({hp: this.player.health.current, stamina: this.player.stamina.current, lv:this.player.level, xp:this.player.xp, coins:this.player.coins, fuel:this.train.fuel, integ:this.train.integ, weapon: this.weapon==='sword'?'⚔️ Espada' : `🔫 ${this.pistol.mag}/6`, region: this.player.pos.x>18?'Floresta':'Planície'});
      this.renderObjective();
    }
    for(const remote of this.remotePlayers.values()) remote.mesh.position.lerp(new THREE.Vector3(remote.x,.8,remote.z),Math.min(1,dt*12));
    if(this.multiplayer){
      this.networkTimer-=dt;
      if(this.networkTimer<=0){
        this.networkTimer=.05;
        this.multiplayer.sendState({x:this.player.pos.x,z:this.player.pos.z,yaw:this.playerMesh?.rotation.y||0,speed:0});
        this.networkWorldTimer=(this.networkWorldTimer||0)-.05;if(this.multiplayer.isHost&&this.networkWorldTimer<=0){this.networkWorldTimer=.1;this.multiplayer.sendTrain({x:this.train.x,z:this.train.z,speed:this.train.speed,fuel:this.train.fuel});this.multiplayer.sendWorld({mobs:this.enemies.filter(enemy=>enemy.state!=='DEAD').map(enemy=>({id:enemy.baseId||enemy.id,x:enemy.x,z:enemy.z,hp:enemy.hp,state:enemy.state})),bosses:this.boss?[{id:this.boss.id,x:this.boss.x,z:this.boss.z,hp:this.boss.hp,state:this.boss.state}]:[],events:this.travelEvents.history.slice(-8)})}
      }
    }
    // auto save checkpoint
    this._saveCd=(this._saveCd||0)-dt; if(this._saveCd<=0){ this._saveCd=12; this.doSave(true) }
  }
  doSave(silent){
    const data={player:{level:this.player.level,xp:this.player.xp,coins:this.player.coins,pos:this.player.pos,train:this.train.toJSON(),equipment:this.equipment.toJSON()},inventory:inventory.toJSON(),hotbar:hotbarToJSON(),quests:this.quests.quests,profile:this.profile.toJSON(),reputation:this.reputation.toJSON(),missionCargo:this.missionCargo.toJSON(),world:{brokenRepaired:this.brokenRepaired,forestLoaded:this.forestLoaded,construction:this.construction.toJSON(),fog:this.fogOfWar.toJSON(),codex:this.codex.toJSON(),dialogue:this.dialogue.toJSON()}};
    const saved=this.saveMgr.save(data);if(!silent)showNotif(saved?'Jogo salvo':'Falha ao salvar');const button=document.getElementById('btn-continuar');if(button&&saved)button.disabled=false;return saved;
  }
  loop(){
    requestAnimationFrame(()=>this.loop());
    const dt=Math.min(0.05,this.clock.getDelta());
    this.fps=Math.round(1 / Math.max(dt, 0.0001));
    if(!this._paused) this.update(dt);
    this.renderer.render(this.scene,this.camera);
  }
  start(){ this.loop(); }
}
