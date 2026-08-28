extends Control
## Dialogue UI — shows NPC dialogue with choices and quest acceptance.

var is_open: bool = false
var current_data: Dictionary = {}

@onready var panel: PanelContainer = $Panel
@onready var speaker_label: Label = $Panel/MarginContainer/VBoxContainer/SpeakerLabel
@onready var text_label: RichTextLabel = $Panel/MarginContainer/VBoxContainer/TextLabel
@onready var accept_btn: Button = $Panel/MarginContainer/VBoxContainer/HBoxContainer/AcceptButton
@onready var shop_btn: Button = $Panel/MarginContainer/VBoxContainer/HBoxContainer/ShopButton
@onready var close_btn: Button = $Panel/MarginContainer/VBoxContainer/HBoxContainer/CloseButton

func _ready() -> void:
	visible = false
	EventBus.dialog_started.connect(_on_dialog_started)
	EventBus.dialog_ended.connect(_on_dialog_ended)
	accept_btn.pressed.connect(_on_accept_pressed)
	shop_btn.pressed.connect(_on_shop_pressed)
	close_btn.pressed.connect(_on_close_pressed)

func _on_dialog_started(data: Dictionary) -> void:
	current_data = data
	is_open = true
	visible = true
	GameManager.change_state(GameManager.GameState.DIALOG)
	speaker_label.text = data.get("speaker", "???")
	text_label.text = data.get("text", "")
	var quest_id: String = data.get("quest_id", "")
	accept_btn.visible = quest_id != ""
	shop_btn.visible = data.get("has_shop", false)

func _on_dialog_ended() -> void:
	is_open = false
	visible = false
	GameManager.change_state(GameManager.GameState.PLAYING)

func _on_accept_pressed() -> void:
	var quest_id: String = current_data.get("quest_id", "")
	if quest_id != "":
		QuestManager.start_quest(quest_id)
		EventBus.dialog_ended.emit()

func _on_shop_pressed() -> void:
	var npc_id: String = current_data.get("npc_id", "")
	EventBus.dialog_ended.emit()
	if npc_id != "":
		EventBus.shop_opened.emit(npc_id)

func _on_close_pressed() -> void:
	EventBus.dialog_ended.emit()

func _unhandled_input(event: InputEvent) -> void:
	if is_open and event.is_action_pressed("interact"):
		_on_close_pressed()
		get_viewport().set_input_as_handled()
