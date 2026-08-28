# Data Model — CARPINCHO: The Lost Railway

## Entities (§139)

### Item
```
id: string (slug, ex: "wood", "iron_ingot")
name: string
description: string
category: "resource"|"tool"|"weapon"|"material"|"consumable"|"quest"|"wagon_part"
rarity: "common"|"uncommon"|"rare"|"epic"|"legendary"
weight: number (kg)
value: number (CapyCoins)
icon: string (emoji or asset path)
stackSize: number
tier?: number (tool tier 0-4)
durability?: number (max)
efficiency?: number
```
Validation: stackSize >=1, weight >=0, rarity enum, category enum.

### Recipe
```
id: string
name: string
category: "tools"|"weapons"|"train"|"stations"|"materials"
ingredients: {item:string, amount:number}[]
stationRequired: "crafting_table"|"furnace"|"workshop"|"engineering_table"|"lab"|"hand"
levelRequired: number (0..60)
output: string (item id)
outputQuantity: number
unlockRequirement?: {type:"level"|"quest"|"item"|"discovery", id:string}
rarity?: rarity
```
Relations: ingredients[*].item → Item.id; output → Item.id; stationRequired → Station.id

### Mob
```
id: string
name: string
hp: number
damage: number
defense: number
speed: number
aggroRange: number
xp: number
lootTable: string (lootTables.js id)
region: string (regions.js id)
level: number
ai: "aggressive"|"defensive"|"ranged"|"tracker"|"heavy"|"fast"
states: subset of [IDLE,PATROL,INVESTIGATE,CHASE,ATTACK,HURT,STUN,FLEE,DEAD]
```
Phases: none for mobs, for bosses see Boss.

### Boss extends Mob
```
phases: {hpThreshold:number, attacks:string[], intro:string}[]
attacks: {id,name,damage,range,cooldown,effect}[]
arena: string (world region + bounds)
loot: string
quest: string (quest id)
cutscene: {entry:string, victory:string}
music: string
```

### Quest
```
id: string
name: string
type: "MAIN"|"SIDE"|"BOUNTY"|"EXPLORATION"|"DELIVERY"|"ESCORT"|"DEFENSE"|"HUNT"|"RECOVERY"|"DISCOVERY"|"BOSS"|"MYSTERY"
region: string
requirements: {level?:number, quest?:string, item?:string, reputation?:string}[]
objectives: {id, description, type:"collect"|"kill"|"interact"|"travel"|"craft", target:string, amount:number, done:boolean}[]
rewards: {xp?:number, coins?:number, items?:{id,amount}[], recipes?:string[], reputation?:{region,amount}}  
cutscenes?: string[]
nextQuest?: string
```
State: `locked → available → active → completed → claimed`. Chain via nextQuest.

### Region
```
id: string
name: string
climate: "sun"|"rain"|"storm"|"fog"|"snow"|"sandstorm"
resources: string[] (item ids)
enemies: string[] (mob ids)
stations: string[] (station ids)
quests: string[] (quest ids)
boss?: string (boss id)
music: string
levelRange: [min,max]
fogOfWar: boolean (true initially hidden)
```

### Train — Locomotive + Wagons
```
locomotive: {id, maxSpeed, acceleration, power, traction, consumption, fuelCapacity, integrity, efficiency, engineState, brakeState}
wagon: {id, type:"cargo"|"workshop"|"dormitory"|"greenhouse"|"defensive"|"generator"|"residential"|"collection", integrity, weight, capacity, energy, slots, upgrades:[], state}
train: {locomotive, wagons:[], totalWeight: computed, totalCapacity: computed}
```
Computed: `accel = power / totalWeight`, `consumption = base * (1 + weight/100 + slopeFactor)`

### Player
```
id: string (save slot)
name: string
appearance: {furColor, eyes, mouth, clothes, hat, backpack, accessories}
level: number, xp: number
health: {current,max}
stamina: {current,max, regenRate}
inventory: {slots:Grid, weight, maxWeight, items:Map<itemId,count>}
equipment: {sword?:itemId, pistol?:itemId, tools: itemId[]}
reputation: Map<regionId, level 0-4>
discoveries: Set<regionId|stationId|recipeId>
position: {x,y,z, regionId}
trainState: reference to Train
```

### ResourceNode
```
id: string
type: "tree"|"rock"|"ore"|"scrap"|"coal"|"crystal"
hp: number, maxHp
toolTierRequired: number
drops: {item, amount, chance}[]
respawnTime: number (ms, 0 = no respawn)
position: Vector3
```
Harvest: Raycaster → damage → hp<=0 → spawn drops → respawn timer.

### Station
```
id: string
name: string
region: string
services: ("shop"|"garage"|"missions"|"warehouse"|"upgrade"|"travel"|"rest")[]
npcs: string[] (npc ids)
pos: Vector3
fogRevealed: boolean
```

### Economy / Shop
```
listing: {item, price, stock}
priceModifier: per region (city iron 20, desert 28)
reputationDiscount: 0.05 per level
```

### Save Schema (versioned)
```
version: "0.1.0" (semver)
playerData: Player (above)
worldData: {seed, regions:RegionState[], stations:StationState[], resources:ResourceNodeState[], train:Train}
meta: {playTime, lastSave, checksum}
```
Migration: `migration.js` applies incremental patches `0.1.0→0.2.0` without wipe.

## State Transitions
- Quest: locked→available (req met) →active (accept) →completed (objectives done) →claimed (rewards)
- ResourceNode: alive →depleted (hp 0, spawn drops) →respawning (timer) →alive
- Enemy: IDLE→PATROL (timer) →INVESTIGATE (hearing/fov) →CHASE (sighted) →ATTACK (range) →HURT→DEAD (hp0) →despawn (distance)
- Train: stopped →accelerating (Q) →cruising →braking (E) →stopped; fuel 0 →stalled

## Validation Rules (§136)
- Inventory weight never exceeds derived max (cargo wagon sum); throw if add would exceed.
- Crafting: all ingredients present, station match, level >= required else throw "need higher tier".
- Combat: damage = max(0, atk - defense), HP clamp 0..max, no negative.
- Save: JSON schema validate before write, backup on fail, checksum.
