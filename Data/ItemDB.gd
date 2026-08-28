extends Node
## Item database — all items defined in the game.

var data: Dictionary = {}

func _ready() -> void:
	data = {
		# === RESOURCES ===
		"wood": {
			"id": "wood", "name": "Wood", "description": "Basic building material from trees.",
			"category": "resource", "rarity": "common", "weight": 1.0, "value": 5,
			"icon_path": "res://Data/Icons/wood.svg", "max_stack": 50
		},
		"stone": {
			"id": "stone", "name": "Stone", "description": "Sturdy rock material.",
			"category": "resource", "rarity": "common", "weight": 2.0, "value": 5,
			"icon_path": "res://Data/Icons/stone.svg", "max_stack": 50
		},
		"iron": {
			"id": "iron", "name": "Iron", "description": "Useful metal for crafting.",
			"category": "resource", "rarity": "common", "weight": 2.0, "value": 10,
			"icon_path": "res://Data/Icons/iron.svg", "max_stack": 50
		},
		"coal": {
			"id": "coal", "name": "Coal", "description": "Fuel for furnaces and engines.",
			"category": "resource", "rarity": "common", "weight": 1.5, "value": 8,
			"icon_path": "res://Data/Icons/coal.svg", "max_stack": 50
		},
		"scrap": {
			"id": "scrap", "name": "Scrap Metal", "description": "Salvaged metal parts.",
			"category": "resource", "rarity": "common", "weight": 1.5, "value": 7,
			"icon_path": "res://Data/Icons/scrap.svg", "max_stack": 50
		},
		"herbs": {
			"id": "herbs", "name": "Herbs", "description": "Medicinal plants.",
			"category": "resource", "rarity": "common", "weight": 0.5, "value": 6,
			"icon_path": "res://Data/Icons/herbs.svg", "max_stack": 30
		},
		"plants": {
			"id": "plants", "name": "Plants", "description": "Generic plant material.",
			"category": "resource", "rarity": "common", "weight": 0.5, "value": 4,
			"icon_path": "res://Data/Icons/plants.svg", "max_stack": 30
		},
		"components": {
			"id": "components", "name": "Components", "description": "Electronic components.",
			"category": "resource", "rarity": "uncommon", "weight": 0.5, "value": 25,
			"icon_path": "res://Data/Icons/components.svg", "max_stack": 30
		},
		"crystals": {
			"id": "crystals", "name": "Crystals", "description": "Rare crystalline minerals.",
			"category": "resource", "rarity": "rare", "weight": 1.0, "value": 50,
			"icon_path": "res://Data/Icons/crystals.svg", "max_stack": 20
		},
		"fuel_basic": {
			"id": "fuel_basic", "name": "Basic Fuel", "description": "Standard locomotive fuel.",
			"category": "fuel", "rarity": "common", "weight": 2.0, "value": 15,
			"icon_path": "res://Data/Icons/fuel_basic.svg", "max_stack": 20
		},
		"fuel_refined": {
			"id": "fuel_refined", "name": "Refined Fuel", "description": "Higher quality fuel.",
			"category": "fuel", "rarity": "uncommon", "weight": 2.0, "value": 30,
			"icon_path": "res://Data/Icons/fuel_refined.svg", "max_stack": 20
		},
		# === TOOLS ===
		"axe_basic": {
			"id": "axe_basic", "name": "Basic Axe", "description": "A simple axe for chopping wood.",
			"category": "tool", "rarity": "common", "weight": 2.0, "value": 20,
			"icon_path": "res://Data/Icons/axe.svg", "max_stack": 1,
			"tool_type": "axe", "durability": 100, "max_durability": 100, "efficiency": 1.0
		},
		"pickaxe_basic": {
			"id": "pickaxe_basic", "name": "Basic Pickaxe", "description": "For mining stone and ore.",
			"category": "tool", "rarity": "common", "weight": 2.5, "value": 25,
			"icon_path": "res://Data/Icons/pickaxe.svg", "max_stack": 1,
			"tool_type": "pickaxe", "durability": 100, "max_durability": 100, "efficiency": 1.0
		},
		"shovel_basic": {
			"id": "shovel_basic", "name": "Basic Shovel", "description": "For digging and excavation.",
			"category": "tool", "rarity": "common", "weight": 2.0, "value": 15,
			"icon_path": "res://Data/Icons/shovel.svg", "max_stack": 1,
			"tool_type": "shovel", "durability": 100, "max_durability": 100, "efficiency": 1.0
		},
		"multitool": {
			"id": "multitool", "name": "Multi-Tool", "description": "Versatile tool for repairs.",
			"category": "tool", "rarity": "uncommon", "weight": 1.0, "value": 40,
			"icon_path": "res://Data/Icons/multitool.svg", "max_stack": 1,
			"tool_type": "multitool", "durability": 80, "max_durability": 80, "efficiency": 1.2
		},
		# === CONSUMABLES ===
		"repair_kit": {
			"id": "repair_kit", "name": "Repair Kit", "description": "Repairs tools and train parts.",
			"category": "consumable", "rarity": "common", "weight": 1.0, "value": 20,
			"icon_path": "res://Data/Icons/repair_kit.svg", "max_stack": 10,
			"heal_amount": 0, "repair_amount": 25
		},
		"food_apple": {
			"id": "food_apple", "name": "Apple", "description": "Restores a little stamina.",
			"category": "consumable", "rarity": "common", "weight": 0.3, "value": 5,
			"icon_path": "res://Data/Icons/food_apple.svg", "max_stack": 20,
			"stamina_restore": 15.0, "hp_restore": 0
		},
		"food_bread": {
			"id": "food_bread", "name": "Bread", "description": "Restores stamina and health.",
			"category": "consumable", "rarity": "common", "weight": 0.5, "value": 10,
			"icon_path": "res://Data/Icons/food_bread.svg", "max_stack": 15,
			"stamina_restore": 30.0, "hp_restore": 10
		},
		"fuel_canister": {
			"id": "fuel_canister", "name": "Fuel Canister", "description": "Adds 20 fuel to the train.",
			"category": "consumable", "rarity": "common", "weight": 3.0, "value": 25,
			"icon_path": "res://Data/Icons/fuel_canister.svg", "max_stack": 5,
			"fuel_amount": 20.0
		},
		# === CRAFTING OUTPUTS ===
		"box": {
			"id": "box", "name": "Storage Box", "description": "Increases cargo capacity.",
			"category": "crafting", "rarity": "common", "weight": 5.0, "value": 30,
			"icon_path": "res://Data/Icons/box.svg", "max_stack": 5,
			"cargo_bonus": 25
		},
		"simple_part": {
			"id": "simple_part", "name": "Simple Part", "description": "Basic mechanical part.",
			"category": "crafting", "rarity": "common", "weight": 1.0, "value": 20,
			"icon_path": "res://Data/Icons/simple_part.svg", "max_stack": 20
		},
		"motor_part": {
			"id": "motor_part", "name": "Motor Part", "description": "Advanced engine component.",
			"category": "crafting", "rarity": "uncommon", "weight": 2.0, "value": 60,
			"icon_path": "res://Data/Icons/motor_part.svg", "max_stack": 10
		},
		# === EQUIPMENT ===
		"hat_worker": {
			"id": "hat_worker", "name": "Worker Hat", "description": "A sturdy workman's cap.",
			"category": "equipment", "rarity": "common", "weight": 0.3, "value": 15,
			"icon_path": "res://Data/Icons/hat_worker.svg", "max_stack": 1,
			"slot": "hat", "defense": 0, "stamina_bonus": 0
		},
		"outfit_explorer": {
			"id": "outfit_explorer", "name": "Explorer Outfit", "description": "Light outfit for exploration.",
			"category": "equipment", "rarity": "uncommon", "weight": 1.0, "value": 50,
			"icon_path": "res://Data/Icons/outfit_explorer.svg", "max_stack": 1,
			"slot": "outfit", "defense": 2, "stamina_bonus": 5
		},
		# === TRAIN PARTS ===
		"wagon_cargo_mk1": {
			"id": "wagon_cargo_mk1", "name": "Cargo Wagon Mk1", "description": "Basic cargo wagon. +50kg capacity.",
			"category": "train_part", "rarity": "common", "weight": 500.0, "value": 200,
			"icon_path": "res://Data/Icons/wagon_cargo.svg", "max_stack": 1,
			"wagon_type": "cargo", "cargo_capacity": 50, "integrity": 100
		},
		"wagon_workshop_mk1": {
			"id": "wagon_workshop_mk1", "name": "Workshop Wagon Mk1", "description": "Mobile workshop for repairs.",
			"category": "train_part", "rarity": "uncommon", "weight": 600.0, "value": 500,
			"icon_path": "res://Data/Icons/wagon_workshop.svg", "max_stack": 1,
			"wagon_type": "workshop", "integrity": 100
		},
	}

func lookup(id: String) -> Dictionary:
	return data.get(id, {})

func get_all() -> Dictionary:
	return data

func has(id: String) -> bool:
	return data.has(id)

func get_value(id: String) -> int:
	return data.get(id, {}).get("value", 0)

func get_weight(id: String) -> float:
	return data.get(id, {}).get("weight", 0.0)

func get_category(id: String) -> String:
	return data.get(id, {}).get("category", "")

func get_rarity(id: String) -> String:
	return data.get(id, {}).get("rarity", "common")
