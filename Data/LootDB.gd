extends Node
## Loot table database — drops from containers and enemies.

var data: Dictionary = {}

func _ready() -> void:
	data = {
		"plains_chest": {
			"region": "plains",
			"container_type": "chest",
			"items": [
				{"item_id": "wood", "min_qty": 3, "max_qty": 8, "chance": 0.9},
				{"item_id": "stone", "min_qty": 2, "max_qty": 5, "chance": 0.8},
				{"item_id": "iron", "min_qty": 1, "max_qty": 3, "chance": 0.5},
				{"item_id": "scrap", "min_qty": 1, "max_qty": 4, "chance": 0.6},
				{"item_id": "herbs", "min_qty": 2, "max_qty": 5, "chance": 0.4},
				{"item_id": "fuel_basic", "min_qty": 1, "max_qty": 2, "chance": 0.3},
				{"item_id": "food_apple", "min_qty": 1, "max_qty": 3, "chance": 0.5},
			]
		},
		"plains_barrel": {
			"region": "plains",
			"container_type": "barrel",
			"items": [
				{"item_id": "wood", "min_qty": 2, "max_qty": 5, "chance": 0.85},
				{"item_id": "plants", "min_qty": 1, "max_qty": 3, "chance": 0.6},
				{"item_id": "food_bread", "min_qty": 1, "max_qty": 1, "chance": 0.2},
			]
		},
		"forest_chest": {
			"region": "forest",
			"container_type": "chest",
			"items": [
				{"item_id": "wood", "min_qty": 5, "max_qty": 12, "chance": 0.95},
				{"item_id": "herbs", "min_qty": 3, "max_qty": 8, "chance": 0.7},
				{"item_id": "plants", "min_qty": 2, "max_qty": 6, "chance": 0.8},
				{"item_id": "coal", "min_qty": 2, "max_qty": 5, "chance": 0.5},
				{"item_id": "crystals", "min_qty": 1, "max_qty": 2, "chance": 0.15},
				{"item_id": "iron", "min_qty": 1, "max_qty": 3, "chance": 0.35},
			]
		},
		"common_enemy_drop": {
			"region": "any",
			"container_type": "enemy",
			"items": [
				{"item_id": "scrap", "min_qty": 1, "max_qty": 2, "chance": 0.4},
				{"item_id": "iron", "min_qty": 1, "max_qty": 1, "chance": 0.2},
			]
		},
		"forest_enemy_drop": {
			"region": "forest",
			"container_type": "enemy",
			"items": [
				{"item_id": "herbs", "min_qty": 1, "max_qty": 3, "chance": 0.5},
				{"item_id": "plants", "min_qty": 1, "max_qty": 2, "chance": 0.6},
				{"item_id": "scrap", "min_qty": 1, "max_qty": 1, "chance": 0.3},
			]
		},
		"rare_find": {
			"region": "any",
			"container_type": "hidden",
			"items": [
				{"item_id": "crystals", "min_qty": 1, "max_qty": 3, "chance": 0.8},
				{"item_id": "components", "min_qty": 1, "max_qty": 2, "chance": 0.5},
				{"item_id": "motor_part", "min_qty": 1, "max_qty": 1, "chance": 0.2},
			]
		},
	}

func get_loot(table_id: String) -> Array:
	var table: Dictionary = data.get(table_id, {})
	if table.is_empty():
		return []
	var loot: Array = []
	for entry in table.get("items", []):
		if randf() <= entry.get("chance", 0.0):
			var qty := randi_range(entry.get("min_qty", 1), entry.get("max_qty", 1))
			loot.append({"item_id": entry["item_id"], "quantity": qty})
	return loot

func get_random_from_region(region_id: String) -> Array:
	for key in data.keys():
		var table: Dictionary = data[key]
		if table.get("region") == region_id and table.get("container_type") == "chest":
			return get_loot(key)
	return get_loot("plains_chest")
