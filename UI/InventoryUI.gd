extends Control
## Inventory UI — grid-based inventory with item management, equip, capacity.

var is_open: bool = false
var selected_slot: int = -1

@onready var grid: GridContainer = $Panel/MarginContainer/VBoxContainer/ScrollContainer/GridContainer
@onready var capacity_label: Label = $Panel/MarginContainer/VBoxContainer/CapacityLabel
@onready var item_name_label: Label = $Panel/MarginContainer/VBoxContainer/InfoPanel/ItemNameLabel
@onready var item_desc_label: Label = $Panel/MarginContainer/VBoxContainer/InfoPanel/ItemDescLabel
@onready var use_btn: Button = $Panel/MarginContainer/VBoxContainer/InfoPanel/UseButton
@onready var drop_btn: Button = $Panel/MarginContainer/VBoxContainer/InfoPanel/DropButton
@onready var close_btn: Button = $Panel/MarginContainer/VBoxContainer/CloseButton

const MAX_SLOTS := 42
var slot_buttons: Array[Button] = []

func _ready() -> void:
	visible = false
	use_btn.pressed.connect(_on_use_pressed)
	drop_btn.pressed.connect(_on_drop_pressed)
	close_btn.pressed.connect(_on_close_pressed)
	EventBus.player_inventory_opened.connect(open)
	EventBus.player_inventory_closed.connect(close)
	EventBus.inventory_changed.connect(_refresh)
	_create_grid()

func _create_grid() -> void:
	grid.columns = 7
	for i in MAX_SLOTS:
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(64, 64)
		btn.text = ""
		btn.toggle_mode = true
		btn.button_group = ButtonGroup.new()
		var idx := i
		btn.pressed.connect(func(): _on_slot_clicked(idx))
		grid.add_child(btn)
		slot_buttons.append(btn)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("inventory"):
		if is_open:
			close()
		else:
			open()
		get_viewport().set_input_as_handled()

func open() -> void:
	is_open = true
	visible = true
	GameManager.change_state(GameManager.GameState.INVENTORY)
	_refresh()

func close() -> void:
	is_open = false
	visible = false
	GameManager.change_state(GameManager.GameState.PLAYING)

func _refresh() -> void:
	var inv: Array = SaveManager.get_player_data().get("inventory", [])
	var current_weight := 0.0
	var max_weight := 100.0

	# Reset all slots
	for btn in slot_buttons:
		btn.text = ""
		btn.button_pressed = false
		btn.tooltip_text = ""

	# Fill with inventory items
	for i in mini(inv.size(), MAX_SLOTS):
		var entry: Dictionary = inv[i]
		var item_data: Dictionary = ItemDB.lookup(entry.get("id", ""))
		var qty: int = entry.get("quantity", 0)
		var weight: float = item_data.get("weight", 0.0) * qty
		current_weight += weight

		var name_short: String = item_data.get("name", entry.get("id", "?"))
		if name_short.length() > 8:
			name_short = name_short.substr(0, 7) + "."
		slot_buttons[i].text = "%s\n%d" % [name_short, qty]
		slot_buttons[i].tooltip_text = "%s (x%d) - %s" % [item_data.get("name", ""), qty, item_data.get("description", "")]
		slot_buttons[i].add_theme_font_size_override("font_size", 10)

	capacity_label.text = "%.1f / %.0f KG" % [current_weight, max_weight]
	_update_info_panel()

func _on_slot_clicked(index: int) -> void:
	selected_slot = index
	_update_info_panel()

func _update_info_panel() -> void:
	var inv: Array = SaveManager.get_player_data().get("inventory", [])
	if selected_slot < 0 or selected_slot >= inv.size():
		item_name_label.text = "No item selected"
		item_desc_label.text = ""
		use_btn.visible = false
		drop_btn.visible = false
		return

	var entry: Dictionary = inv[selected_slot]
	var item_data: Dictionary = ItemDB.lookup(entry.get("id", ""))
	item_name_label.text = item_data.get("name", entry.get("id", ""))
	item_desc_label.text = item_data.get("description", "")
	use_btn.visible = item_data.get("category", "") in ["consumable", "tool", "fuel"]
	drop_btn.visible = true

func _on_use_pressed() -> void:
	var inv: Array = SaveManager.get_player_data().get("inventory", [])
	if selected_slot < 0 or selected_slot >= inv.size():
		return
	var entry: Dictionary = inv[selected_slot]
	var item_id: String = entry.get("id", "")
	var item_data: Dictionary = ItemDB.lookup(item_id)

	match item_data.get("category", ""):
		"consumable":
			if item_data.has("stamina_restore") and item_data["stamina_restore"] > 0:
				var player := GameManager.player
				if player:
					player.stamina = minf(player.max_stamina, player.stamina + item_data["stamina_restore"])
			if item_data.has("hp_restore") and item_data["hp_restore"] > 0:
				var player := GameManager.player
				if player:
					player.heal(item_data["hp_restore"])
			if item_data.has("fuel_amount") and item_data["fuel_amount"] > 0:
				var train := GameManager.train
				if train:
					train.refuel(item_data["fuel_amount"])
			SaveManager.remove_from_inventory(item_id, 1)
			EventBus.item_used.emit(item_id)
			EventBus.notification_requested.emit("Used %s" % item_data.get("name", ""), "success")
		"tool":
			# Equip as current tool
			SaveManager.update_player("equipment", {"tool": item_id})
			EventBus.notification_requested.emit("Equipped %s" % item_data.get("name", ""), "info")
		"fuel":
			var train := GameManager.train
			if train:
				train.refuel(20.0)
				SaveManager.remove_from_inventory(item_id, 1)
				EventBus.notification_requested.emit("Refueled train!", "success")
	_refresh()

func _on_drop_pressed() -> void:
	var inv: Array = SaveManager.get_player_data().get("inventory", [])
	if selected_slot < 0 or selected_slot >= inv.size():
		return
	var entry: Dictionary = inv[selected_slot]
	var item_id: String = entry.get("id", "")
	SaveManager.remove_from_inventory(item_id, 1)
	EventBus.notification_requested.emit("Dropped item.", "info")
	_refresh()

func _on_close_pressed() -> void:
	close()
