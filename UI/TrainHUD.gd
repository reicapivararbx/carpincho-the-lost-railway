extends CanvasLayer
## Train HUD — displayed when driving the locomotive. Shows speed, fuel, integrity, destination.

@onready var speed_display: Label = $Panel/MarginContainer/VBoxContainer/SpeedDisplay
@onready var fuel_bar: ProgressBar = $Panel/MarginContainer/VBoxContainer/FuelBar
@onready var fuel_label: Label = $Panel/MarginContainer/VBoxContainer/FuelBar/FuelLabel
@onready var integrity_bar: ProgressBar = $Panel/MarginContainer/VBoxContainer/IntegrityBar
@onready var integrity_label: Label = $Panel/MarginContainer/VBoxContainer/IntegrityBar/IntegrityLabel
@onready var throttle_label: Label = $Panel/MarginContainer/VBoxContainer/ThrottleLabel
@onready var destination_label: Label = $Panel/MarginContainer/VBoxContainer/DestinationLabel
@onready var distance_label: Label = $Panel/MarginContainer/VBoxContainer/DistanceLabel
@onready var alert_label: Label = $Panel/MarginContainer/VBoxContainer/AlertLabel

func _ready() -> void:
	visible = false
	EventBus.train_entered_cabin.connect(_on_entered_cabin)
	EventBus.train_exited_cabin.connect(_on_exited_cabin)
	EventBus.train_speed_changed.connect(_on_speed_changed)
	EventBus.train_fuel_changed.connect(_on_fuel_changed)
	EventBus.train_integrity_changed.connect(_on_integrity_changed)

func _on_entered_cabin() -> void:
	visible = true

func _on_exited_cabin() -> void:
	visible = false

func _on_speed_changed(speed_kmh: float) -> void:
	speed_display.text = "%03d km/h" % int(speed_kmh)

func _on_fuel_changed(current: float, maximum: float) -> void:
	fuel_bar.max_value = maximum
	fuel_bar.value = current
	fuel_label.text = "%.0f%%" % (current / maximum * 100.0)
	if current / maximum < 0.2:
		alert_label.text = "⚠ LOW FUEL"
		alert_label.visible = true
	elif current / maximum < 0.5:
		alert_label.text = "Fuel warning"
		alert_label.visible = true
	else:
		alert_label.visible = false

func _on_integrity_changed(current: float, maximum: float) -> void:
	integrity_bar.max_value = maximum
	integrity_bar.value = current
	integrity_label.text = "%.0f%%" % (current / maximum * 100.0)
	if current / maximum < 0.2:
		alert_label.text = "⚠ CRITICAL DAMAGE"
		alert_label.visible = true

func _process(_delta: float) -> void:
	var train := GameManager.train
	if train == null:
		return
	throttle_label.text = "Throttle: %.0f%%" % (train.throttle * 100.0)
