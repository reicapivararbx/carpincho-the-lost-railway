extends Control
## Main Menu — title screen with Play, Continue, Multiplayer, Settings, Credits, Quit.

@onready var continue_btn: Button = $VBoxContainer/ContinueButton
@onready var play_btn: Button = $VBoxContainer/PlayButton
@onready var multiplayer_btn: Button = $VBoxContainer/MultiplayerButton
@onready var settings_btn: Button = $VBoxContainer/SettingsButton
@onready var credits_btn: Button = $VBoxContainer/CreditsButton
@onready var quit_btn: Button = $VBoxContainer/QuitButton

func _ready() -> void:
	continue_btn.disabled = not SaveManager.has_save()
	play_btn.pressed.connect(_on_play)
	continue_btn.pressed.connect(_on_continue)
	multiplayer_btn.pressed.connect(_on_multiplayer)
	settings_btn.pressed.connect(_on_settings)
	credits_btn.pressed.connect(_on_credits)
	quit_btn.pressed.connect(_on_quit)
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

func _on_play() -> void:
	# Show new game / continue dialog
	get_tree().change_scene_to_file("res://Scenes/UI/NewGameScreen.tscn")

func _on_continue() -> void:
	if SaveManager.load_game():
		GameManager.is_new_game = false
		GameManager.change_state(GameManager.GameState.PLAYING)
		get_tree().change_scene_to_file("res://Scenes/World/GameWorld.tscn")

func _on_multiplayer() -> void:
	EventBus.notification_requested.emit("Multiplayer coming in v0.6.0", "info")

func _on_settings() -> void:
	get_tree().change_scene_to_file("res://Scenes/UI/SettingsScreen.tscn")

func _on_credits() -> void:
	EventBus.notification_requested.emit("CARPINCHO: The Lost Railway — Made with Godot 4.3", "info")

func _on_quit() -> void:
	get_tree().quit()
