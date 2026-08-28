extends Node3D
## Rail segment — a single piece of track. Part of the modular rail system.

enum RailType { STRAIGHT, CURVE_LEFT, CURVE_RIGHT, UPHILL, DOWNHILL, BRIDGE, TUNNEL, BROKEN, STATION }

@export var rail_type: RailType = RailType.STRAIGHT
@export var segment_length: float = 4.0
@export var is_broken: bool = false
@export var is_abandoned: bool = false
@export var speed_limit: float = 60.0

var start_point: Vector3
var end_point: Vector3
var connected_next: Node3D = null  # next rail in direction
var connected_prev: Node3D = null  # previous rail
var is_visited: bool = false

@onready var mesh_instance: MeshInstance3D = $MeshInstance3D
@onready var collision: StaticBody3D = $StaticBody3D

func _ready() -> void:
	_calculate_points()

func _calculate_points() -> void:
	start_point = global_position
	match rail_type:
		RailType.STRAIGHT:
			end_point = global_position + global_transform.basis.z * segment_length
		RailType.CURVE_LEFT:
			var angle := deg_to_rad(15.0)
			var rotated := global_transform.basis.z.rotated(Vector3.UP, angle)
			end_point = global_position + rotated * segment_length
		RailType.CURVE_RIGHT:
			var angle := deg_to_rad(-15.0)
			var rotated := global_transform.basis.z.rotated(Vector3.UP, angle)
			end_point = global_position + rotated * segment_length
		RailType.UPHILL:
			end_point = global_position + global_transform.basis.z * segment_length + Vector3(0, 1.5, 0)
		RailType.DOWNHILL:
			end_point = global_position + global_transform.basis.z * segment_length + Vector3(0, -1.5, 0)
		_:
			end_point = global_position + global_transform.basis.z * segment_length

func connect_next(rail: Node3D) -> void:
	connected_next = rail
	rail.connected_prev = self

func repair() -> void:
	is_broken = false
	EventBus.rail_reached_end_of_line.emit()

func get_speed_modifier() -> float:
	match rail_type:
		RailType.UPHILL:
			return 0.6
		RailType.DOWNHILL:
			return 1.2
		RailType.BROKEN:
			return 0.0
		RailType.CURVE_LEFT, RailType.CURVE_RIGHT:
			return 0.8
		_:
			return 1.0

func get_interact_prompt() -> String:
	if is_broken:
		return "[E] Repair Track"
	return ""

func interact(interactor: Node3D) -> void:
	if is_broken:
		# Check if player has materials
		var inv := SaveManager.get_player_data().get("inventory", [])
		var has_scrap := false
		var has_iron := false
		for item in inv:
			if item.get("id") == "scrap" and item.get("quantity", 0) >= 3:
				has_scrap = true
			if item.get("id") == "iron" and item.get("quantity", 0) >= 2:
				has_iron = true
		if has_scrap and has_iron:
			SaveManager.remove_from_inventory("scrap", 3)
			SaveManager.remove_from_inventory("iron", 2)
			repair()
			EventBus.notification_requested.emit("Track repaired!", "success")
		else:
			EventBus.notification_requested.emit("Need 3 scrap + 2 iron to repair.", "warning")
