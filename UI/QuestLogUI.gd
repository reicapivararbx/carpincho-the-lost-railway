extends Control
## Quest Log UI — shows active, completed, and available quests.

var is_open: bool = false
var selected_quest: String = ""

@onready var active_list: ItemList = $Panel/MarginContainer/VBoxContainer/HSplitContainer/ActivePanel/ActiveList
@onready var detail_name: Label = $Panel/MarginContainer/VBoxContainer/HSplitContainer/DetailPanel/DetailName
@onready var detail_desc: RichTextLabel = $Panel/MarginContainer/VBoxContainer/HSplitContainer/DetailPanel/DetailDesc
@onready var objectives_label: Label = $Panel/MarginContainer/VBoxContainer/HSplitContainer/DetailPanel/ObjectivesLabel
@onready var rewards_label: Label = $Panel/MarginContainer/VBoxContainer/HSplitContainer/DetailPanel/RewardsLabel
@onready var close_btn: Button = $Panel/MarginContainer/VBoxContainer/CloseButton

func _ready() -> void:
	visible = false
	close_btn.pressed.connect(_on_close)
	active_list.item_selected.connect(_on_quest_selected)

func open() -> void:
	is_open = true
	visible = true
	GameManager.change_state(GameManager.GameState.PLAYING)
	_refresh()

func close() -> void:
	is_open = false
	visible = false

func _refresh() -> void:
	active_list.clear()
	for entry in QuestManager.active_quests:
		var quest_id: String = entry.get("id", "")
		var quest_def: Dictionary = QuestDB.lookup(quest_id)
		var name: String = quest_def.get("name", quest_id)
		var idx := active_list.add_item("► " + name)
		active_list.set_item_metadata(idx, {"id": quest_id, "progress": entry.get("progress", {})})

	# Completed section
	var completed_label := Label.new()
	completed_label.text = "--- Completed ---"
	completed_label.add_theme_font_size_override("font_size", 14)
	active_list.add_item("--- Completed ---")

	for qid in QuestManager.completed_quests:
		var quest_def: Dictionary = QuestDB.lookup(qid)
		active_list.add_item("✓ " + quest_def.get("name", qid))

func _on_quest_selected(index: int) -> void:
	var meta: Dictionary = active_list.get_item_metadata(index)
	if meta.is_empty():
		return
	var quest_id: String = meta.get("id", "")
	if quest_id.is_empty():
		return
	var quest_def: Dictionary = QuestDB.lookup(quest_id)
	detail_name.text = quest_def.get("name", "")
	detail_desc.text = quest_def.get("description", "")

	var progress: Dictionary = meta.get("progress", {})
	var obj_text := "Objectives:\n"
	for i in quest_def.get("objectives", []).size():
		var obj: Dictionary = quest_def["objectives"][i]
		var current: int = progress.get(i, 0)
		var target: int = obj.get("quantity", 1)
		var done := "✓" if current >= target else "○"
		obj_text += "%s %s (%d/%d)\n" % [done, obj.get("description", ""), mini(current, target), target]
	objectives_label.text = obj_text

	var rewards: Dictionary = quest_def.get("rewards", {})
	var rew_text := "Rewards:\n"
	if rewards.has("xp"):
		rew_text += "  XP: %d\n" % rewards["xp"]
	if rewards.has("coins"):
		rew_text += "  CapyCoins: %d\n" % rewards["coins"]
	for item in rewards.get("items", []):
		var item_data: Dictionary = ItemDB.lookup(item.get("id", ""))
		rew_text += "  %s x%d\n" % [item_data.get("name", item.get("id", "")), item.get("qty", 1)]
	rewards_label.text = rew_text

func _on_close() -> void:
	close()

func _unhandled_input(event: InputEvent) -> void:
	if visible and event.is_action_pressed("pause"):
		_on_close()
		get_viewport().set_input_as_handled()
