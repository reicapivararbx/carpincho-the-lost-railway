extends CanvasLayer
## HUD — heads-up display showing player stats, train info, region, interactions.

@onready var hp_bar: ProgressBar = $MarginContainer/VBoxLeft/HPBar
@onready var hp_label: Label = $MarginContainer/VBoxLeft/HPBar/HPLabel
@onready var stamina_bar: ProgressBar = $MarginContainer/VBoxLeft/StaminaBar
@onready var level_label: Label = $MarginContainer/VBoxLeft/LevelLabel
@onready var coins_label: Label = $MarginContainer/VBoxLeft/CoinsLabel
@onready var region_label: Label = $MarginContainer/VBoxLeft/RegionLabel
@onready var interact_prompt: Label = $CenterContainer/InteractPrompt
@onready var notification_container: VBoxContainer = $MarginContainer/VBoxRight/NotificationContainer
@onready var speed_label: Label = $MarginContainer/VBoxBottom/SpeedLabel
@onready var fuel_label: Label = $MarginContainer/VBoxBottom/FuelLabel
@onready var integrity_label: Label = $MarginContainer/VBoxBottom/IntegrityLabel
@onready var xp_bar: ProgressBar = $MarginContainer/VBoxLeft/XPBar
@onready var xp_label: Label = $MarginContainer/VBoxLeft/XPBar/XPLabel

const NOTIFICATION_DURATION := 3.0
var notification_queue: Array = []

func _ready() -> void:
	EventBus.player_hp_changed.connect(_on_hp_changed)
	EventBus.player_stamina_changed.connect(_on_stamina_changed)
	EventBus.player_xp_changed.connect(_on_xp_changed)
	EventBus.player_coins_changed.connect(_on_coins_changed)
	EventBus.player_near_interactable.connect(_on_near_interactable)
	EventBus.player_left_interactable.connect(_on_left_interactable)
	EventBus.notification_requested.connect(_on_notification)
	EventBus.train_speed_changed.connect(_on_speed_changed)
	EventBus.train_fuel_changed.connect(_on_fuel_changed)
	EventBus.train_integrity_changed.connect(_on_integrity_changed)
	EventBus.region_discovered.connect(_on_region_discovered)
	interact_prompt.visible = false
	_refresh_all()

func _process(_delta: float) -> void:
	# Update region
	region_label.text = "📍 " + GameManager.current_region.capitalize()

func _refresh_all() -> void:
	var p := SaveManager.get_player_data()
	_on_hp_changed(p.get("hp", 100), p.get("max_hp", 100))
	_on_stamina_changed(p.get("stamina", 100.0), p.get("max_stamina", 100.0))
	_on_xp_changed(p.get("xp", 0), p.get("xp_to_next", 100))
	_on_coins_changed(p.get("coins", 0))
	level_label.text = "⭐ LVL %d" % p.get("level", 1)
	region_label.text = "📍 " + GameManager.current_region.capitalize()

func _on_hp_changed(current: int, maximum: int) -> void:
	hp_bar.max_value = maximum
	hp_bar.value = current
	hp_label.text = "%d/%d" % [current, maximum]

func _on_stamina_changed(current: float, maximum: float) -> void:
	stamina_bar.max_value = maximum
	stamina_bar.value = current

func _on_xp_changed(current: int, to_next: int) -> void:
	xp_bar.max_value = to_next
	xp_bar.value = current
	xp_label.text = "XP %d/%d" % [current, to_next]

func _on_coins_changed(amount: int) -> void:
	coins_label.text = "🪙 %d" % amount

func _on_near_interactable(_node: Node3D) -> void:
	interact_prompt.visible = true
	interact_prompt.text = "[E] Interact"

func _on_left_interactable(_node: Node3D) -> void:
	interact_prompt.visible = false

func _on_speed_changed(speed_kmh: float) -> void:
	speed_label.text = "%.0f km/h" % speed_kmh

func _on_fuel_changed(current: float, maximum: float) -> void:
	fuel_label.text = "⛽ %.0f%%" % (current / maximum * 100.0)

func _on_integrity_changed(current: float, maximum: float) -> void:
	var pct := current / maximum * 100.0
	integrity_label.text = "🔧 %.0f%%" % pct

func _on_region_discovered(region_id: String) -> void:
	_on_notification("Region discovered: %s!" % RegionDB.get(region_id).get("name", region_id), "discovery")

func _on_notification(text: String, type: String = "info") -> void:
	var label := Label.new()
	label.text = text
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.custom_minimum_size.x = 300
	match type:
		"success":
			label.add_theme_color_override("font_color", Color(0.3, 1.0, 0.3))
		"error":
			label.add_theme_color_override("font_color", Color(1.0, 0.3, 0.3))
		"warning":
			label.add_theme_color_override("font_color", Color(1.0, 0.8, 0.2))
		"quest":
			label.add_theme_color_override("font_color", Color(0.5, 0.8, 1.0))
		"discovery":
			label.add_theme_color_override("font_color", Color(0.9, 0.7, 1.0))
		_:
			label.add_theme_color_override("font_color", Color.WHITE)
	notification_container.add_child(label)
	notification_queue.append({"label": label, "timer": NOTIFICATION_DURATION})

func _process_notifications(delta: float) -> void:
	var to_remove: Array = []
	for entry in notification_queue:
		entry["timer"] -= delta
		if entry["timer"] <= 0:
			entry["label"].queue_free()
			to_remove.append(entry)
	for entry in to_remove:
		notification_queue.erase(entry)

func _process(delta: float) -> void:
	_process_notifications(delta)
