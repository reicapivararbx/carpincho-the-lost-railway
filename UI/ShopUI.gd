extends Control
## Shop UI — buy/sell items from NPCs. Data-driven from NPCDB.

var current_shop_id: String = ""
var shop_npc_data: Dictionary = {}
var is_buy_mode: bool = true

@onready var title_label: Label = $Panel/MarginContainer/VBoxContainer/TitleLabel
@onready var coins_label: Label = $Panel/MarginContainer/VBoxContainer/CoinsLabel
@onready var item_list: ItemList = $Panel/MarginContainer/VBoxContainer/ItemList
@onready var buy_btn: Button = $Panel/MarginContainer/VBoxContainer/HBoxContainer/BuyButton
@onready var sell_btn: Button = $Panel/MarginContainer/VBoxContainer/HBoxContainer/SellButton
@onready var quantity_label: Label = $Panel/MarginContainer/VBoxContainer/QuantityLabel
@onready var confirm_btn: Button = $Panel/MarginContainer/VBoxContainer/ConfirmButton
@onready var close_btn: Button = $Panel/MarginContainer/VBoxContainer/CloseButton

func _ready() -> void:
	visible = false
	EventBus.shop_opened.connect(_on_shop_opened)
	EventBus.shop_closed.connect(_on_shop_closed)
	buy_btn.pressed.connect(_on_buy_pressed)
	sell_btn.pressed.connect(_on_sell_pressed)
	confirm_btn.pressed.connect(_on_confirm_pressed)
	close_btn.pressed.connect(_on_close_pressed)
	item_list.item_selected.connect(_on_item_selected)

func _on_shop_opened(shop_id: String) -> void:
	current_shop_id = shop_id
	# Find NPC data for this shop
	for npc_id in NPCDB.get_all():
		var npc: Dictionary = NPCDB.lookup(npc_id)
		if npc.get("location", "") == shop_id or npc_id == shop_id:
			shop_npc_data = npc
			break
	if shop_npc_data.is_empty():
		# Try direct lookup
		shop_npc_data = NPCDB.lookup(shop_id)

	is_buy_mode = true
	_refresh_ui()

func _on_shop_closed() -> void:
	visible = false

func _refresh_ui() -> void:
	visible = true
	title_label.text = shop_npc_data.get("name", "Shop")
	var coins: int = SaveManager.get_player_data().get("coins", 0)
	coins_label.text = "CapyCoins: %d" % coins
	_load_items()

func _load_items() -> void:
	item_list.clear()
	if is_buy_mode:
		var shop_items: Array = shop_npc_data.get("shop_items", [])
		var prices: Dictionary = shop_npc_data.get("shop_prices", {})
		for item_id in shop_items:
			var item_data: Dictionary = ItemDB.lookup(item_id)
			if item_data.is_empty():
				continue
			var price: int = prices.get(item_id, item_data.get("value", 0))
			var idx := item_list.add_item("%s - %d coins" % [item_data.get("name", item_id), price])
			item_list.set_item_metadata(idx, {"id": item_id, "price": price, "mode": "buy"})
	else:
		var inv: Array = SaveManager.get_player_data().get("inventory", [])
		for entry in inv:
			var item_data: Dictionary = ItemDB.lookup(entry.get("id", ""))
			if item_data.is_empty():
				continue
			var sell_price: int = maxi(1, item_data.get("value", 1) / 2)
			var idx := item_list.add_item("%s x%d - %d coins" % [item_data.get("name", entry["id"]), entry.get("quantity", 0), sell_price])
			item_list.set_item_metadata(idx, {"id": entry["id"], "price": sell_price, "mode": "sell", "max_qty": entry.get("quantity", 0)})

func _on_item_selected(index: int) -> void:
	pass  # Selection handled by confirm

func _on_buy_pressed() -> void:
	is_buy_mode = true
	_refresh_ui()

func _on_sell_pressed() -> void:
	is_buy_mode = false
	_refresh_ui()

func _on_confirm_pressed() -> void:
	var selected := item_list.get_selected_items()
	if selected.is_empty():
		return
	var meta: Dictionary = item_list.get_item_metadata(selected[0])
	var item_id: String = meta.get("id", "")
	var price: int = meta.get("price", 0)
	var mode: String = meta.get("mode", "buy")

	if mode == "buy":
		if SaveManager.remove_coins(price):
			SaveManager.add_to_inventory(item_id, 1)
			EventBus.item_bought.emit(item_id, price)
			EventBus.notification_requested.emit("Bought %s!" % ItemDB.lookup(item_id).get("name", item_id), "success")
		else:
			EventBus.notification_requested.emit("Not enough CapyCoins!", "error")
	else:
		SaveManager.remove_from_inventory(item_id, 1)
		SaveManager.add_coins(price)
		EventBus.item_sold.emit(item_id, price)
		EventBus.notification_requested.emit("Sold for %d coins!" % price, "success")

	_refresh_ui()

func _on_close_pressed() -> void:
	visible = false
	GameManager.change_state(GameManager.GameState.PLAYING)
	EventBus.shop_closed.emit()

func _unhandled_input(event: InputEvent) -> void:
	if visible and event.is_action_pressed("pause"):
		_on_close_pressed()
		get_viewport().set_input_as_handled()
