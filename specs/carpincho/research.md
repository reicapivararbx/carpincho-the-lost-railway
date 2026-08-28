# Research — CARPINCHO: The Lost Railway

**Date:** 2026-08-28
**Stack:** HTML5 + CSS3 + JS ES6+ + Three.js 0.160 + Vite 5.2
**Prohibited:** Godot, GDScript, .gd, Unity, C#, Unreal

## 1. Engine & Rendering

**Decision:** Three.js 0.160 via `three` npm, WebGLRenderer (WebGPU when mature via WebGPURenderer experimental — not default).
**Rationale:** Latest stable, GLTFLoader, AnimationMixer, Raycaster, InstancedMesh, LOD built-in. WebGPU still limited browser coverage.
**Alternatives:** Babylon.js (heavier, less ecosystem), PlayCanvas (proprietary). Rejected — spec mandates Three.js.
**Key APIs:** `GLTFLoader` (models .glb/.gltf), `AnimationMixer` (player/mobs/boss), `Raycaster` (harvesting/combat), `InstancedMesh` (trees/rocks), `LOD`, frustum culling (default), `Object pooling` manual.

## 2. Build Tool

**Decision:** Vite 5.2.0 (already installed).
**Config:** `vite.config.js` with `server.port 5173`, `build.outDir dist`. ES modules, HMR.
**Alternatives:** Webpack, Parcel — Vite fastest, spec suggests it.

## 3. Module Architecture

**Decision:** Flat ES modules under `js/` mirroring spec: `player/`, `combat/`, `enemies/`, `train/`, `world/`, `stations/`, `inventory/`, `crafting/`, `quests/`, `economy/`, `resources/`, `save/`, `multiplayer/`, `ui/`, `audio/`, `data/`.
**Entry:** `index.html` → `js/main.js` → `js/game.js` (game loop).
**CSS:** split per spec `css/*.css` imported via `index.html`.
**Rationale:** Matches spec §7 exactly, ensures scalability and parallel dev.

## 4. Save System

**Decision:** IndexedDB (via `idb`-like thin wrapper without dep) + localStorage fallback + `js/save/saveManager.js`.
- PLAYER_DATA vs WORLD_DATA split (§137)
- Validation via `validation.js`, migration via `migration.js` with versioned schema.
- Autosave on checkpoint, manual save via Dormitório.
**Alternatives:** Only localStorage (5MB limit, insufficient). IndexedDB supports complex objects, already spec-preferred.

## 5. Data-Driven Layer

**Decision:** `js/data/*.js` exports plain objects/arrays: `items.js`, `weapons.js`, `enemies.js`, `bosses.js`, `quests.js`, `regions.js`, `wagons.js`, `recipes.js`, `lootTables.js`.
- Each entry: id, name, category, rarity, etc. per §139.
- `RecipeDB.lookup(id)` pattern reused from existing Godot DB but ported to JS Map.
**Alternatives:** JSON files + fetch — JS modules faster (no async load), tree-shakeable.

## 6. Multiplayer

**Decision:** Node.js + WebSocket (`ws` lib) authoritative server in `server/server.js`. Client `js/multiplayer/networking.js` + `rooms.js` + `synchronization.js`.
- Server validates HP, damage, inventory, crafting (§131). Client = dumb terminal.
- Lobby: create/join code, max players config.
- Sync at 20Hz for player transforms, event-driven for inventory/loot.
**Alternatives:** WebRTC (complex NAT), Firebase (vendor lock). WS simplest for MVP.
**NEEDS for full:** anti-cheat (§132), lag compensation — deferred to 0.6.0.

## 7. Physics — Train

**Decision:** Custom rail-following physics (no cannon-esm/ammo needed for MVP). Spline-based `CatmullRomCurve3` for rails, train lerps along `t` param.
- Weight affects accel/brake/consumption (§19, §173)
- `trainPhysics.js` computes: `accel = power / totalWeight`, `brakeDist = speed^2 / (traction*weightFactor)`
**Alternatives:** Full rigidbody (overkill, rails constrain motion anyway).

## 8. World Streaming & Performance

**Decision:**
- `worldStreaming.js`: chunk 64x64m, load 3x3 around player/train, unload distant.
- `InstancedMesh` for vegetation/rocks (1000+ instances = 1 draw call).
- `LOD`: high/med/low meshes per rail distance.
- `Object pool` for projectiles/particles/mobs.
- Texture atlas, compressed via `basis` when available.
**Validation:** Chrome DevTools perf, `F1 FPS` debug.

## 9. Combat & AI

**Decision:**
- Sword: combo timeout 0.8s, hitbox via Raycaster + sphere overlap.
- Pistol: Raycaster from camera, `6/36` HUD, reload `R` with 1.2s anim lock.
- Enemy AI FSM: IDLE→PATROL→INVESTIGATE→CHASE→ATTACK→HURT→DEAD (§55), fov 120°, detect 18m, hearing 8m.
- Boss: data-driven phases `hp% thresholds`, arena triggers, cutscene entry/victory.

## 10. Crafting Stations

**Decision:** Physical placeables + UI modal. Recipe check: ingredients, stationRequired, levelRequired, unlockRequirement.
- `craftingStation.js` base class, `furnace.js` with fuel timer (progress bar), `engineeringTable.js`, `workshop` etc.
- Flow: EXPLORE→COLLECT→PROCESS→CRAFT→UPGRADE chain (§175).

## 11. Existing Project Handling

**Decision:** Godot files (`*.gd`, `*.tscn`, `project.godot`) are LEGACY — must not be built or referenced by web code. Keep archived under `legacy_godot/` after MVP or git-keep with .gitignore note. Web code lives entirely under `index.html + js/ + css/ + assets/`. `docs/index.html` preserved as playable 2D fallback and reference for game feel — not deleted.

## 12. Asset Pipeline

**Decision:** `.glb` preferred (binary, smaller). Placeholder primitives (Box, Cylinder, Sphere) for MVP, replace with real models later under `assets/models/`. Textures under `assets/textures/`, audio `assets/audio/`.

## 13. Audio

**Decision:** `js/audio/audioManager.js` with `AudioListener` + `PositionalAudio`. Mixer volumes per §9 (master/music/sfx/ambient/ui/voice). Region music crossfade.

## 14. Verification

**Decision:** `vite build` must pass, `lsp_diagnostics` clean, manual playthrough: create character → movement → collect → craft table → furnace → iron tools → combat → train travel → boss → save/load.
