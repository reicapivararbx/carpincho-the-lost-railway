# Tasks — CARPINCHO: The Lost Railway

**Feature:** capyrails MVP 0.1.0 → 1.0.0
**Branch:** main
**Plan:** `.omo/plans/carpincho-master-plan.md`
**Stack:** HTML5 + CSS3 + JS ES6+ + Three.js 0.160 + Vite 5.4

---

## Phase 1: Setup (Project Initialization)

- [X] T001 Create Vite entry `index.html` with menu/HUD overlays and module script to `/js/main.js`
- [X] T002 Configure `vite.config.js` with port 5173 and build outDir `dist`
- [X] T003 Create base CSS `css/style.css` with variables --gold, --bg, --panel
- [X] T004 Create `css/menu.css` for cinematic menu background
- [X] T005 Create `css/hud.css` for top bars, crosshair, notifs, overlays
- [X] T006 Create `css/game.css` for game screen layout
- [X] T007 Update `package.json` with three 0.160 and vite 5.4 and type module

## Phase 2: Foundational (Blocking prerequisites)

- [X] T008 [P] Create data-driven Item DB in `js/data/items.js` with all MVP items (wood/stone/coal/iron etc + stackSize/weight/rarity)
- [X] T009 [P] Create `js/data/recipes.js` with RecipeDB (iron_ingot, crafting_table, tools, weapons)
- [X] T010 [P] Create `js/data/enemies.js` with ENEMIES and BOSSES (forest_guardian phases)
- [X] T011 [P] Create `js/data/quests.js` with QUESTS chain first_departure → guardian_forest
- [X] T012 [P] Create `js/data/regions.js` and `js/data/lootTables.js` and `js/data/weapons.js` and `js/data/wagons.js`
- [X] T013 Create Inventory singleton in `js/inventory/inventory.js` with weight/canAdd/add/remove/has and onChange
- [X] T014 [P] Create `js/inventory/item.js` Item class
- [X] T015 [P] Create `js/inventory/equipment.js` and `js/inventory/storage.js`
- [X] T016 Create `js/save/saveManager.js` with IndexedDB+localStorage, has/save/load and version 0.1.0
- [X] T017 [P] Create `js/save/migration.js` and `js/save/validation.js`
- [X] T018 Create `js/ui/hud.js` updateHUD and `js/ui/ui.js` showNotif and `js/ui/notifications.js`

## Phase 3: US1 [P1] Jogador, Movimento e Câmera (Independently testable: WASD+mouse orbit, third-person follow)

- [X] T019 [US1] Create `js/player/health.js` Health class with damage/heal/dead
- [X] T020 [P] [US1] Create `js/player/stamina.js` Stamina use/regen
- [X] T021 [P] [US1] Create `js/player/movement.js` createMovement speed/sprint
- [X] T022 [P] [US1] Create `js/player/player.js` Player with health/stamina/level/xp/coins/pos
- [X] T023 [US1] Create `js/player/interaction.js` Raycaster stub
- [X] T024 [US1] Create `js/player/equipment.js` PlayerEquipment
- [X] T025 [US1] Implement player movement + stamina in `js/game.js` update() (WASD, SHIFT, clamp, regen)
- [X] T026 [US1] Implement third-person camera orbit (yaw/pitch/dist, lerp, lookAt) in `js/game.js`

## Phase 4: US2 [P1] Mundo, Estação e Trem/Trilhos (Test: entrar no trem, abastecer, acelerar, reparar trilho)

- [X] T027 [P] [US2] Create `js/world/terrain.js` createTerrain PlaneGeometry
- [X] T028 [P] [US2] Create `js/world/world.js` World class
- [X] T029 [P] [US2] Create `js/world/region.js` Region class
- [X] T030 [P] [US2] Create `js/world/worldStreaming.js` WorldStreaming 3x3 chunks
- [X] T031 [P] [US2] Create `js/world/dayNight.js` DayNight time/phase
- [X] T032 [P] [US2] Create `js/world/weather.js` Weather
- [X] T033 [P] [US2] Create `js/train/train.js` Train physics stub
- [X] T034 [P] [US2] Create `js/train/locomotive.js` Locomotive
- [X] T035 [P] [US2] Create `js/train/wagon.js` Wagon
- [X] T036 [P] [US2] Create `js/train/trainPhysics.js` accel()
- [X] T037 [US2] Create `js/train/rails.js` createRails CatmullRomCurve3 + broken mesh in `js/train/rails.js`
- [X] T038 [US2] Create `js/train/trainDamage.js` TrainDamage
- [X] T039 [P] [US2] Create `js/stations/station.js` Station
- [X] T040 [P] [US2] Create `js/stations/stationManager.js` StationManager
- [X] T041 [P] [US2] Create `js/stations/stationServices.js` shopBuy
- [X] T042 [US2] Build Three.js scene in `js/game.js` init() (lights, terrain, rails, station mesh, capybara mesh, train mesh, resource meshes)

