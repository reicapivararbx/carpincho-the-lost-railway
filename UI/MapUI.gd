extends Control
## Map UI — interactive world map with fog of war. Shows stations, rails, regions.

var is_open: bool = false
var scroll_offset: Vector2 = Vector2.ZERO
var zoom_level: float = 1.0

@onready var map_draw: Control = $Panel/MarginContainer/MapContainer/MapDraw
@onready var close_btn: Button = $Panel/MarginContainer/MapContainer/CloseButton
@onready var region_label: Label = $Panel/MarginContainer/MapContainer/RegionLabel
@onready var pos_label: Label = $Panel/MarginContainer/MapContainer/PosLabel

func _ready() -> void:
	visible = false
	close_btn.pressed.connect(_on_close)

func open() -> void:
	is_open = true
	visible = true
	GameManager.change_state(GameManager.GameState.MAP)
	_refresh()

func close() -> void:
	is_open = false
	visible = false
	GameManager.change_state(GameManager.GameState.PLAYING)

func _refresh() -> void:
	region_label.text = GameManager.current_region.capitalize()

func _on_close() -> void:
	close()

func _unhandled_input(event: InputEvent) -> void:
	if visible and event.is_action_pressed("pause"):
		_on_close()
		get_viewport().set_input_as_handled()
