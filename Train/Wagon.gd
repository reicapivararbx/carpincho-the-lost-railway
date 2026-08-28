extends Node3D
## Wagon — attached to the locomotive. Provides cargo, workshop, or other functions.

@export var wagon_type: String = "cargo"  # cargo, workshop, dormitory, greenhouse, defensive
@export var wagon_id: String = "wagon_cargo_basic"
@export var max_cargo_kg: float = 50.0
@export var current_cargo_kg: float = 0.0
@export var integrity: float = 100.0
@export var max_integrity: float = 100.0

var wagon_data: Dictionary = {}

func _ready() -> void:
	wagon_data = TrainDB.lookup(wagon_id)
	if not wagon_data.is_empty():
		wagon_type = wagon_data.get("wagon_type", wagon_type)
		max_cargo_kg = wagon_data.get("max_cargo_kg", max_cargo_kg)
		max_integrity = wagon_data.get("max_integrity", max_integrity)
		integrity = max_integrity

func get_interact_prompt() -> String:
	match wagon_type:
		"cargo":
			return "[E] Open Cargo (%.0f/%.0f kg)" % [current_cargo_kg, max_cargo_kg]
		"workshop":
			return "[E] Open Workshop"
		"dormitory":
			return "[E] Rest & Save"
		"greenhouse":
			return "[E] Greenhouse"
		_:
			return "[E] " + wagon_type.capitalize()

func interact(interactor: Node3D) -> void:
	match wagon_type:
		"cargo":
			EventBus.notification_requested.emit("Cargo: %.0f / %.0f kg" % [current_cargo_kg, max_cargo_kg], "info")
		"workshop":
			# Open crafting UI with workshop station type
			var craft_ui := get_tree().get_first_node_in_group("crafting_ui")
			if craft_ui:
				craft_ui.open("workshop")
		"dormitory":
			# Rest — heal and save
			var player := GameManager.player
			if player:
				player.heal(player.max_hp)
				player.stamina = player.max_stamina
			SaveManager.save_game()
			EventBus.notification_requested.emit("Rested and saved!", "success")
		"greenhouse":
			EventBus.notification_requested.emit("Greenhouse under construction.", "info")

func add_cargo(weight: float) -> bool:
	if current_cargo_kg + weight <= max_cargo_kg:
		current_cargo_kg += weight
		return true
	return false

func remove_cargo(weight: float) -> bool:
	if current_cargo_kg >= weight:
		current_cargo_kg -= weight
		return true
	return false

func take_damage(amount: float) -> void:
	integrity = maxf(0.0, integrity - amount)

func repair(amount: float) -> void:
	integrity = minf(max_integrity, integrity + amount)