## Phase 5: US3 [P1] Recursos, Coleta e Inventário UI (Test: coletar árvore/pedra/carvão/ferro, ver +1 no inventário, peso)

- [X] T043 [P] [US3] Create `js/resources/resourceNode.js` ResourceNode hp/tier/drops
- [X] T044 [P] [US3] Create `js/resources/harvesting.js` harvest tier check
- [X] T045 [P] [US3] Create `js/resources/mining.js` mine
- [X] T046 [P] [US3] Create `js/resources/respawn.js` scheduleRespawn
- [X] T047 [US3] Create `js/ui/inventoryUI.js` renderInventory grid in `js/ui/inventoryUI.js`
- [X] T048 [US3] Wire resource interaction E in `js/game.js` tryInteract() (hp--, depleted, inventory.add, respawn 18s)
- [X] T049 [US3] Wire broken rail repair R in `js/game.js` tryRepair() (3 scrap +2 iron_ingot)

## Phase 6: US4 [P1] Crafting — Mesa e Fornalha (Test: 8 wood→mesa, 8 stone→fornalha, iron_ore+coal→lingote, sword)

- [X] T050 [P] [US4] Create `js/crafting/crafting.js` canCraft/craft with station/level/ingredients check in `js/crafting/crafting.js`
- [X] T051 [P] [US4] Create `js/crafting/furnace.js` Furnace setInput/setFuel/tick/progress
- [X] T052 [P] [US4] Create `js/crafting/craftingStation.js` CraftingStation
- [X] T053 [P] [US4] Create `js/crafting/engineeringTable.js` EngineeringTable
- [X] T054 [P] [US4] Create `js/crafting/recipes.js` re-export RECIPES
- [X] T055 [US4] Create `js/ui/craftingUI.js` renderRecipes in `js/ui/craftingUI.js`
- [X] T056 [US4] Wire crafting UI CRAFTAR button in `js/main.js` (craft sel, notif, renderInventory)
- [X] T057 [US4] Wire furnace FUNDIR in `js/main.js` (iron_ore+coal → furnace) and tick in `js/game.js` update()

## Phase 7: US5 [P1] Combate — Vida, Espada, Pistola (Test: 1 sword combo, 2 pistol raycast, R reload, dano, morte)

- [X] T058 [P] [US5] Create `js/combat/combat.js` Combat
- [X] T059 [P] [US5] Create `js/combat/damage.js` calcDamage in `js/combat/damage.js`
- [X] T060 [P] [US5] Create `js/combat/sword.js` Sword combo timeout 0.8s
- [X] T061 [P] [US5] Create `js/combat/pistol.js` Pistol mag 6/reserve 36
- [X] T062 [P] [US5] Create `js/combat/ammunition.js` hasAmmo
- [X] T063 [P] [US5] Create `js/combat/targeting.js` raycastHit
- [X] T064 [US5] Implement sword/pistol logic in `js/game.js` onShoot() (stamina, Raycaster, hit detection, calcDamage, refresh)

## Phase 8: US6 [P2] Inimigos, Elite, MiniBoss e Guardião da Floresta (Test: mobs patrulham, perseguem, boss 2 fases + arena)

- [X] T065 [P] [US6] Create `js/enemies/enemy.js` Enemy hp/state/damage
- [X] T066 [P] [US6] Create `js/enemies/enemyAI.js` EnemyAI FSM IDLE→PATROL→CHASE→ATTACK
- [X] T067 [P] [US6] Create `js/enemies/mobSpawner.js` spawnMob in `js/enemies/mobSpawner.js`
- [X] T068 [P] [US6] Create `js/enemies/elite.js` Elite 1.5x
- [X] T069 [P] [US6] Create `js/enemies/miniBoss.js` MiniBoss
- [X] T070 [US6] Create `js/enemies/boss.js` Boss phases per hp% in `js/enemies/boss.js`
- [X] T071 [US6] Spawn 5 mobs + boss arena RingGeometry in `js/game.js` spawnEnemies()
- [X] T072 [US6] Wire enemy AI tick, attack cooldown, player damage, loot roll in `js/game.js` update()

## Phase 9: US7 [P2] Missões, Cutscenes, Diálogo e HUD Quests (Test: PRIMEIRA PARTIDA 4 objetivos, XP, próxima quest ativa)

- [X] T073 [P] [US7] Create `js/quests/quest.js` Quest
- [X] T074 [P] [US7] Create `js/quests/objectives.js` updateObjective
- [X] T075 [P] [US7] Create `js/quests/rewards.js` grantRewards
- [X] T076 [US7] Create `js/quests/questManager.js` QuestManager active/progress/checkComplete in `js/quests/questManager.js`
- [X] T077 [P] [US7] Create `js/cinematic/cutsceneManager.js` CutsceneManager play/skip
- [X] T078 [P] [US7] Create `js/cinematic/cameraController.js` CameraController
- [X] T079 [P] [US7] Create `js/cinematic/dialogue.js` Dialogue
- [X] T080 [P] [US7] Create `js/cinematic/triggers.js` onTrigger
- [X] T081 [US7] Wire quest objectives (inspect/fuel/enter/depart/kill) in `js/game.js` tryInteract/onKill/accelerate and render in `js/game.js` renderQuests()

