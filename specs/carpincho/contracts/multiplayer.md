# Contract — Multiplayer WS

Endpoint: `ws://host:3000` (server/server.js)
Messages JSON: `{type:string, payload:object, seq:number}`

Types:
- `JOIN {name, roomCode}` → `WELCOME {playerId, room}`
- `CREATE_ROOM {name, maxPlayers, private}` → `ROOM_CREATED {code}`
- `PLAYER_STATE {pos, rot, anim, speed}` (20Hz, server rebroadcasts)
- `CRAFT_REQUEST` / `CRAFT_RESULT`
- `DAMAGE_REQUEST {targetId, weaponId}` → server computes `damage = atk-def` → `DAMAGE_RESULT {targetHp}`
- `LOOT_PICKUP {lootId}` → server validates distance/loot ownership
- `QUEST_UPDATE` → server only
- `CHAT {channel:"group"|"proximity"|"global", text}`

Server authority list (§131): HP, damage, inventory, ammo, coins, XP, loot, quests, crafting, transactions, construction, upgrades — all validated, client never trusted.
Anti-cheat: rate-limit, impossible speed (>15m/s with sprint max 6), ammo check (reserve+mag invariant), duplicate craft seq dedup.
