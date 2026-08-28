extends Node3D
## Third-person camera with collision avoidance, zoom, and smooth follow.

@export var follow_speed: float = 8.0
@export var rotation_speed: float = 3.0
@export var min_zoom: float = 2.0
@export var max_zoom: float = 12.0
@export var zoom_speed: float = 2.0
@export var zoom_default: float = 5.0
@export var camera_offset: Vector3 = Vector3(0, 2.5, 0)
@export var mouse_sensitivity: float = 0.002
@export var min_pitch: float = -1.2
@export var max_pitch: float = 0.8

var zoom: float = 5.0
var yaw: float = 0.0
var pitch: float = 0.3
var target: Node3D = null
var camera: Camera3D

func _ready() -> void:
	camera = Camera3D.new()
	add_child(camera)
	camera.position = Vector3(0, 0, zoom)
	camera.look_at(Vector3.ZERO)
	zoom = zoom_default
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _unhandled_input(event: InputEvent) -> void:
	if GameManager.state != GameManager.GameState.PLAYING:
		return
	if event is InputEventMouseMotion:
		yaw -= event.relative.x * mouse_sensitivity
		pitch -= event.relative.y * mouse_sensitivity
		pitch = clampf(pitch, min_pitch, max_pitch)
	if event is InputEventMouseButton:
		match event.button_index:
			MOUSE_BUTTON_WHEEL_UP:
				zoom = maxf(min_zoom, zoom - zoom_speed * 0.1)
			MOUSE_BUTTON_WHEEL_DOWN:
				zoom = minf(max_zoom, zoom + zoom_speed * 0.1)

func _process(delta: float) -> void:
	if target == null:
		return

	# Desired position
	var offset := camera_offset
	var desired_pos := target.global_position + offset

	# Smooth follow
	global_position = global_position.lerp(desired_pos, follow_speed * delta)

	# Camera position relative to pivot (zoom + rotation)
	var cam_local := Vector3.ZERO
	cam_local.x = sin(yaw) * zoom * cos(pitch)
	cam_local.y = zoom * sin(pitch) + 1.5
	cam_local.z = cos(yaw) * zoom * cos(pitch)

	camera.global_position = global_position + cam_local
	camera.look_at(global_position + Vector3(0, 1.0, 0))

func set_target(new_target: Node3D) -> void:
	target = new_target

func set_follow_distance(dist: float) -> void:
	zoom = clampf(dist, min_zoom, max_zoom)
