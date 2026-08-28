extends CharacterBody3D
## Player character — a capybara with movement, stamina, HP, and interactions.

@export var walk_speed: float = 4.0
@export var sprint_speed: float = 7.0
@export var jump_velocity: float = 5.0
@export var gravity: float = 9.8
@export var rotation_speed: float = 10.0

# Stats
var hp: int = 100
var max_hp: int = 100
var stamina: float = 100.0
var max_stamina: float = 100.0
var stamina_drain_rate: float = 20.0
var stamina_regen_rate: float = 15.0

# State
var is_sprinting: bool = false
var is_in_train: bool = false
var is_near_interactable: bool = false
var nearest_interactable: Node3D = null
var current_tool: String = ""

# References
@onready var camera_pivot: Node3D = $CameraPivot
@onready var interaction_ray: RayCast3D = $InteractionRay
@onready var anim_player: AnimationPlayer = $AnimationPlayer
@onready var model: Node3D = $CapybaraModel

func _ready() -> void:
	GameManager.player = self
	_load_stats()
	EventBus.game_saved.connect(_on_game_saved)

func _physics_process(delta: float) -> void:
	if GameManager.state != GameManager.GameState.PLAYING:
		return
	if is_in_train:
		return

	# Gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Movement input
	var input_dir := Vector2.ZERO
	input_dir.x = Input.get_axis("move_left", "move_right")
	input_dir.y = Input.get_axis("move_forward", "move_backward")
	input_dir = input_dir.normalized()

	var direction := Vector3(input_dir.x, 0, input_dir.y).normalized()

	# Rotate model to face movement direction
	if direction.length() > 0.1:
		var target_angle := atan2(direction.x, direction.z)
		var current_angle := model.rotation.y
		model.rotation.y = lerp_angle(current_angle, target_angle, rotation_speed * delta)

	# Sprint logic
	is_sprinting = Input.is_action_pressed("sprint") and stamina > 0 and direction.length() > 0.1
	var speed := sprint_speed if is_sprinting else walk_speed

	# Apply horizontal movement
	if direction.length() > 0.1:
		velocity.x = direction.x * speed
		velocity.z = direction.z * speed
	else:
		velocity.x = move_toward(velocity.x, 0, speed * 10.0 * delta)
		velocity.z = move_toward(velocity.z, 0, speed * 10.0 * delta)

	# Jump
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity

	# Stamina
	if is_sprinting:
		stamina = maxf(0.0, stamina - stamina_drain_rate * delta)
	else:
		stamina = minf(max_stamina, stamina + stamina_regen_rate * delta)

	# Stamina was just depleted
	if stamina <= 0.0 and is_sprinting:
		is_sprinting = false

	EventBus.player_stamina_changed.emit(stamina, max_stamina)

	move_and_slide()

	# Interaction check
	_check_interaction()

	# Animation
	_update_animation(direction)

	# Enter train check
	if Input.is_action_just_pressed("interact") and is_near_interactable and nearest_interactable != null:
		_try_interact()

func _check_interaction() -> void:
	interaction_ray.force_raycast_update()
	if interaction_ray.is_colliding():
		var col := interaction_ray.get_collider()
		if col and col.has_method("get_interact_prompt"):
			if not is_near_interactable:
				is_near_interactable = true
				nearest_interactable = col
				EventBus.player_near_interactable.emit(col)
			return
	if is_near_interactable:
		is_near_interactable = false
		EventBus.player_left_interactable.emit(nearest_interactable)
		nearest_interactable = null

func _try_interact() -> void:
	if nearest_interactable and nearest_interactable.has_method("interact"):
		nearest_interactable.interact(self)

func _update_animation(direction: Vector3) -> void:
	if anim_player == null:
		return
	if not is_on_floor():
		anim_player.play("jump")
	elif direction.length() > 0.1:
		if is_sprinting:
			anim_player.play("run")
		else:
			anim_player.play("walk")
	else:
		anim_player.play("idle")

func take_damage(amount: int) -> void:
	hp = maxi(0, hp - amount)
	EventBus.player_hp_changed.emit(hp, max_hp)
	if hp <= 0:
		_die()

func heal(amount: int) -> void:
	hp = mini(max_hp, hp + amount)
	EventBus.player_hp_changed.emit(hp, max_hp)

func use_stamina(amount: float) -> bool:
	if stamina >= amount:
		stamina -= amount
		EventBus.player_stamina_changed.emit(stamina, max_stamina)
		return true
	return false

func _die() -> void:
	# Respawn at last station
	EventBus.player_died.emit()
	_respawn()

func _respawn() -> void:
	hp = max_hp
	stamina = max_stamina
	EventBus.player_hp_changed.emit(hp, max_hp)
	EventBus.player_stamina_changed.emit(stamina, max_stamina)
	# Teleport to last station
	var station_pos := Vector3(0, 1, 0)
	global_position = station_pos

func enter_train() -> void:
	is_in_train = true
	visible = false
	set_physics_process(false)
	EventBus.player_entered_train.emit()

func exit_train() -> void:
	is_in_train = false
	visible = true
	set_physics_process(true)
	EventBus.player_exited_train.emit()

func _load_stats() -> void:
	var data := SaveManager.get_player_data()
	if data.is_empty():
		return
	hp = data.get("hp", 100)
	max_hp = data.get("max_hp", 100)
	stamina = data.get("stamina", 100.0)
	max_stamina = data.get("max_stamina", 100.0)
	var pos: Dictionary = data.get("position", {})
	if not pos.is_empty():
		global_position = Vector3(pos.get("x", 0.0), pos.get("y", 1.0), pos.get("z", 0.0))

func _on_game_saved() -> void:
	SaveManager.update_player("hp", hp)
	SaveManager.update_player("max_hp", max_hp)
	SaveManager.update_player("stamina", stamina)
	SaveManager.update_player("max_stamina", max_stamina)
	SaveManager.update_player("position", {
		"x": global_position.x,
		"y": global_position.y,
		"z": global_position.z
	})
