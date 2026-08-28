extends Node
## Handles saving and loading game data.

const SAVE_PATH := "user://saves/"
const SAVE_FILE := "savegame.json"
const BACKUP_FILE := "savegame_backup.json"

var save_data: Dictionary = {}

func _ready() -> void:
	DirAccess.make_dir_recursive_absolute(SAVE_PATH)

func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH + SAVE_FILE)

func create_new_save(player_name: String, train_name: String, seed_val: int) -> void:
	save_data = {
		"version": "0.1.0",
		"player": {
			"name": player_name,
			"level": 1,
			"xp": 0,
			"xp_to_next": 100,
			"hp": 100,
			"max_hp": 100,
			"stamina": 100.0,
			"max_stamina": 100.0,
			"coins": 100,
			"position": {"x": 0.0, "y": 1.0, "z": 0.0},
			"rotation": 0.0,
			"inventory": [],
			"equipment": {"tool": "", "hat": "", "outfit": "", "accessory": ""},
			"reputation": {},
			"discovered_regions": ["plains"],
			"discovered_stations": ["plains_station"],
			"discovered_locations": [],
		},
		"train": {
			"name": train_name,
			"speed_kmh": 0.0,
			"fuel": 80.0,
			"max_fuel": 100.0,
			"integrity": 100.0,
			"max_integrity": 100.0,
			"position": {"x": 0.0, "y": 0.5, "z": 0.0},
			"wagons": [],
			"upgrades": {},
			"paint": {"primary": Color(0.4, 0.2, 0.1), "secondary": Color(0.2, 0.2, 0.2)},
		},
		"world": {
			"seed": seed_val,
			"day": 1,
			"hour": 8,
			"minute": 0,
			"weather": "clear",
		},
		"quests": {
			"active": [],
			"completed": [],
			"failed": [],
		},
		"stats": {
			"distance_traveled": 0.0,
			"resources_collected": 0,
			"enemies_defeated": 0,
			"quests_completed": 0,
			"play_time": 0.0,
			"items_crafted": 0,
			"stations_visited": 1,
			"regions_discovered": 1,
		},
		"achievements": [],
		"collections": [],
		"play_time": 0.0,
	}
	save_game()

func save_game() -> void:
	# Backup existing save
	if FileAccess.file_exists(SAVE_PATH + SAVE_FILE):
		DirAccess.copy_absolute(SAVE_PATH + SAVE_FILE, SAVE_PATH + BACKUP_FILE)
	
	var file := FileAccess.open(SAVE_PATH + SAVE_FILE, FileAccess.WRITE)
	if file == null:
		EventBus.save_error.emit("Failed to open save file for writing.")
		return
	file.store_string(JSON.stringify(save_data, "\t"))
	file.close()
	EventBus.game_saved.emit()

func load_game() -> bool:
	if not FileAccess.file_exists(SAVE_PATH + SAVE_FILE):
		EventBus.save_error.emit("No save file found.")
		return false
	
	var file := FileAccess.open(SAVE_PATH + SAVE_FILE, FileAccess.READ)
	if file == null:
		EventBus.save_error.emit("Failed to open save file.")
		return false
	
	var json := JSON.new()
	var err := json.parse(file.get_as_text())
	file.close()
	
	if err != OK:
		EventBus.save_error.emit("Failed to parse save file.")
		return _load_backup()
	
	save_data = json.data
	_apply_loaded_data()
	EventBus.game_loaded.emit()
	return true

func _load_backup() -> bool:
	if not FileAccess.file_exists(SAVE_PATH + BACKUP_FILE):
		EventBus.save_error.emit("No backup save found.")
		return false
	var file := FileAccess.open(SAVE_PATH + BACKUP_FILE, FileAccess.READ)
	if file == null:
		return false
	var json := JSON.new()
	var err := json.parse(file.get_as_text())
	file.close()
	if err != OK:
		EventBus.save_error.emit("Backup save also corrupted.")
		return false
	save_data = json.data
	_apply_loaded_data()
	EventBus.game_loaded.emit()
	return true

func _apply_loaded_data() -> void:
	# Validate required fields
	if not save_data.has("player"):
		save_data["player"] = {}
	if not save_data.has("train"):
		save_data["train"] = {}
	if not save_data.has("world"):
		save_data["world"] = {}

func get_player_data() -> Dictionary:
	return save_data.get("player", {})

func get_train_data() -> Dictionary:
	return save_data.get("train", {})

func get_world_data() -> Dictionary:
	return save_data.get("world", {})

func get_quest_data() -> Dictionary:
	return save_data.get("quests", {})

func get_stats() -> Dictionary:
	return save_data.get("stats", {})

func update_player(key: String, value: Variant) -> void:
	if save_data.has("player"):
		save_data["player"][key] = value

func update_train(key: String, value: Variant) -> void:
	if save_data.has("train"):
		save_data["train"][key] = value

func update_world(key: String, value: Variant) -> void:
	if save_data.has("world"):
		save_data["world"][key] = value

func add_coins(amount: int) -> void:
	var current: int = save_data.get("player", {}).get("coins", 0)
	save_data["player"]["coins"] = current + amount
	EventBus.player_coins_changed.emit(save_data["player"]["coins"])

func remove_coins(amount: int) -> bool:
	var current: int = save_data.get("player", {}).get("coins", 0)
	if current >= amount:
		save_data["player"]["coins"] = current - amount
		EventBus.player_coins_changed.emit(save_data["player"]["coins"])
		return true
	return false

func add_xp(amount: int) -> void:
	var player: Dictionary = save_data.get("player", {})
	var current_xp: int = player.get("xp", 0)
	var xp_to_next: int = player.get("xp_to_next", 100)
	var level: int = player.get("level", 1)
	
	current_xp += amount
	while current_xp >= xp_to_next:
		current_xp -= xp_to_next
		level += 1
		xp_to_next = int(xp_to_next * 1.5)
		player["level"] = level
		player["xp_to_next"] = xp_to_next
		EventBus.player_level_up.emit(level)
	
	player["xp"] = current_xp
	player["xp_to_next"] = xp_to_next
	save_data["player"] = player
	EventBus.player_xp_changed.emit(current_xp, xp_to_next)

func add_to_inventory(item_id: String, quantity: int = 1) -> bool:
	var inv: Array = save_data.get("player", {}).get("inventory", [])
	for entry in inv:
		if entry.get("id") == item_id:
			entry["quantity"] = entry.get("quantity", 0) + quantity
			EventBus.inventory_item_added.emit(item_id, quantity)
			return true
	inv.append({"id": item_id, "quantity": quantity})
	save_data["player"]["inventory"] = inv
	EventBus.inventory_item_added.emit(item_id, quantity)
	return true

func remove_from_inventory(item_id: String, quantity: int = 1) -> bool:
	var inv: Array = save_data.get("player", {}).get("inventory", [])
	for i in range(inv.size()):
		if inv[i].get("id") == item_id:
			inv[i]["quantity"] = inv[i].get("quantity", 0) - quantity
			if inv[i]["quantity"] <= 0:
				inv.remove_at(i)
			EventBus.inventory_item_removed.emit(item_id, quantity)
			return true
	return false

func count_in_inventory(item_id: String) -> int:
	var inv: Array = save_data.get("player", {}).get("inventory", [])
	for entry in inv:
		if entry.get("id") == item_id:
			return entry.get("quantity", 0)
	return 0

func delete_save() -> void:
	DirAccess.remove_absolute(SAVE_PATH + SAVE_FILE)
	DirAccess.remove_absolute(SAVE_PATH + BACKUP_FILE)
