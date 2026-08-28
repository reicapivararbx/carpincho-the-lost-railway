extends Node
## Crafting recipe database.

var data: Dictionary = {}

func _ready() -> void:
	data = {
		"basic_axe": {
			"id": "basic_axe", "name": "Basic Axe",
			"output_id": "axe_basic", "output_qty": 1,
			"ingredients": [
				{"id": "wood", "qty": 2},
				{"id": "iron", "qty": 3}
			],
			"required_station": "workbench", "required_level": 1
		},
		"basic_pickaxe": {
			"id": "basic_pickaxe", "name": "Basic Pickaxe",
			"output_id": "pickaxe_basic", "output_qty": 1,
			"ingredients": [
				{"id": "wood", "qty": 2},
				{"id": "iron", "qty": 3}
			],
			"required_station": "workbench", "required_level": 1
		},
		"basic_shovel": {
			"id": "basic_shovel", "name": "Basic Shovel",
			"output_id": "shovel_basic", "output_qty": 1,
			"ingredients": [
				{"id": "wood", "qty": 2},
				{"id": "iron", "qty": 2}
			],
			"required_station": "workbench", "required_level": 1
		},
		"box": {
			"id": "box", "name": "Storage Box",
			"output_id": "box", "output_qty": 1,
			"ingredients": [
				{"id": "wood", "qty": 8}
			],
			"required_station": "", "required_level": 1
		},
		"simple_part": {
			"id": "simple_part", "name": "Simple Part",
			"output_id": "simple_part", "output_qty": 1,
			"ingredients": [
				{"id": "iron", "qty": 3},
				{"id": "scrap", "qty": 2}
			],
			"required_station": "workbench", "required_level": 2
		},
		"motor_part": {
			"id": "motor_part", "name": "Motor Part",
			"output_id": "motor_part", "output_qty": 1,
			"ingredients": [
				{"id": "iron", "qty": 10},
				{"id": "scrap", "qty": 5},
				{"id": "components", "qty": 2}
			],
			"required_station": "workshop", "required_level": 5
		},
		"repair_kit": {
			"id": "repair_kit", "name": "Repair Kit",
			"output_id": "repair_kit", "output_qty": 1,
			"ingredients": [
				{"id": "iron", "qty": 3},
				{"id": "scrap", "qty": 2}
			],
			"required_station": "", "required_level": 1
		},
		"food_bread": {
			"id": "food_bread", "name": "Bread",
			"output_id": "food_bread", "output_qty": 1,
			"ingredients": [
				{"id": "herbs", "qty": 3}
			],
			"required_station": "", "required_level": 1
		},
		"fuel_canister": {
			"id": "fuel_canister", "name": "Fuel Canister",
			"output_id": "fuel_canister", "output_qty": 1,
			"ingredients": [
				{"id": "coal", "qty": 3},
				{"id": "scrap", "qty": 1}
			],
			"required_station": "workshop", "required_level": 3
		},
	}

func lookup(id: String) -> Dictionary:
	return data.get(id, {})

func get_all() -> Dictionary:
	return data

func get_for_station(station_type: String) -> Array:
	var results: Array = []
	for recipe in data.values():
		if recipe.get("required_station", "") == "" or recipe.get("required_station") == station_type:
			results.append(recipe)
	return results

func can_craft(recipe_id: String, player_level: int, inventory: Array) -> Dictionary:
	var recipe := lookup(recipe_id)
	if recipe.is_empty():
		return {"can_craft": false, "reason": "Recipe not found"}
	if recipe.get("required_level", 1) > player_level:
		return {"can_craft": false, "reason": "Level too low"}
	for ing in recipe.get("ingredients", []):
		var have := 0
		for item in inventory:
			if item.get("id") == ing["id"]:
				have = item.get("quantity", 0)
				break
		if have < ing["qty"]:
			return {"can_craft": false, "reason": "Missing materials"}
	return {"can_craft": true, "reason": ""}
