extends Control
## Crafting UI — recipe-based crafting with station requirements and tool durability.

var is_open: bool = false
var selected_recipe: String = ""
var current_station_type: String = ""

@onready var title_label: Label = $Panel/MarginContainer/VBoxContainer/TitleLabel
@onready var recipe_list: ItemList = $Panel/MarginContainer/VBoxContainer/HSplitContainer/RecipeList
@onready var detail_name: Label = $Panel/MarginContainer/VBoxContainer/HSplitContainer/DetailPanel/DetailName
@onready var detail_desc: Label = $Panel/MarginContainer/VBoxContainer/HSplitContainer/DetailPanel/DetailDesc
@onready var detail_ingredients: Label = $Panel/MarginContainer/VBoxContainer/HSplitContainer/DetailPanel/IngredientsLabel
@onready var craft_btn: Button = $Panel/MarginContainer/VBoxContainer/HSplitContainer/DetailPanel/CraftButton
@onready var close_btn: Button = $Panel/MarginContainer/VBoxContainer/CloseButton

func _ready() -> void:
	visible = false
	craft_btn.pressed.connect(_on_craft_pressed)
	close_btn.pressed.connect(_on_close_pressed)
	recipe_list.item_selected.connect(_on_recipe_selected)

func _unhandled_input(event: InputEvent) -> void:
	if visible and event.is_action_pressed("pause"):
		_on_close_pressed()
		get_viewport().set_input_as_handled()

func open(station_type: String = "") -> void:
	current_station_type = station_type
	is_open = true
	visible = true
	GameManager.change_state(GameManager.GameState.CRAFTING)
	_refresh()

func close() -> void:
	is_open = false
	visible = false
	GameManager.change_state(GameManager.GameState.PLAYING)

func _refresh() -> void:
	recipe_list.clear()
	var recipes: Dictionary = RecipeDB.get_all()
	for recipe_id in recipes:
		var recipe: Dictionary = recipes[recipe_id]
		# Filter by station compatibility
		var req_station: String = recipe.get("required_station", "")
		if req_station != "" and req_station != current_station_type:
			# Check if player has the matching wagon
			var has_station := false
			if req_station == "workshop":
				# Check for workshop wagon
				has_station = _has_wagon_type("workshop")
			if not has_station:
				continue

		var result_item: Dictionary = ItemDB.lookup(recipe.get("output_id", ""))
		var result_name: String = result_item.get("name", recipe_id)
		var qty: int = recipe.get("output_qty", 1)
		var idx := recipe_list.add_item("%s x%d" % [result_name, qty])
		recipe_list.set_item_metadata(idx, {"id": recipe_id})
	recipe_list.sort_items_by_text()

func _on_recipe_selected(index: int) -> void:
	var meta: Dictionary = recipe_list.get_item_metadata(index)
	selected_recipe = meta.get("id", "")
	var recipe: Dictionary = RecipeDB.get(selected_recipe)
	var result_item: Dictionary = ItemDB.lookup(recipe.get("output_id", ""))

	detail_name.text = result_item.get("name", selected_recipe)
	detail_desc.text = result_item.get("description", "")

	var ing_text := "Ingredients:\n"
	var inv: Array = SaveManager.get_player_data().get("inventory", [])
	for ing in recipe.get("ingredients", []):
		var item_data: Dictionary = ItemDB.lookup(ing["id"])
		var have := _count_in_inv(inv, ing["id"])
		var color := "✓" if have >= ing["qty"] else "✗"
		ing_text += "%s %s x%d (have %d)\n" % [color, item_data.get("name", ing["id"]), ing["qty"], have]
	detail_ingredients.text = ing_text

	var player_level: int = SaveManager.get_player_data().get("level", 1)
	var result := RecipeDB.can_craft(selected_recipe, player_level, inv)
	craft_btn.disabled = not result.get("can_craft", false)
	craft_btn.text = "Craft" if result.get("can_craft", false) else result.get("reason", "Cannot craft")

func _on_craft_pressed() -> void:
	if selected_recipe == "":
		return
	var recipe: Dictionary = RecipeDB.get(selected_recipe)
	var inv: Array = SaveManager.get_player_data().get("inventory", [])

	# Remove ingredients
	for ing in recipe.get("ingredients", []):
		SaveManager.remove_from_inventory(ing["id"], ing["qty"])

	# Add result
	var output_id: String = recipe.get("output_id", "")
	var output_qty: int = recipe.get("output_qty", 1)
	SaveManager.add_to_inventory(output_id, output_qty)

	# Stats
	var stats: Dictionary = SaveManager.save_data.get("stats", {})
	stats["items_crafted"] = stats.get("items_crafted", 0) + 1
	SaveManager.save_data["stats"] = stats

	var result_item: Dictionary = ItemDB.lookup(output_id)
	EventBus.crafting_completed.emit(selected_recipe)
	EventBus.notification_requested.emit("Crafted %s x%d!" % [result_item.get("name", ""), output_qty], "success")
	_refresh()

func _on_close_pressed() -> void:
	close()

func _has_wagon_type(wagon_type: String) -> bool:
	# Check if player has the wagon attached to train
	var train := GameManager.train
	if train == null:
		return false
	for wagon in train.wagons:
		if wagon.get("wagon_type", "") == wagon_type:
			return true
	return false

func _count_in_inv(inv: Array, item_id: String) -> int:
	for entry in inv:
		if entry.get("id") == item_id:
			return entry.get("quantity", 0)
	return 0
