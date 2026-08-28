# Contract — Crafting

Request: `craft(recipeId, stationId)` — client or server
Steps (authoritative):
1. lookup RecipeDB[id] exists else 404
2. verify player level >= levelRequired else 403 "need level X"
3. verify stationType == stationRequired else 400 "wrong station"
4. verify inventory has all ingredients (item, amount) else 409 "insufficient"
5. remove ingredients atomically
6. add output * outputQuantity respecting stack limits
7. unlock recipe if discovery, grant XP if any
8. persist save, return `{ok:true, output, inventory}`

Furnace: `smelt(inputId, fuelId)` → timer `(maxHp/ efficiency)` seconds → tick progress bar → output.

Multiplayer: client sends `CRAFT_REQUEST {recipeId, stationId}` → server validates → broadcasts `CRAFT_RESULT` + `INVENTORY_UPDATE`.
