extends Control
## Pause Menu — shown when ESC is pressed during gameplay.

@onready var resume_btn: Button = $Panel/VBoxContainer/ResumeButton
@onready var inventory_btn: Button = $Panel/VBoxContainer/InventoryButton
@onready var map_btn: Button = $Panel/VBoxContainer/MapButton
@onready var quests_btn: Button = $Panel/VBoxContainer/QuestsButton
@onready var codex_btn: Button = $Panel/VBoxContainer/CodexButton
@onready var settings_btn: Button = $Panel/VBoxContainer/SettingsButton
@onready var save_btn: Button = $Panel/VBoxContainer/SaveButton
@onready var menu_btn: Button = $Panel/VBoxContainer/MenuButton

func _ready() -> void:
	visible = false
	resume_btn.pressed.connect(_on_resume)
	inventory_btn.pressed.connect(_on_inventory)
	map_btn.pressed.connect(_on_map)
	quests_btn.pressed.connect(_on_quests)
	codex_btn.pressed.connect(_on_codex)
	settings_btn.pressed.connect(_on_settings)
	save_btn.pressed.connect(_on_save)
	menu_btn.pressed.connect(_on_menu)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("pause"):
		if GameManager.state == GameManager.GameState.PLAYING:
			_open_pause()
		elif visible:
			_on_resume()
		get_viewport().set_input_as_handled()

func _open_pause() -> void:
	visible = true
	GameManager.change_state(GameManager.GameState.PAUSED)

func _on_resume() -> void:
	visible = false
	GameManager.change_state(GameManager.GameState.PLAYING)

func _on_inventory() -> void:
	visible = false
	var inv := get_tree().get_first_node_in_group("inventory_ui")
	if inv:
		inv.open()

func _on_map() -> void:
	visible = false
	EventBus.notification_requested.emit("Map coming soon!", "info")

func _on_quests() -> void:
	visible = false
	EventBus.notification_requested.emit("Quest log coming soon!", "info")

func _on_codex() -> void:
	visible = false
	EventBus.notification_requested.emit("Codex coming soon!", "info")

func _on_settings() -> void:
	visible = false
	get_tree().change_scene_to_file("res://Scenes/UI/SettingsScreen.tscn")

func _on_save() -> void:
	SaveManager.save_game()
	EventBus.notification_requested.emit("Game saved!", "success")

func _on_menu() -> void:
	visible = false
	GameManager.return_to_menu()
