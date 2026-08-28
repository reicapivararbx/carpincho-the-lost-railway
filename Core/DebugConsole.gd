extends Node
## Debug console — developer tools. Only active in debug builds.

var is_visible: bool = false
var debug_panel: Control = null

func _ready() -> void:
	if not OS.is_debug_build():
		visible = false
		set_process(false)
		return

func _input(event: InputEvent) -> void:
	if not OS.is_debug_build():
		return
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_F1:
				_toggle_fps()
			KEY_F2:
				_show_position()
			KEY_F3:
				_show_train_state()
			KEY_F5:
				_add_resources()
			KEY_F6:
				_add_coins()
			KEY_F8:
				_toggle_weather()
			KEY_F9:
				_cycle_time()

func _toggle_fps() -> void:
	EventBus.debug_toggled.emit(not is_visible)
	is_visible = not is_visible

func _show_position() -> void:
	var player := GameManager.player
	if player:
		print("[DEBUG] Position: ", player.global_position)

func _show_train_state() -> void:
	var train := GameManager.train
	if train:
		print("[DEBUG] Train speed: ", train.current_speed, " km/h")
		print("[DEBUG] Train fuel: ", train.fuel, "/", train.max_fuel)
		print("[DEBUG] Train integrity: ", train.integrity, "/", train.max_integrity)

func _add_resources() -> void:
	SaveManager.add_to_inventory("wood", 10)
	SaveManager.add_to_inventory("stone", 10)
	SaveManager.add_to_inventory("iron", 5)
	SaveManager.add_to_inventory("scrap", 5)
	print("[DEBUG] Added resources")

func _add_coins() -> void:
	SaveManager.add_coins(500)
	print("[DEBUG] Added 500 CapyCoins")

func _toggle_weather() -> void:
	var weathers := ["clear", "rain", "storm", "fog", "snow"]
	var current: String = SaveManager.get_world_data().get("weather", "clear")
	var idx := weathers.find(current)
	idx = (idx + 1) % weathers.size()
	SaveManager.update_world("weather", weathers[idx])
	EventBus.weather_changed.emit(weathers[idx])
	print("[DEBUG] Weather: ", weathers[idx])

func _cycle_time() -> void:
	var world := SaveManager.get_world_data()
	var hour: int = world.get("hour", 8)
	hour = (hour + 3) % 24
	SaveManager.update_world("hour", hour)
	EventBus.time_changed.emit(hour, 0)
	print("[DEBUG] Hour: ", hour)