## Phase 10: US8 [P2] Economia, Lojas e Reputação (Test: comprar/vender, preço variação cidade/deserto, reputação)

- [X] T082 [P] [US8] Create `js/economy/economy.js` Economy
- [X] T083 [P] [US8] Create `js/economy/shop.js` Shop price(region) in `js/economy/shop.js`
- [X] T084 [P] [US8] Create `js/economy/trading.js` trade
- [X] T085 [P] [US8] Create `js/economy/reputation.js` Reputation 5 níveis

## Phase 11: US9 [P3] Save/Load, Checkpoint e Performance (Test: SALVAR→FECHAR→ABRIR→CARREGAR preserva tudo, FPS estável)

- [X] T086 [US9] Implement doSave/applySave/autosave 12s in `js/game.js` and menu handlers in `js/main.js` (CONTINUAR enabled when has save)
- [X] T087 [P] [US9] Enhance `js/save/saveManager.js` with backup + validation before write
- [X] T088 [P] [US9] Add InstancedMesh pooling for trees/rocks in `js/world/terrain.js` (future) and Object pooling comment
- [X] T089 [P] [US9] Create `js/audio/audioManager.js` AudioManager with volumes

## Phase 12: US10 [P3] Multiplayer Cooperativo Autoritativo (Test: criar sala com código, join, chat)

- [X] T090 [P] [US10] Create `js/multiplayer/multiplayer.js` Multiplayer
- [X] T091 [P] [US10] Create `js/multiplayer/networking.js` Networking send
- [X] T092 [P] [US10] Create `js/multiplayer/rooms.js` Rooms create/join code
- [X] T093 [P] [US10] Create `js/multiplayer/synchronization.js` Sync 20Hz
- [X] T094 [US10] Create `server/server.js` Node WS authoritative server validating HP/damage/inventory per spec §131

## Phase 13: US11 [P3] Regiões Avançadas e Estação Zero (Test: Floresta desbloqueada após trilho, Zero bloqueada até guardião)

- [X] T095 [US11] Expand `js/data/regions.js` with 8 regions (Planície/Floresta/Montanha/Cidade/Deserto/Neve/Vulcão/Estação Zero)
- [X] T096 [US11] Gate Estação Zero in `js/game.js` brokenRepaired + boss defeated check

## Phase 14: Polish & Cross-Cutting

- [X] T097 [P] Create `css/inventory.css` (extract from hud.css) and `css/crafting.css` and `css/map.css` and `css/dialogue.css` and `css/quests.css` per spec §7
- [X] T098 Implement map fogOfWar canvas in `js/ui/menus.js` and `js/main.js`
- [X] T099 Add debug F1-F9 gated by import.meta.env.DEV in `js/game.js` init()
- [X] T100 Verify `npm run build` passes and `docs/index.html` 2D fallback untouched
- [X] T101 Manual QA per `specs/carpincho/quickstart.md` scenarios 1-10

---

## Dependencies

```
Setup (T001-T007) → Foundational (T008-T018) → US1 (T019-T026) → US2 (T027-T042) → US3 (T043-T049) → US4 (T050-T057) → US5 (T058-T064) → US6 (T065-T072) → US7 (T073-T081) → US8 (T082-T085) → US9 (T086-T089) → US10 (T090-T094) → US11 (T095-T096) → Polish (T097-T101)
```
US1-US5 are P1 MVP and can be tested independently after Foundational; US6 depends on US5 combat; US7 needs US6 mobs for kill quests; Polish runs after all.

## Parallel Execution Examples

**Setup parallel:**
```
T003 [P] css/style.css
T004 [P] css/menu.css
T005 [P] css/hud.css
```

**Foundational parallel:**
```
T008 [P] js/data/items.js
T009 [P] js/data/recipes.js
T010 [P] js/data/enemies.js
```

**US1 parallel:**
```
T020 [P] js/player/stamina.js
T021 [P] js/player/movement.js
```

**US6 parallel:**
```
T065 [P] js/enemies/enemy.js
T066 [P] js/enemies/enemyAI.js
```

## Implementation Strategy

**MVP first:** Deliver T001-T064 (Setup through US5) → playable loop: menu → move → collect → craft → fight → eat death screen. This matches spec §177 minimal MVP (menu, 3rd person, estação, trem, trilhos, fuel, inventário, mesa/fornalha, machado/picareta/espada/pistola, 3 mobs/1 elite/bi + 1 boss, 3 quests, save).

**Incremental:** Each US adds one vertical slice and remains independently testable via `npm run dev` + quickstart.md checklist.

**File path rule:** Every task includes exact path; adding new item/mob/receita = only edit `js/data/*.js` per spec §197.

## Format Validation

All tasks follow `- [X] T### [P]? [US#]? Description with file path` — checkbox, ID, optional [P], optional [US#], description + path.
Total: 101 tasks.
