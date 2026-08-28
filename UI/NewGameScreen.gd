extends Control
## New Game Screen — character creation and world settings before starting.

@onready var name_field: LineEdit = $Panel/MarginContainer/VBoxContainer/NameSection/NameField
@onready var train_name_field: LineEdit = $Panel/MarginContainer/VBoxContainer/TrainSection/TrainNameField
@onready var seed_field: LineEdit = $Panel/MarginContainer/VBoxContainer/SeedSection/SeedField
@onready var difficulty_option: OptionButton = $Panel/MarginContainer/VBoxContainer/DifficultySection/DifficultyOption
@onready var start_btn: Button = $Panel/MarginContainer/VBoxContainer/HBoxContainer/StartButton
@onready var back_btn: Button = $Panel/MarginContainer/VBoxContainer/HBoxContainer/BackButton

func _ready() -> void:
	difficulty_option.add_item("Normal")
	start_btn.pressed.connect(_on_start)
	back_btn.pressed.connect(_on_back)
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

func _on_start() -> void:
	var player_name: String = name_field.text.strip_edges()
	if player_name.is_empty():
		player_name = "Rei Carpincho"
	var train_name: String = train_name_field.text.strip_edges()
	if train_name.is_empty():
		train_name = "Old Rusty"
	var seed_val: int = 0
	if not seed_field.text.strip_edges().is_empty():
		seed_val = seed_field.text.strip_edges().hash()
	GameManager.start_new_game(player_name, train_name, seed_val)

func _on_back() -> void:
	get_tree().change_scene_to_file("res://Scenes/UI/MainMenu.tscn")
