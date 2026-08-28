extends Node3D
## Main game world — loads regions, manages world state.

@onready var terrain: Node3D = $Terrain
@onready var rails: Node3D = $Rails
@onready var station: Node3D = $Station
@onready var forest: Node3D = $Forest
@onready var cave: Node3D = $Cave
@onready var environment: WorldEnvironment = $WorldEnvironment
@onready var sun: DirectionalLight3D = $DirectionalLight3D
@onready var player_spawn: Marker3D = $PlayerSpawn
@onready var train_spawn: Marker3D = $TrainSpawn

var train_scene: PackedScene = preload("res://Scenes/Train/Train.tscn")
var player_scene: PackedScene = preload("res://Scenes/Player/Player.tscn")

var current_train: Node3D = null
var current_player: CharacterBody3D = null

func _ready() -> void:
	# Ensure game state
	if GameManager.state == GameManager.GameState.MENU:
		GameManager.change_state(GameManager.GameState.PLAYING)
	
	# Spawn player
	current_player = player_scene.instantiate()
	current_player.global_position = player_spawn.global_position
	add_child(current_player)
	GameManager.player = current_player
	
	# Spawn train
	current_train = train_scene.instantiate()
	current_train.global_position = train_spawn.global_position
	add_child(current_train)
	GameManager.train = current_train
	
	# Setup camera
	var cam := current_player.get_node("CameraController")
	if cam:
		cam.set_target(current_player)
	
	# Load world data
	_load_world_state()
	
	# Connect signals
	EventBus.game_saved.connect(_on_game_saved)
	EventBus.player_entered_train.connect(_on_player_entered_train)
	EventBus.player_exited_train.connect(_on_player_exited_train)
	
	# Start first quest if new game
	if GameManager.is_new_game:
		_start_first_quest()

func _on_game_saved() -> void:
	SaveManager.update_train("position", {
		"x": current_train.global_position.x,
		"y": current_train.global_position.y,
		"z": current_train.global_position.z
	})
	SaveManager.update_player("position", {
		"x": current_player.global_position.x,
		"y": current_player.global_position.y,
		"z": current_player.global_position.z
	})

func _on_player_entered_train() -> void:
	# Player enters train cabin
	pass

func _on_player_exited_train() -> void:
	# Player exits train at current position
	if current_train:
		current_player.global_position = current_train.global_position + Vector3(2, 1, 0)

func _start_first_quest() -> void:
	QuestManager.start_quest("first_departure")

func _load_world_state() -> void:
	var world_data := SaveManager.get_world_data()
	var day: int = world_data.get("day", 1)
	var hour: int = world_data.get("hour", 8)
	# Set time of day via sun rotation
	var time_angle := deg_to_rad((hour - 6) * 15.0)
	sun.rotation.x = -time_angle
	
	# Set weather
	var weather: String = world_data.get("weather", "clear")
	_apply_weather(weather)

func _apply_weather(weather: String) -> void:
	match weather:
		"clear":
			environment.environment.sky_mode = Environment.SKY_MODE_COLOR
		"rain":
			pass  # Add rain particles
		"fog":
			environment.environment.fog_enabled = true
			environment.environment.fog_density = 0.02
		_:
			pass
