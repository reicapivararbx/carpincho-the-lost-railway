import * as THREE from 'three';
import { createTerrain } from './world/terrain.js';
import { createRails } from './train/rails.js';
import { Player } from './player/player.js';
import { inventory } from './inventory/inventory.js';
import { craft, canCraft } from './crafting/crafting.js';
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
import { RecipeDB } from './data/recipes.js';
import { AudioManager } from './audio/audioManager.js';

export class Game{
  constructor(canvas){
    this.canvas=canvas;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x87ceeb);
    this.scene.fog=new THREE.Fog(0x87ceeb, 60, 180);
    this.renderer=new THREE.WebGLRenderer({canvas, antialias:true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled=true;
    this.camera=new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 500);
    this.clock=new THREE.Clock();
    this.weather='sol'; this.timeOfDay='dia'; this.fps=0;
    this.player=new Player();
    this.quests=new QuestManager();
    this.cutscene=new CutsceneManager();
    this.audio=new AudioManager();
    this.saveMgr=new SaveManager();
    this.furnace=new Furnace((output)=>{
      try { inventory.add(output, 1); showNotif(`🔥 Fundição concluída: +1 lingote de ferro`); }
      catch { showNotif('Fundição pronta, mas o inventário está cheio.'); }
    });
    this.sword=new Sword();
    this.pistol=new Pistol();
    this.weapon='sword'; // sword|pistol
    this.train={x:0, z:10, speed:0, fuel:80, integ:100, weight:1200, inTrain:false};
    this.keys={};
    this.mouse={x:0,y:0,down:false,dx:0,dy:0};
    this.yaw=-0.4; this.pitch=0.25; this.dist=9;
    this.resources=[];
    this.stations=[];
    this.remotePlayers=new Map(); this.multiplayer=null; this.networkTimer=0;
    this.enemies=[];
    this.boss=null;
    this.brokenRepaired=false;
    this.forestLoaded=false;
    this.transitioning=false;
    this.raycaster=new THREE.Raycaster();
    this.mousePos=new THREE.Vector2();
    this.playerMesh=null; this.trainMesh=null; this.railObj=null;
    this.checkpoint={x:0,z:0};
    this.init();
  }
  init(){
    // lights
    const amb=new THREE.HemisphereLight(0xffffff, 0x2d5a1e, 1.1); this.scene.add(amb);
    const dir=new THREE.DirectionalLight(0xfff6e3, 1.2); dir.position.set(30,50,20); dir.castShadow=true; dir.shadow.mapSize.set(2048,2048); this.scene.add(dir);
    // terrain
    createTerrain(this.scene, THREE);
    // rails
    this.railObj=createRails(this.scene);
    // station
    const stationGeo=new THREE.BoxGeometry(6,3,4); const stationMat=new THREE.MeshStandardMaterial({color:0x8B4513});
    const station=new THREE.Mesh(stationGeo, stationMat); station.position.set(2,1.5,12); station.castShadow=true; this.scene.add(station);
    // The first crafting stations are built by the player; none are pre-placed.
    // capybara mesh
    const capyGroup=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.45,0.9,4,8), new THREE.MeshStandardMaterial({color:0xc49a6c})); body.rotation.z=Math.PI/2; capyGroup.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.42,16,16), new THREE.MeshStandardMaterial({color:0xc49a6c})); head.position.set(0.65,0.35,0); capyGroup.add(head);
    const nose=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,8), new THREE.MeshStandardMaterial({color:0x5a3e1b})); nose.position.set(0.95,0.25,0); capyGroup.add(nose);
    capyGroup.position.set(0,0.9,0); this.scene.add(capyGroup); this.playerMesh=capyGroup;
    // train mesh
    const trainGroup=new THREE.Group();
    const loco=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.6,1.8), new THREE.MeshStandardMaterial({color:0xb34700})); loco.position.y=1; trainGroup.add(loco);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.8,1.2), new THREE.MeshStandardMaterial({color:0xd4a843})); cab.position.set(0.6,1.5,0); trainGroup.add(cab);
    const wheelGeo=new THREE.CylinderGeometry(0.28,0.28,0.2,12);
    const wheelMat=new THREE.MeshStandardMaterial({color:0x333});
    [ -1,0,1].forEach(x=>{ const w=new THREE.Mesh(wheelGeo,wheelMat); w.rotation.z=Math.PI/2; w.position.set(x*0.9,0.3,0.7); trainGroup.add(w); const w2=w.clone(); w2.position.z=-0.7; trainGroup.add(w2); });
    trainGroup.position.set(0,0,10); this.scene.add(trainGroup); this.trainMesh=trainGroup;
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
      return {...d, mesh, hp:2, maxHp:2, depleted:false, id:'res'+i};
    });
    // enemies
    this.spawnEnemies();
    // input
    window.addEventListener('keydown',e=>this.onKey(e,true));
    window.addEventListener('keyup',e=>this.onKey(e,false));
    window.addEventListener('mousedown',e=>{ if(e.button===0) this.onShoot(); if(e.button===2) this.weapon=this.weapon==='sword'?'pistol':'sword'; });
    canvas.addEventListener('mousemove',e=>{ this.mouse.dx=e.movementX||0; this.mouse.dy=e.movementY||0; if(e.buttons===1){ this.yaw-=this.mouse.dx*0.004; this.pitch=Math.max(0.1,Math.min(1.1,this.pitch - this.mouse.dy*0.004)); }});
    canvas.addEventListener('click',()=>canvas.requestPointerLock?.());
    window.addEventListener('resize',()=>this.onResize());
    // inventory listener
    inventory.onChange(()=>{ renderInventory(); this.updateQuestHUD() });
    renderRecipes('hand', this.player.level);
    this.updateQuestHUD();
    // load save?
    const saved=this.saveMgr.load();
    if(saved){ this.applySave(saved); showNotif('Save carregado'); }
    this.saveMgr.has() && (document.getElementById('btn-continuar').disabled=false);
    if(!saved){
      inventory.add('axe_wood', 1);
      inventory.add('pick_wood', 1);
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
      if(e.key==='F8'){ e.preventDefault(); this.weather=this.weather==='sol'?'neblina':'sol'; this.scene.fog.color.set(this.weather==='neblina'?0xb9c5bd:0x87ceeb); showNotif(`F8: clima ${this.weather}`); }
      if(e.key==='F9'){ e.preventDefault(); this.timeOfDay=this.timeOfDay==='dia'?'noite':'dia'; this.scene.background.set(this.timeOfDay==='noite'?0x10182f:0x87ceeb); showNotif(`F9: ${this.timeOfDay}`); }
    });
  }
  spawnEnemies(){
    // clear
    this.enemies.forEach(e=> e.mesh && this.scene.remove(e.mesh)); this.enemies=[];
    const spots=this.forestLoaded?[[22,6],[28,-5],[34,12],[25,-13],[39,8]]:[[6,6],[-8,5],[14,14],[-14,-8],[10,-12]];
    spots.forEach(([x,z],i)=>{
      const mob=spawnMob(this.forestLoaded?(i%2===0?'spore':'wolf'):(i%2===0?'slime':'boar'), x, z);
      if(!mob) return;
      const geo=new THREE.CapsuleGeometry(0.4,0.8,4,8);
      const mat=new THREE.MeshStandardMaterial({color: i%2===0?0x2ecc71:0xe67e22,roughness:.7,emissive:i%2===0?0x092d16:0x321407,emissiveIntensity:.35});
      const mesh=new THREE.Mesh(geo,mat); mesh.position.set(x,0.8,z); this.scene.add(mesh);
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
    }
  }
  onKey(e, down){
    this.keys[e.key.toLowerCase()]=down;
    if(!down) return;
    if(e.key==='Escape'){ this.togglePause() }
    if(e.key.toLowerCase()==='i'){ this.toggle('inventory-panel') }
    if(e.key.toLowerCase()==='m'){ this.toggle('map-panel') }
    if(e.key.toLowerCase()==='j'){ this.toggle('quests-panel') }
    if(e.key.toLowerCase()==='e'){ this.tryInteract() }
    if(e.key.toLowerCase()==='q'){ if(this.train.inTrain) this.accelerate() }
    if(e.key.toLowerCase()==='r' && this.weapon!=='pistol'){ this.tryRepair() }
    if(e.key==='1'){ this.weapon='sword'; showNotif('Espada equipada') }
    if(e.key==='2'){ this.weapon='pistol'; showNotif('Pistola equipada') }
    if(e.key.toLowerCase()==='f' && this.train.inTrain){ this.train.inTrain=false; showNotif('Saiu do trem'); }
    if(e.key.toLowerCase()==='r' && e.ctrlKey){ e.preventDefault(); this.pistol.reload(); showNotif('Recarregando...') }
    if(e.key==='r' && !e.ctrlKey && this.weapon==='pistol'){ /* reload handled via R */ }
    if(e.key.toLowerCase()==='r' && this.weapon==='pistol'){ this.pistol.reload(); showNotif(`Recarregado ${this.pistol.mag}/6`); }
    if(e.key.toLowerCase()==='h' && this.train.inTrain){ showNotif('🚂 BUZINA! Piiiii!') }
    if(e.key.toLowerCase()==='b'){ this.placeStation(); }
  }
  createStation(type, x, z, starter=false){
    const isTable=type==='crafting_table';
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
    this.stations.push({type,x,z,mesh,starter});
  }
  placeStation(){
    if(this.train.inTrain) return;
    const type=inventory.has('crafting_table') ? 'crafting_table' : inventory.has('furnace') ? 'furnace' : null;
    if(!type){ showNotif('Crie uma Mesa de Crafting ou Fornalha primeiro.'); return; }
    inventory.remove(type,1);
    const fwd=new THREE.Vector3(); this.camera.getWorldDirection(fwd);
    this.createStation(type, this.player.pos.x+fwd.x*2, this.player.pos.z+fwd.z*2);
    showNotif(`${type==='crafting_table'?'Mesa de Crafting':'Fornalha'} posicionada.`);
  }
  openCrafting(station){
    document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('active'));
    if(station==='furnace') document.getElementById('furnace-panel').classList.add('active');
    else {
      document.getElementById('crafting-panel').classList.add('active');
      document.getElementById('crafting-title').textContent='MESA DE CRAFTING';
      renderRecipes('crafting_table', this.player.level);
    }
  }
  onShoot(){
    if(this.cutscene.active) return;
    if(this.weapon==='sword'){
      const now=performance.now()/1000; const c=this.sword.attack(now);
      if(!this.player.stamina.use(12)) { showNotif('Sem stamina!'); return; }
      // ray hit enemies within 2.2
      let hit=null; let best=2.4;
      for(const en of [...this.enemies, this.boss].filter(Boolean)){
        if(en.state==='DEAD') continue;
        const d=Math.hypot(en.x - this.player.pos.x, en.z - this.player.pos.z);
        if(d<best){ best=d; hit=en }
      }
      if(hit){
        const dmg=calcDamage(15, hit.defense||2);
        hit.damage(dmg); showNotif(`-${dmg} ${hit.name} (combo ${c})`);
        if(hit.state==='DEAD'){
          this.onKill(hit);
          if(hit.mesh) { hit.mesh.material.color.set(0x333333); }
        }
      } else showNotif('Swing! (combo '+c+')');
    } else {
      if(!this.pistol.shoot()){ if(this.pistol.reserve===0) showNotif('Sem munição!'); else showNotif('Recarregue (R)'); return }
      // pistol raycast
      const dir=new THREE.Vector3(); this.camera.getWorldDirection(dir);
      this.raycaster.set(new THREE.Vector3(this.player.pos.x,1,this.player.pos.z), dir);
      const meshes=[...this.enemies, this.boss].filter(Boolean).map(e=>e.mesh).filter(Boolean);
      const hit=this.raycaster.intersectObjects(meshes);
      if(hit.length){
        const mesh=hit[0].object;
        const en=[...this.enemies, this.boss].find(e=>e.mesh===mesh || e.mesh?.children?.includes(mesh));
        if(en){
          const dmg=calcDamage(25, en.defense||2);
          en.damage(dmg); showNotif(`🔫 -${dmg} ${en.name}`);
          if(en.state==='DEAD') this.onKill(en);
        }
      } else showNotif('🔫 Bang! '+this.pistol.mag+'/6');
    }
  }
  onKill(en){
    const loot=rollLoot(en.loot||'slime_loot');
    loot.forEach(l=>{ try{ inventory.add(l.id,l.amount); showNotif(`+${l.amount} ${l.id}`) }catch{} });
    this.player.addXP(en.xp||12); this.player.coins+=10;
    showNotif(`+${en.xp} XP`);
    // quests kill
    const q=this.quests.active(); if(q){
      const obj=q.objectives.find(o=>o.type==='kill');
      if(obj){ obj._kills=(obj._kills||0)+1; if(obj._kills>=obj.amount) obj.done=true; this.quests.checkComplete(q); if(q.completed){ showNotif(`Missão completa: ${q.name}`); this.quests.update(q.id,()=>{}); this.spawnEnemies(); } }
    }
    // Common enemies recycle after 12 seconds; elite, mini-bosses and bosses do not.
    if(!en.elite && !en.mini && !en.boss) setTimeout(()=>{
      const mob=spawnMob(en.id, (Math.random()-0.5)*30, (Math.random()-0.5)*30);
      if(mob){ const mesh=en.mesh; mesh.position.set(mob.x,0.8,mob.z); mesh.material.color.set(mob.id==='slime'?0x2ecc71:0xe67e22); mob.mesh=mesh; mob.ai=new EnemyAI(mob); mob.hp=mob.maxHp; mob.state='IDLE'; this.enemies.push(mob); }
    },12000);
    // boss check
    if(en.boss){
      this.cutscene.play('Vitória! Guardião derrotado', ()=>{
        const qg=this.quests.quests.find(q=>q.id==='guardian_forest'); if(qg){ qg.objectives.forEach(o=>o.done=true); qg.completed=true; }
        showNotif('🎉 Guardião derrotado! +1500 coins'); this.player.coins+=1500; this.player.addXP(500);
        document.getElementById('boss-bar').style.display='none';
      });
    }
  }
  tryInteract(){
    if(this.train.inTrain){ this.train.inTrain=false; showNotif('Saiu do trem'); return; }
    // near train?
    const dTrain=Math.hypot(this.player.pos.x - this.train.x, this.player.pos.z - this.train.z);
    if(dTrain<2.6){
      // quest inspect
      const q=this.quests.quests.find(x=>x.id==='first_departure');
      if(q && !q.objectives[0].done){ q.objectives[0].done=true; this.quests.checkComplete(q); showNotif('Locomotiva inspecionada'); }
      // fuel check
      if(inventory.count('coal')>=3){
        // auto fuel handled via E on train? we do: if has coal, consume 3 and add fuel
        if(q && !q.objectives[1].done && inventory.count('coal')>=3){
          inventory.remove('coal',3); this.train.fuel=Math.min(100,this.train.fuel+30); q.objectives[1].done=true; this.quests.checkComplete(q); showNotif('Abastecido +30%');
        } else if(inventory.count('coal')>=1){
          inventory.remove('coal',1); this.train.fuel=Math.min(100,this.train.fuel+10); showNotif('⛽ +10%');
        }
      }
      // enter
      if(q && q.objectives[1].done){
        this.train.inTrain=true; q.objectives[2].done=true; this.quests.checkComplete(q); showNotif('Entrou na cabine — Q para acelerar, E para frear, F para sair');
        this.cutscene.play('Cabine: VELO 0 km/h, COMB  '+Math.round(this.train.fuel)+'%, INTEG '+Math.round(this.train.integ)+'%', ()=>{});
      } else {
        this.train.inTrain=true; showNotif('Cabine');
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
    // near resource?
    for(const r of this.resources){
      if(r.depleted) continue;
      const d=Math.hypot(r.x - this.player.pos.x, r.z - this.player.pos.z);
      if(d<2.2){
        const required = r.type==='tree' ? ['axe_wood','axe_stone','axe_iron']
          : r.type==='iron_ore' ? ['pick_stone','pick_iron']
          : ['pick_wood','pick_stone','pick_iron'];
        if(!required.some(id=>inventory.has(id))){
          showNotif(r.type==='tree' ? 'Você precisa de um machado.' : 'Você precisa de uma picareta de nível superior.');
          return;
        }
        r.hp--; if(r.mesh) r.mesh.scale.multiplyScalar(0.9);
        if(r.hp<=0){
          r.depleted=true; if(r.mesh) r.mesh.visible=false;
          let item='wood';
          if(r.type==='rock') item='stone';
          else if(r.type==='coal') item='coal';
          else if(r.type==='iron_ore') item='iron_ore';
          else if(r.type==='scrap') item='scrap';
          else if(r.type==='herbs') item='herbs';
          else if(r.type==='tree') item='wood';
          try{ inventory.add(item, r.type==='tree'?2: r.type==='iron_ore'?2:1); showNotif('+1 '+item); }catch{ showNotif('Inventário cheio'); }
          // respawn 18s
          setTimeout(()=>{ r.hp=r.maxHp; r.depleted=false; if(r.mesh){ r.mesh.visible=true; r.mesh.scale.set(1,1,1);} },18000);
          // check fuel quest
        } else showNotif('Minerando... '+r.hp+'/'+r.maxHp);
        return;
      }
    }
    showNotif('Nada para interagir');
  }
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
      g.position.set(x,0,z); this.scene.add(g);
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
      this.resources.push({...d, mesh, hp:2, maxHp:2, depleted:false, id:'forest'+Math.random()});
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
    this.train.speed=Math.min(12, this.train.speed+4);
    const q=this.quests.quests.find(x=>x.id==='first_departure');
    if(q && !q.objectives[3].done){ q.objectives[3].done=true; this.quests.checkComplete(q); showNotif('Partiu! 🚂'); this.cutscene.play('Primeira partida completa! +150 XP', ()=>{}); this.player.addXP(150); this.player.coins+=50; }
  }
  toggle(name){
    const el=document.getElementById(name); if(!el) return;
    const is=el.classList.contains('active');
    document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('active'));
    if(!is) el.classList.add('active');
    if(name==='inventory-panel') renderInventory();
    if(name==='quests-panel') this.renderQuests();
  }
  togglePause(){
    const el=document.getElementById('pause-menu');
    const is=el.classList.contains('active');
    if(is) el.classList.remove('active'); else { document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('active')); el.classList.add('active'); }
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
  updateQuestHUD(){
    const q=this.quests.active();
    if(q){
      // could update top bar if needed
    }
  }
  applySave(data){
    try{
      if(data.inventory) inventory.fromJSON(data.inventory);
      if(data.player){ this.player.level=data.player.level||1; this.player.xp=data.player.xp||0; this.player.coins=data.player.coins||100; this.player.pos=data.player.pos||this.player.pos; if(data.player.train) this.train=data.player.train; }
      if(data.quests) this.quests.quests=data.quests;
      if(data.world){ this.brokenRepaired=!!data.world.brokenRepaired; this.forestLoaded=!!data.world.forestLoaded; if(this.brokenRepaired && this.railObj?.broken) this.railObj.broken.visible=false; if(this.forestLoaded) this.loadForest(); }
    }catch{}
  }
  onResize(){
    this.camera.aspect=window.innerWidth/window.innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(window.innerWidth,window.innerHeight);
  }
  setQuality(quality){
    this.renderer.setPixelRatio(quality==='Baixa'?1:quality==='Média'?Math.min(1.5, window.devicePixelRatio):Math.min(2, window.devicePixelRatio));
    this.renderer.shadowMap.enabled=quality!=='Baixa';
  }
  attachMultiplayer(multiplayer){
    this.multiplayer=multiplayer;
    multiplayer.onMessage(message=>{
      if(message.type!=='PLAYER_STATE' || message.payload.playerId===multiplayer.playerId) return;
      const state=message.payload;
      let remote=this.remotePlayers.get(state.playerId);
      if(!remote){
        const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(.4,.8,4,8), new THREE.MeshStandardMaterial({color:0x8ecae6}));
        mesh.position.set(state.x,.8,state.z); this.scene.add(mesh); remote={mesh,x:state.x,z:state.z}; this.remotePlayers.set(state.playerId,remote);
      }
      remote.x=state.x; remote.z=state.z; remote.mesh.rotation.y=state.yaw||0;
    });
  }
  update(dt){
    // player movement
    if(!this.train.inTrain){
      const fwd=new THREE.Vector3(); this.camera.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
      const right=new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0,1,0)).negate();
      let mv=new THREE.Vector3();
      if(this.keys['w']) mv.add(fwd);
      if(this.keys['s']) mv.sub(fwd);
      if(this.keys['a']) mv.add(right);
      if(this.keys['d']) mv.sub(right);
      if(mv.length()>0){
        mv.normalize();
        const sprint=this.keys['shift'] && this.player.stamina.use(10*dt);
        const spd=sprint?6:4;
        if(!sprint) this.player.stamina.regen(dt); else this.player.stamina.regen(dt*0.2);
        this.player.pos.x+=mv.x*spd*dt; this.player.pos.z+=mv.z*spd*dt;
      } else this.player.stamina.regen(dt);
      if(this.keys[' ']){ /* jump stub */ }
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
      this.player.pos.x=Math.max(-45,Math.min(45,this.player.pos.x));
      this.player.pos.z=Math.max(-45,Math.min(45,this.player.pos.z));
      if(this.playerMesh){ this.playerMesh.position.set(this.player.pos.x,0.9,this.player.pos.z); this.playerMesh.rotation.y=Math.atan2(mv.x,mv.z); }
      if(this.player.health.dead){
        document.getElementById('death-screen').style.display='block';
      }
    } else {
      // in train: move train along Z? simple
      if(this.keys['e']){ this.train.speed=Math.max(0,this.train.speed-6*dt) }
      if(this.train.speed>0.01){
        const slope=0; const weightFactor=1+ this.train.weight/5000;
        this.train.fuel=Math.max(0,this.train.fuel - Math.abs(this.train.speed)*0.03*dt*weightFactor);
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
        if(this.train.x>45) this.train.x=-45;
        if(this.trainMesh) this.trainMesh.position.set(this.train.x,0,this.train.z);
        // player follows train
        this.player.pos.x=this.train.x; this.player.pos.z=this.train.z; if(this.playerMesh) this.playerMesh.position.set(this.player.pos.x,0.9,this.player.pos.z);
        if(this.train.fuel<=0) this.train.speed=0;
      }
      this.player.stamina.regen(dt);
    }
    // enemies AI
    for(const en of this.enemies){
      if(en.state==='DEAD') continue;
      en.ai.update(dt, this.player.pos);
      if(en.mesh){ en.mesh.position.set(en.x,0.8,en.z) }
      if(en.state==='ATTACK'){
        // damage player every 1s
        en._cd=(en._cd||0)-dt; if(en._cd<=0){ en._cd=1.1; this.player.health.damage(en.damage||8); showNotif(`-${en.damage} de ${en.name}`); }
      }
    }
    if(this.boss && this.boss.state!=='DEAD'){
      this.boss.ai=new EnemyAI(this.boss); this.boss.ai.update(dt,this.player.pos);
      if(this.boss.mesh) this.boss.mesh.position.set(this.boss.x,1.4,this.boss.z);
      this.boss.updatePhase();
      const bar=document.getElementById('boss-bar'); if(bar){ bar.style.display='block'; document.getElementById('boss-name').textContent=this.boss.name + ' FASE '+(this.boss.phase+1); document.getElementById('bar-boss').style.width=(this.boss.hp/this.boss.maxHp*100)+'%'; document.getElementById('boss-hp').textContent=Math.round(this.boss.hp/this.boss.maxHp*100)+'%'; }
      const distance=Math.hypot(this.boss.x-this.player.pos.x, this.boss.z-this.player.pos.z);
      this.boss._attackCd=(this.boss._attackCd||0)-dt;
      if(this.boss._attackCd<=0){
        if(this.boss.phase===0 && distance<4){
          this.player.health.damage(20); this.boss._attackCd=2.5; showNotif('Guardião: Esmagamento!');
        } else if(this.boss.phase>=1 && distance<12){
          const dx=this.player.pos.x-this.boss.x, dz=this.player.pos.z-this.boss.z, l=Math.hypot(dx,dz)||1;
          this.boss.x+=dx/l*3.5; this.boss.z+=dz/l*3.5; this.player.health.damage(28); this.boss._attackCd=3.5; showNotif('Guardião: Investida!');
        } else if(this.boss.phase>=2){
          const mob=spawnMob('spore',this.boss.x-2,this.boss.z+2);
          if(mob){ const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(.35,.6,4,8),new THREE.MeshStandardMaterial({color:0x6ee7b7})); mesh.position.set(mob.x,.6,mob.z); this.scene.add(mesh); mob.mesh=mesh; mob.ai=new EnemyAI(mob); this.enemies.push(mob); }
          this.boss._attackCd=5; showNotif('Guardião: criaturas invocadas!');
        } else this.boss._attackCd=1;
      }
    }
    // camera
    const target=this.train.inTrain? new THREE.Vector3(this.train.x,1,this.train.z) : new THREE.Vector3(this.player.pos.x,0.9,this.player.pos.z);
    const camX=target.x + Math.sin(this.yaw)*this.dist;
    const camZ=target.z + Math.cos(this.yaw)*this.dist;
    const camY=target.y + 4 + Math.sin(this.pitch)*3;
    this.camera.position.lerp(new THREE.Vector3(camX,camY,camZ), 0.12);
    this.camera.lookAt(target);
    // furnace
    this.furnace.tick(dt);
    const fb=document.getElementById('furnace-bar'); if(fb) fb.style.width=(this.furnace.progress*100)+'%';
    // HUD
    updateHUD({hp: this.player.health.current, stamina: this.player.stamina.current, lv:this.player.level, xp:this.player.xp, coins:this.player.coins, fuel:this.train.fuel, integ:this.train.integ, weapon: this.weapon==='sword'?'⚔️ Espada' : `🔫 ${this.pistol.mag}/6`, region: this.player.pos.x>18?'Floresta':'Planície'});
    for(const remote of this.remotePlayers.values()) remote.mesh.position.lerp(new THREE.Vector3(remote.x,.8,remote.z),Math.min(1,dt*12));
    if(this.multiplayer){
      this.networkTimer-=dt;
      if(this.networkTimer<=0){
        this.networkTimer=.05;
        this.multiplayer.sendState({x:this.player.pos.x,z:this.player.pos.z,yaw:this.playerMesh?.rotation.y||0,speed:this.train.inTrain?this.train.speed:0});
      }
    }
    // auto save checkpoint
    this._saveCd=(this._saveCd||0)-dt; if(this._saveCd<=0){ this._saveCd=12; this.doSave(true) }
  }
  doSave(silent){
    const data={player:{level:this.player.level,xp:this.player.xp,coins:this.player.coins,pos:this.player.pos,train:this.train},inventory:inventory.toJSON(),quests:this.quests.quests, world:{brokenRepaired:this.brokenRepaired, forestLoaded:this.forestLoaded}};
    this.saveMgr.save(data); if(!silent) showNotif('Jogo salvo'); document.getElementById('btn-continuar').disabled=false;
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
