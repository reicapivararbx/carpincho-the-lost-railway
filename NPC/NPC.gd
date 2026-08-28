extends CharacterBody3D
## NPC — non-player character with dialogue, shop, and quest giving.

var npc_id: String = ""
var npc_data: Dictionary = {}
var current_dialogue_index: int = 0
var is_dialogue_active: bool = false

func _ready() -> void:
	if npc_data.is_empty() and npc_id != "":
		npc_data = NPCDB.lookup(npc_id)

func get_interact_prompt() -> String:
	if npc_data.is_empty():
		return "[E] Talk"
	var profession: String = npc_data.get("profession", "")
	if profession == "Merchant":
		return "[E] Talk / Shop"
	return "[E] Talk " + npc_data.get("name", "")

func interact(interactor: Node3D) -> void:
	if npc_data.is_empty():
		return

	# Check if NPC has quests to give
	var quest_ids: Array = npc_data.get("quests_given", [])
	var completed: Array = SaveManager.get_quest_data().get("completed", [])
	var active: Array = SaveManager.get_quest_data().get("active", [])

	for qid in quest_ids:
		if qid not in completed and qid not in active:
			# Offer quest
			var quest_data := QuestDB.lookup(qid)
			if not quest_data.is_empty():
				EventBus.dialog_started.emit({
					"speaker": npc_data.get("name", "NPC"),
					"text": quest_data.get("dialogue_start", "I have a task for you."),
					"quest_id": qid,
					"has_shop": not npc_data.get("shop_items", []).is_empty(),
					"npc_id": npc_id,
				})
				return

	# Regular dialogue
	var lines: Array = npc_data.get("dialogue_lines", ["..."])
	var line: String = lines[current_dialogue_index % lines.size()]
	current_dialogue_index += 1

	EventBus.dialog_started.emit({
		"speaker": npc_data.get("name", "NPC"),
		"text": line,
		"quest_id": "",
		"has_shop": not npc_data.get("shop_items", []).is_empty(),
		"npc_id": npc_id,
	})

func get_shop_items() -> Array:
	return npc_data.get("shop_items", [])

func get_shop_prices() -> Dictionary:
	return npc_data.get("shop_prices", {})

func is_shopkeeper() -> bool:
	return not npc_data.get("shop_items", []).is_empty()
