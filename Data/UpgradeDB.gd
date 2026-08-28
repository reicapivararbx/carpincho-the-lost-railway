extends Node
## Upgrade database — train upgrades and tech tree.

var data: Dictionary = {}

func _ready() -> void:
	data = {
		# === ENGINE ===
		"engine_tier1": {
			"id": "engine_tier1",
			"name": "Engine Tune-Up",
			"description": "Basic engine maintenance for better performance.",
			"category": "engine",
			"cost_coins": 100,
			"cost_items": [{"id": "simple_part", "qty": 3}],
			"effects": {"acceleration": 2.0, "fuel_efficiency": 0.05},
			"prerequisite": "",
			"required_level": 3,
		},
		"engine_tier2": {
			"id": "engine_tier2",
			"name": "Engine Overhaul",
			"description": "Rebuilt engine with improved output.",
			"category": "engine",
			"cost_coins": 300,
			"cost_items": [{"id": "motor_part", "qty": 2}, {"id": "simple_part", "qty": 5}],
			"effects": {"acceleration": 5.0, "max_speed": 10.0, "fuel_efficiency": 0.1},
			"prerequisite": "engine_tier1",
			"required_level": 8,
		},
		"engine_tier3": {
			"id": "engine_tier3",
			"name": "Turbo Boost",
			"description": "Advanced turbocharging system.",
			"category": "engine",
			"cost_coins": 800,
			"cost_items": [{"id": "motor_part", "qty": 5}, {"id": "components", "qty": 3}],
			"effects": {"acceleration": 8.0, "max_speed": 25.0, "fuel_efficiency": 0.15},
			"prerequisite": "engine_tier2",
			"required_level": 15,
		},
		# === FUEL TANK ===
		"tank_tier1": {
			"id": "tank_tier1",
			"name": "Extended Tank",
			"description": "Larger fuel tank for longer journeys.",
			"category": "tank",
			"cost_coins": 150,
			"cost_items": [{"id": "iron", "qty": 10}, {"id": "simple_part", "qty": 2}],
			"effects": {"max_fuel": 30.0},
			"prerequisite": "",
			"required_level": 3,
		},
		"tank_tier2": {
			"id": "tank_tier2",
			"name": "Dual Tank System",
			"description": "Secondary fuel tank for extended range.",
			"category": "tank",
			"cost_coins": 400,
			"cost_items": [{"id": "iron", "qty": 15}, {"id": "motor_part", "qty": 1}],
			"effects": {"max_fuel": 70.0, "fuel_efficiency": 0.1},
			"prerequisite": "tank_tier1",
			"required_level": 10,
		},
		# === CARGO ===
		"cargo_tier1": {
			"id": "cargo_tier1",
			"name": "Reinforced Bed",
			"description": "Stronger wagon bed for more cargo.",
			"category": "cargo",
			"cost_coins": 100,
			"cost_items": [{"id": "iron", "qty": 8}, {"id": "wood", "qty": 10}],
			"effects": {"max_cargo_kg": 25.0},
			"prerequisite": "",
			"required_level": 2,
		},
		"cargo_tier2": {
			"id": "cargo_tier2",
			"name": "Cargo Expansion",
			"description": "Extended cargo capacity with better organization.",
			"category": "cargo",
			"cost_coins": 350,
			"cost_items": [{"id": "iron", "qty": 12}, {"id": "simple_part", "qty": 4}],
			"effects": {"max_cargo_kg": 60.0},
			"prerequisite": "cargo_tier1",
			"required_level": 7,
		},
		# === HULL ===
		"hull_tier1": {
			"id": "hull_tier1",
			"name": "Hull Repair",
			"description": "Fix dents and reinforce the chassis.",
			"category": "hull",
			"cost_coins": 80,
			"cost_items": [{"id": "iron", "qty": 6}, {"id": "scrap", "qty": 4}],
			"effects": {"max_integrity": 20.0},
			"prerequisite": "",
			"required_level": 2,
		},
		"hull_tier2": {
			"id": "hull_tier2",
			"name": "Armor Plating",
			"description": "Light armor plating for better protection.",
			"category": "hull",
			"cost_coins": 500,
			"cost_items": [{"id": "iron", "qty": 20}, {"id": "components", "qty": 2}],
			"effects": {"max_integrity": 50.0, "damage_resistance": 0.15},
			"prerequisite": "hull_tier1",
			"required_level": 12,
		},
		# === BRAKES ===
		"brakes_tier1": {
			"id": "brakes_tier1",
			"name": "Brake Service",
			"description": "Fresh brake pads for better stopping.",
			"category": "brakes",
			"cost_coins": 60,
			"cost_items": [{"id": "iron", "qty": 4}, {"id": "scrap", "qty": 2}],
			"effects": {"brake_power": 5.0},
			"prerequisite": "",
			"required_level": 2,
		},
		"brakes_tier2": {
			"id": "brakes_tier2",
			"name": "Hydraulic Brakes",
			"description": "Hydraulic brake system for quick stops.",
			"category": "brakes",
			"cost_coins": 350,
			"cost_items": [{"id": "iron", "qty": 8}, {"id": "components", "qty": 2}],
			"effects": {"brake_power": 12.0},
			"prerequisite": "brakes_tier1",
			"required_level": 8,
		},
		# === TECHNOLOGY ===
		"tech_radar": {
			"id": "tech_radar",
			"name": "Resource Radar",
			"description": "Detect nearby resources from the train.",
			"category": "technology",
			"cost_coins": 600,
			"cost_items": [{"id": "components", "qty": 5}, {"id": "crystals", "qty": 2}],
			"effects": {"resource_detection": true},
			"prerequisite": "",
			"required_level": 10,
		},
		"tech_scanner": {
			"id": "tech_scanner",
			"name": "Area Scanner",
			"description": "Reveal hidden objects and passages nearby.",
			"category": "technology",
			"cost_coins": 900,
			"cost_items": [{"id": "components", "qty": 8}, {"id": "crystals", "qty": 4}],
			"effects": {"hidden_object_detection": true},
			"prerequisite": "tech_radar",
			"required_level": 18,
		},
	}

func get(id: String) -> Dictionary:
	return data.get(id, {})

func get_all() -> Dictionary:
	return data

func get_by_category(category: String) -> Array:
	var results: Array = []
	for upgrade in data.values():
		if upgrade.get("category") == category:
			results.append(upgrade)
	return results

func get_available(player_level: int, owned_upgrades: Array) -> Array:
	var results: Array = []
	for upgrade in data.values():
		if upgrade["id"] in owned_upgrades:
			continue
		if upgrade.get("required_level", 1) > player_level:
			continue
		var prereq: String = upgrade.get("prerequisite", "")
		if prereq != "" and prereq not in owned_upgrades:
			continue
		results.append(upgrade)
	return results

func can_afford(upgrade_id: String, coins: int, inventory: Array) -> Dictionary:
	var upgrade := get(upgrade_id)
	if upgrade.is_empty():
		return {"can_afford": false, "reason": "Upgrade not found"}
	if coins < upgrade.get("cost_coins", 0):
		return {"can_afford": false, "reason": "Not enough coins"}
	for item_cost in upgrade.get("cost_items", []):
		var have := 0
		for item in inventory:
			if item.get("id") == item_cost["id"]:
				have = item.get("quantity", 0)
				break
		if have < item_cost["qty"]:
			return {"can_afford": false, "reason": "Missing materials"}
	return {"can_afford": true, "reason": ""}
