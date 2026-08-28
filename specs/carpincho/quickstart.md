# Quickstart — CARPINCHO: The Lost Railway

## Prereqs
- Node 18+, npm 9+
- Modern browser (Chrome 120+, Firefox 120+)
- `npm install` (three 0.160, vite 5.2)

## Run Dev
```bash
npm install
npm run dev
# → http://localhost:5173
# Root index.html = Three.js game
# docs/index.html = 2D fallback playable
```

## Build / Preview
```bash
npm run build
npm run preview
```

## Validation Scenarios (MVP)

### 1. Menu → Character
- Open `http://localhost:5173`
- See title CARPINCHO + locomotive bg + buttons: JOGAR, MULTIPLAYER, CONTINUAR (disabled without save), CONFIGURAÇÕES, CRÉDITOS, SAIR
- Click JOGAR → character creation (name, fur color, hat) → Confirm → world loads.

### 2. Movement & Camera
- WASD move, SHIFT sprint, SPACE jump, mouse drag camera orbit, scroll zoom
- Third-person follow, collision, not through walls.
- Verify: `js/player/movement.js`, `js/player/player.js`

### 3. Train
- Approach locomotive at Estação Planície (2,10) → [E] inspect (quest)
- Coal nodes at (11,7) etc → collect 3 coal → [E] on train to fuel → HUD ⛽
- [E] enter cabine → cockpit HUD: VELO/COMBUSTÍVEL/INTEGRIDADE/ENERGIA/DESTINO/DISTÂNCIA
- Q accelerate, E brake, H horn, fuel drains by weight/slope
- Repair broken rail at (14,10) with R (3 scrap+2 iron) → forest unlocks

### 4. Resources & Harvest
- Trees (🌲) → axe → hp bar → fall → +wood
- Rocks → pickaxe → +stone
- Coal → +coal, Iron (orange FERRO nodes) → +iron
- Verify drops data-driven `js/data/items.js`, `js/resources/*.js`

### 5. Crafting
- Collect 8 wood → craft Crafting Table → place → [E] open UI (3x3 grid + output)
- Recipes: iron_pickaxe {3 iron_ingot +2 wood, station crafting_table}
- Furnace: 8 stone → place → Input ore + fuel (coal) → progress bar → output ingot
- Check ingredients removed, output added, station/level gating (`js/crafting/*.js`)

### 6. Inventory
- Grid slots, weight 0/100 KG, rarity colors, stack limits (wood 64, stone 128, sword 1)
- Verify: `js/inventory/inventory.js`

### 7. Combat
- Equip 1=s sword, 2=p pistol, R reload (6/36)
- Sword combo 3 hits + heavy, stamina drain, raycast hit
- Pistol raycast, consumes ammo, no fire when empty
- Mobs: 3 types + elite + mini-boss + Guardião da Floresta (phases 100/70/35)
- Verify damage numbers, death state, loot tables

### 8. Quests / Economy
- PRIMEIRA PARTIDA (inspect→fuel→enter→depart) → 150 XP
- Log J shows objectives; map M shows fog of war reveal
- Shop at station: buy/sell with CapyCoins (§96)
- Check `js/quests/questManager.js`, `js/economy/shop.js`

### 9. Save/Load
- Play → auto checkpoint at station → F5 save? → close → CONTINUAR enabled → load restores character/inventory/train/quests
- IndexedDB primary, localStorage fallback. Test: JOGAR→SALVAR→FECHAR→ABRIR→CARREGAR → verify all (§191)

### 10. Debug (dev only)
- F1 FPS, F2 pos, F3 train state, F4 teleport, F5 add resources, F6 add coins, F7 complete quest, F8 weather, F9 time
- `js/world/dayNight.js`, `js/world/weather.js`

## Contracts
- Data contracts: `specs/carpincho/data-model.md`
- Crafting contract: `specs/carpincho/contracts/crafting.md` (recipe schema)
- Multiplayer contract: `specs/carpincho/contracts/multiplayer.md` (WS messages)

## Expected Outcomes
- All scenarios pass without console errors
- `vite build` exit 0, `lsp_diagnostics` clean
- No Godot/GDScript referenced; pure Three.js
