extends Node
## Train and wagon database.

var data: Dictionary = {}

func _ready() -> void:
	data = {
		"locomotive_basic": {
			"id": "locomotive_basic",
			"name": "Old Rusty",
			"type": "locomotive",
			"description": "A beaten-up but reliable locomotive.",
			"base_speed": 60.0,
			"acceleration": 8.0,
			"max_fuel": 100.0,
			"fuel_consumption_rate": 0.5,
			"max_integrity": 100.0,
			"max_cargo_kg": 200.0,
			"wagon_slots": 3,
			"brake_power": 15.0,
			"weight": 5000.0,
			"cost": 0,
		},
		"locomotive_mk2": {
			"id": "locomotive_mk2",
			"name": "Iron Express",
			"type": "locomotive",
			"description": "An upgraded locomotive with better performance.",
			"base_speed": 90.0,
			"acceleration": 12.0,
			"max_fuel": 150.0,
			"fuel_consumption_rate": 0.6,
			"max_integrity": 120.0,
			"max_cargo_kg": 300.0,
			"wagon_slots": 4,
			"brake_power": 20.0,
			"weight": 6000.0,
			"cost": 2000,
		},
		"locomotive_mk3": {
			"id": "locomotive_mk3",
			"name": "Thunder Runner",
			"type": "locomotive",
			"description": "A high-performance locomotive for long hauls.",
			"base_speed": 120.0,
			"acceleration": 16.0,
			"max_fuel": 200.0,
			"fuel_consumption_rate": 0.8,
			"max_integrity": 150.0,
			"max_cargo_kg": 400.0,
			"wagon_slots": 5,
			"brake_power": 25.0,
			"weight": 7000.0,
			"cost": 5000,
		},
		"wagon_cargo_basic": {
			"id": "wagon_cargo_basic",
			"name": "Cargo Wagon",
			"type": "wagon",
			"description": "Basic cargo wagon for extra storage.",
			"wagon_type": "cargo",
			"max_cargo_kg": 50.0,
			"max_integrity": 80.0,
			"weight": 1000.0,
			"cost": 200,
		},
		"wagon_cargo_mk2": {
			"id": "wagon_cargo_mk2",
			"name": "Heavy Cargo Wagon",
			"type": "wagon",
			"description": "Reinforced cargo wagon for heavy loads.",
			"wagon_type": "cargo",
			"max_cargo_kg": 150.0,
			"max_integrity": 100.0,
			"weight": 1500.0,
			"cost": 800,
		},
		"wagon_workshop": {
			"id": "wagon_workshop",
			"name": "Workshop Wagon",
			"type": "wagon",
			"description": "Mobile workshop for on-the-go repairs and crafting.",
			"wagon_type": "workshop",
			"max_cargo_kg": 30.0,
			"max_integrity": 90.0,
			"weight": 1200.0,
			"cost": 500,
		},
		"wagon_dormitory": {
			"id": "wagon_dormitory",
			"name": "Dormitory Wagon",
			"type": "wagon",
			"description": "A place to sleep and save progress.",
			"wagon_type": "dormitory",
			"max_cargo_kg": 10.0,
			"max_integrity": 70.0,
			"weight": 800.0,
			"cost": 400,
		},
		"wagon_greenhouse": {
			"id": "wagon_greenhouse",
			"name": "Greenhouse Wagon",
			"type": "wagon",
			"description": "Grow plants and food on the move.",
			"wagon_type": "greenhouse",
			"max_cargo_kg": 20.0,
			"max_integrity": 60.0,
			"weight": 600.0,
			"cost": 600,
		},
		"wagon_defensive": {
			"id": "wagon_defensive",
			"name": "Armored Wagon",
			"type": "wagon",
			"description": "Reinforced wagon with armor plating.",
			"wagon_type": "defensive",
			"max_cargo_kg": 40.0,
			"max_integrity": 150.0,
			"weight": 2000.0,
			"cost": 1000,
		},
	}

func get(id: String) -> Dictionary:
	return data.get(id, {})

func get_all() -> Dictionary:
	return data

func get_locomotives() -> Array:
	var results: Array = []
	for entry in data.values():
		if entry.get("type") == "locomotive":
			results.append(entry)
	return results

func get_wagons() -> Array:
	var results: Array = []
	for entry in data.values():
		if entry.get("type") == "wagon":
			results.append(entry)
	return results

func get_by_wagon_type(wagon_type: String) -> Array:
	var results: Array = []
	for entry in data.values():
		if entry.get("wagon_type") == wagon_type:
			results.append(entry)
	return results
