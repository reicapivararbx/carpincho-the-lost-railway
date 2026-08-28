extends Node
## Quest Manager — tracks active, completed, and failed quests. Checks objectives.

var active_quests: Array = []  # Array of {id, quest_data, objectives_progress}
var completed_quests: Array = []
var failed_quests: Array = []

func _ready() -> void:
	EventBus.inventory_item_added.connect(_on_inventory_changed)
	EventBus.location_discovered.connect(_on_location_discovered)
	EventBus.region_discovered.connect(_on_region_discovered)
	EventBus.player_near_interactable.connect(_on_near_interactable)
	_load_quests()

func _load_quests() -> void:
	var quest_data := SaveManager.get_quest_data()
	active_quests = quest_data.get("active", [])
	completed_quests = quest_data.get("completed", [])
	failed_quests = quest_data.get("failed", [])

func start_quest(quest_id: String) -> void:
	var quest_def: Dictionary = QuestDB.lookup(quest_id)
	if quest_def.is_empty():
		return
	if quest_id in completed_quests or quest_id in _get_active_ids():
		return

	var progress := {}
	for i in quest_def.get("objectives", []).size():
		progress[i] = 0

	active_quests.append({
		"id": quest_id,
		"progress": progress
	})
	_save()
	EventBus.quest_started.emit(quest_id)
	EventBus.notification_requested.emit("Quest Started: %s" % quest_def.get("name", ""), "quest")

func complete_quest(quest_id: String) -> void:
	var idx := _find_active(quest_id)
	if idx == -1:
		return
	active_quests.remove_at(idx)
	completed_quests.append(quest_id)

	var quest_def: Dictionary = QuestDB.lookup(quest_id)
	var rewards: Dictionary = quest_def.get("rewards", {})

	# Grant rewards
	if rewards.has("xp"):
		SaveManager.add_xp(rewards["xp"])
	if rewards.has("coins"):
		SaveManager.add_coins(rewards["coins"])
	for item in rewards.get("items", []):
		SaveManager.add_to_inventory(item["id"], item.get("qty", 1))

	var stats: Dictionary = SaveManager.save_data.get("stats", {})
	stats["quests_completed"] = stats.get("quests_completed", 0) + 1
	SaveManager.save_data["stats"] = stats

	_save()
	EventBus.quest_completed.emit(quest_id)
	EventBus.notification_requested.emit("Quest Completed: %s" % quest_def.get("name", ""), "success")

func fail_quest(quest_id: String) -> void:
	var idx := _find_active(quest_id)
	if idx == -1:
		return
	active_quests.remove_at(idx)
	failed_quests.append(quest_id)
	_save()
	EventBus.quest_failed.emit(quest_id)

func advance_objective(quest_id: String, objective_idx: int, amount: int = 1) -> void:
	var idx := _find_active(quest_id)
	if idx == -1:
		return
	var quest_entry: Dictionary = active_quests[idx]
	var progress: Dictionary = quest_entry.get("progress", {})
	var current: int = progress.get(objective_idx, 0)
	progress[objective_idx] = current + amount
	quest_entry["progress"] = progress

	# Check if objective is complete
	var quest_def: Dictionary = QuestDB.lookup(quest_id)
	var objectives: Array = quest_def.get("objectives", [])
	if objective_idx < objectives.size():
		var obj: Dictionary = objectives[objective_idx]
		if progress[objective_idx] >= obj.get("quantity", 1):
			EventBus.quest_objective_completed.emit(quest_id, objective_idx)

	# Check if all objectives are complete
	var all_done := true
	for i in objectives.size():
		if progress.get(i, 0) < objectives[i].get("quantity", 1):
			all_done = false
			break
	if all_done:
		complete_quest(quest_id)
	else:
		_save()

func is_quest_active(quest_id: String) -> bool:
	return _find_active(quest_id) != -1

func is_quest_completed(quest_id: String) -> bool:
	return quest_id in completed_quests

func get_quest_progress(quest_id: String) -> Dictionary:
	var idx := _find_active(quest_id)
	if idx == -1:
		return {}
	return active_quests[idx]

func get_available_quests() -> Array:
	var player_level: int = SaveManager.get_player_data().get("level", 1)
	return QuestDB.get_available(player_level, completed_quests)

func _get_active_ids() -> Array:
	var ids: Array = []
	for entry in active_quests:
		ids.append(entry.get("id", ""))
	return ids

func _find_active(quest_id: String) -> int:
	for i in active_quests.size():
		if active_quests[i].get("id", "") == quest_id:
			return i
	return -1

func _save() -> void:
	SaveManager.save_data["quests"] = {
		"active": active_quests,
		"completed": completed_quests,
		"failed": failed_quests,
	}

# === Signal handlers for auto-advancing objectives ===

func _on_inventory_changed(item_id: String, _qty: int) -> void:
	for entry in active_quests:
		var quest_id: String = entry.get("id", "")
		var quest_def: Dictionary = QuestDB.lookup(quest_id)
		for i in quest_def.get("objectives", []).size():
			var obj: Dictionary = quest_def["objectives"][i]
			if obj.get("type") == "collect" and obj.get("target") == item_id:
				var current_count: int = SaveManager.count_in_inventory(item_id)
				entry["progress"][i] = current_count
				if current_count >= obj.get("quantity", 1):
					EventBus.quest_objective_completed.emit(quest_id, i)
	_save()

func _on_location_discovered(location_id: String) -> void:
	for entry in active_quests:
		var quest_id: String = entry.get("id", "")
		var quest_def: Dictionary = QuestDB.lookup(quest_id)
		for i in quest_def.get("objectives", []).size():
			var obj: Dictionary = quest_def["objectives"][i]
			if obj.get("type") == "discover" and obj.get("target") == location_id:
				advance_objective(quest_id, i, 1)

func _on_region_discovered(region_id: String) -> void:
	_on_location_discovered(region_id)

func _on_near_interactable(node: Node3D) -> void:
	for entry in active_quests:
		var quest_id: String = entry.get("id", "")
		var quest_def: Dictionary = QuestDB.lookup(quest_id)
		for i in quest_def.get("objectives", []).size():
			var obj: Dictionary = quest_def["objectives"][i]
			if obj.get("type") == "interact":
				var target_name: String = obj.get("target", "")
				if node.name.containsn(target_name) or node.is_in_group(target_name):
					advance_objective(quest_id, i, 1)
