extends Node
## Central game state manager.

enum GameState { MENU, LOADING, PLAYING, PAUSED, DIALOG, INVENTORY, MAP, CRAFTING, SHOP }

var state: GameState = GameState.MENU
var is_new_game: bool = true
var world_seed: int = 0
var difficulty: String = "normal"

# Player reference (set when player loads in)
var player: CharacterBody3D = null
var train: Node3D = null
var current_station: String = ""
var current_region: String = "plains"

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

func change_state(new_state: GameState) -> void:
	var old := state
	state = new_state
	match new_state:
		GameState.PLAYING:
			get_tree().paused = false
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
		GameState.PAUSED:
			get_tree().paused = true
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		GameState.MENU:
			get_tree().paused = false
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		GameState.DIALOG:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		GameState.INVENTORY, GameState.MAP, GameState.CRAFTING, GameState.SHOP:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

func start_new_game(player_name: String, train_name: String, seed_val: int) -> void:
	is_new_game = true
	world_seed = seed_val if seed_val != 0 else randi()
	# Initialize player data through SaveManager
	SaveManager.create_new_save(player_name, train_name, world_seed)
	# Load the game world
	get_tree().change_scene_to_file("res://Scenes/World/GameWorld.tscn")

func continue_game() -> void:
	is_new_game = false
	if SaveManager.has_save():
		get_tree().change_scene_to_file("res://Scenes/World/GameWorld.tscn")

func return_to_menu() -> void:
	change_state(GameState.MENU)
	get_tree().change_scene_to_file("res://Scenes/UI/MainMenu.tscn")

func is_gameplay_active() -> bool:
	return state == GameState.PLAYING

func get_play_time() -> float:
	return SaveManager.save_data.get("play_time", 0.0)
