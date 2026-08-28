extends Node3D
## Train — the heart of the game. Handles locomotive physics, fuel, wagons, driving.

@export var max_speed_kmh: float = 60.0
@export var acceleration: float = 8.0
@export var brake_power: float = 15.0
@export var max_fuel: float = 100.0
@export var fuel_consumption_rate: float = 0.5
@export var max_integrity: float = 100.0
@export var train_weight: float = 5000.0

# Current state
var current_speed: float = 0.0  # km/h
var fuel: float = 80.0
var integrity: float = 100.0
var throttle: float = 0.0  # 0.0 to 1.0
var braking: bool = false
var engine_on: bool = false
var is_driving: bool = false

# Cargo
var current_cargo_kg: float = 0.0
var max_cargo_kg: float = 200.0
var wagons: Array[Node3D] = []

# Physics
var velocity_vector: Vector3 = Vector3.ZERO
var forward_direction: Vector3 = Vector3.FORWARD

# Upgrades
var upgrades: Dictionary = {}

# References
@onready var locomotive_body: Node3D = $LocomotiveBody
@onready var cabin_area: Area3D = $CabinArea
@onready var wagon_attach_point: Marker3D = $WagonAttachPoint
@onready var smoke_particles: GPUParticles3D = $LocomotiveBody/SmokeParticles
@onready var headlight: SpotLight3D = $LocomotiveBody/Headlight
@onready var horn_audio: AudioStreamPlayer3D = $HornAudio

func _ready() -> void:
	GameManager.train = self
	_load_train_state()
	EventBus.game_saved.connect(_on_game_saved)

func _physics_process(delta: float) -> void:
	if not engine_on:
		return

	# Fuel consumption
	if current_speed > 0.1:
		var consumption := fuel_consumption_rate * (throttle + 0.1) * delta
		fuel = maxf(0.0, fuel - consumption)
		EventBus.train_fuel_changed.emit(fuel, max_fuel)
		if fuel <= 0.0:
			_engine_stall()

	# Speed calculation
	var weight_factor := train_weight / 5000.0
	var effective_accel := acceleration / weight_factor
	var effective_brake := brake_power / weight_factor

	if braking:
		current_speed = maxf(0.0, current_speed - effective_brake * delta * 10.0)
	elif throttle > 0.0:
		current_speed = minf(max_speed_kmh, current_speed + effective_accel * throttle * delta * 10.0)
	else:
		# Natural deceleration
		current_speed = maxf(0.0, current_speed - 2.0 * delta)

	# Convert km/h to m/s for movement
	var speed_ms := current_speed / 3.6
	forward_direction = -locomotive_body.global_transform.basis.z
	velocity_vector = forward_direction * speed_ms

	# Apply movement
	locomotive_body.global_position += velocity_vector * delta

	# Smoke intensity based on throttle
	if smoke_particles:
		smoke_particles.amount_ratio = lerpf(0.1, 1.0, throttle)

	# Update wagons
	_update_wagons(delta)

	# Integrity decay from speed
	if current_speed > 40.0:
		integrity = maxf(0.0, integrity - 0.01 * delta)

	EventBus.train_speed_changed.emit(current_speed)

func _unhandled_input(event: InputEvent) -> void:
	if GameManager.state != GameManager.GameState.PLAYING:
		return
	if not is_driving:
		return

	# Throttle
	if event.is_action_pressed("train_throttle_up"):
		throttle = minf(1.0, throttle + 0.25)
	if event.is_action_pressed("train_throttle_down"):
		throttle = maxf(0.0, throttle - 0.25)

	# Brake
	braking = event.is_action_pressed("train_brake")

	# Horn
	if event.is_action_pressed("horn"):
		_honk_horn()

	# Exit train
	if event.is_action_pressed("interact"):
		exit_cabin()

func start_engine() -> void:
	if fuel > 0.0 and integrity > 10.0:
		engine_on = true
		EventBus.train_started.emit()

func stop_engine() -> void:
	engine_on = false
	throttle = 0.0
	braking = false
	EventBus.train_stopped.emit()

func enter_cabin() -> void:
	is_driving = true
	EventBus.train_entered_cabin.emit()

func exit_cabin() -> void:
	is_driving = false
	EventBus.train_exited_cabin.emit()

func refuel(amount: float) -> void:
	fuel = minf(max_fuel, fuel + amount)
	EventBus.train_fuel_changed.emit(fuel, max_fuel)

func take_damage(amount: float) -> void:
	integrity = maxf(0.0, integrity - amount)
	EventBus.train_damaged.emit(amount, "structural")
	EventBus.train_integrity_changed.emit(integrity, max_integrity)
	if integrity <= 0.0:
		_engine_stall()

func repair(amount: float) -> void:
	integrity = minf(max_integrity, integrity + amount)
	EventBus.train_integrity_changed.emit(integrity, max_integrity)

func add_wagon(wagon: Node3D) -> void:
	wagons.append(wagon)
	var attach_pos := wagon_attach_point.global_position
	if wagons.size() > 1:
		attach_pos = wagons[wagons.size() - 2].global_position + Vector3(0, 0, 4.0)
	wagon.global_position = attach_pos
	EventBus.train_wagon_added.emit(wagon)

func remove_wagon(index: int) -> void:
	if index >= 0 and index < wagons.size():
		var wagon := wagons[index]
		wagons.remove_at(index)
		EventBus.train_wagon_removed.emit(wagon)

func _update_wagons(_delta: float) -> void:
	# Simple chain following
	var prev_pos := locomotive_body.global_position
	for wagon in wagons:
		var target_pos := prev_pos + Vector3(0, 0, 4.0)
		wagon.global_position = wagon.global_position.lerp(target_pos, 0.1)
		prev_pos = wagon.global_position

func _honk_horn() -> void:
	EventBus.train_horn.emit()
	if horn_audio:
		horn_audio.play()

func _engine_stall() -> void:
	engine_on = false
	throttle = 0.0
	current_speed = 0.0
	EventBus.train_stopped.emit()

func get_diagnostics() -> Dictionary:
	return {
		"speed": current_speed,
		"fuel": fuel,
		"max_fuel": max_fuel,
		"integrity": integrity,
		"max_integrity": max_integrity,
		"cargo_kg": current_cargo_kg,
		"max_cargo_kg": max_cargo_kg,
		"engine_on": engine_on,
		"throttle": throttle,
		"wagon_count": wagons.size(),
	}

func _load_train_state() -> void:
	var data := SaveManager.get_train_data()
	if data.is_empty():
		return
	max_fuel = data.get("max_fuel", 100.0)
	fuel = data.get("fuel", 80.0)
	max_integrity = data.get("max_integrity", 100.0)
	integrity = data.get("integrity", 100.0)
	var pos: Dictionary = data.get("position", {})
	if not pos.is_empty():
		locomotive_body.global_position = Vector3(pos.get("x", 0.0), pos.get("y", 0.5), pos.get("z", 0.0))
	upgrades = data.get("upgrades", {})

func _on_game_saved() -> void:
	SaveManager.update_train("fuel", fuel)
	SaveManager.update_train("integrity", integrity)
	SaveManager.update_train("max_fuel", max_fuel)
	SaveManager.update_train("max_integrity", max_integrity)
	SaveManager.update_train("speed_kmh", current_speed)
	SaveManager.update_train("position", {
		"x": locomotive_body.global_position.x,
		"y": locomotive_body.global_position.y,
		"z": locomotive_body.global_position.z
	})
	SaveManager.update_train("upgrades", upgrades)
