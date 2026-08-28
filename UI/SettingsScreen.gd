extends Control
## Settings Screen — video, audio, controls, accessibility settings.

@onready var back_btn: Button = $Panel/MarginContainer/VBoxContainer/BackButton
@onready var tabs: TabContainer = $Panel/MarginContainer/VBoxContainer/Tabs

# Video
@onready var fullscreen_check: CheckButton = $Panel/MarginContainer/VBoxContainer/Tabs/Video/FullscreenCheck
@onready var vsync_check: CheckButton = $Panel/MarginContainer/VBoxContainer/Tabs/Video/VSyncCheck
@onready var quality_option: OptionButton = $Panel/MarginContainer/VBoxContainer/Tabs/Video/QualityOption
@onready var render_distance: HSlider = $Panel/MarginContainer/VBoxContainer/Tabs/Video/RenderDistance

# Audio
@onready var master_slider: HSlider = $Panel/MarginContainer/VBoxContainer/Tabs/Audio/MasterSlider
@onready var music_slider: HSlider = $Panel/MarginContainer/VBoxContainer/Tabs/Audio/MusicSlider
@onready var sfx_slider: HSlider = $Panel/MarginContainer/VBoxContainer/Tabs/Audio/SFXSlider
@onready var ambient_slider: HSlider = $Panel/MarginContainer/VBoxContainer/Tabs/Audio/AmbientSlider

# Controls
@onready var sensitivity_slider: HSlider = $Panel/MarginContainer/VBoxContainer/Tabs/Controls/SensitivitySlider

# Accessibility
@onready var ui_scale_slider: HSlider = $Panel/MarginContainer/VBoxContainer/Tabs/Accessibility/UIScaleSlider
@onready var camera_shake_check: CheckButton = $Panel/MarginContainer/VBoxContainer/Tabs/Accessibility/CameraShakeCheck

var settings: Dictionary = {}

func _ready() -> void:
	back_btn.pressed.connect(_on_back)
	fullscreen_check.toggled.connect(_on_fullscreen)
	vsync_check.toggled.connect(_on_vsync)
	quality_option.item_selected.connect(_on_quality)
	master_slider.value_changed.connect(_on_master_vol)
	music_slider.value_changed.connect(_on_music_vol)
	sfx_slider.value_changed.connect(_on_sfx_vol)
	sensitivity_slider.value_changed.connect(_on_sensitivity)
	load_settings()

func load_settings() -> void:
	var config := ConfigFile.new()
	if config.load("user://settings.cfg") == OK:
		fullscreen_check.button_pressed = config.get_value("video", "fullscreen", true)
		vsync_check.button_pressed = config.get_value("video", "vsync", true)
		quality_option.selected = config.get_value("video", "quality", 1)
		master_slider.value = config.get_value("audio", "master", 1.0)
		music_slider.value = config.get_value("audio", "music", 1.0)
		sfx_slider.value = config.get_value("audio", "sfx", 1.0)
		ambient_slider.value = config.get_value("audio", "ambient", 1.0)
		sensitivity_slider.value = config.get_value("controls", "sensitivity", 1.0)
		ui_scale_slider.value = config.get_value("accessibility", "ui_scale", 1.0)
		camera_shake_check.button_pressed = config.get_value("accessibility", "camera_shake", true)
	_apply_settings()

func save_settings() -> void:
	var config := ConfigFile.new()
	config.set_value("video", "fullscreen", fullscreen_check.button_pressed)
	config.set_value("video", "vsync", vsync_check.button_pressed)
	config.set_value("video", "quality", quality_option.selected)
	config.set_value("audio", "master", master_slider.value)
	config.set_value("audio", "music", music_slider.value)
	config.set_value("audio", "sfx", sfx_slider.value)
	config.set_value("audio", "ambient", ambient_slider.value)
	config.set_value("controls", "sensitivity", sensitivity_slider.value)
	config.set_value("accessibility", "ui_scale", ui_scale_slider.value)
	config.set_value("accessibility", "camera_shake", camera_shake_check.button_pressed)
	config.save("user://settings.cfg")

func _apply_settings() -> void:
	# Fullscreen
	if fullscreen_check.button_pressed:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	else:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	# VSync
	if vsync_check.button_pressed:
		DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_ENABLED)
	else:
		DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
	# Audio
	AudioManager.set_music_volume(music_slider.value)
	AudioManager.set_sfx_volume(sfx_slider.value)
	AudioManager.set_ambient_volume(ambient_slider.value)

func _on_fullscreen(_pressed: bool) -> void:
	_apply_settings()
	save_settings()
func _on_vsync(_pressed: bool) -> void:
	_apply_settings()
	save_settings()
func _on_quality(_index: int) -> void:
	save_settings()
func _on_master_vol(_val: float) -> void:
	save_settings()
func _on_music_vol(_val: float) -> void:
	_apply_settings()
	save_settings()
func _on_sfx_vol(_val: float) -> void:
	_apply_settings()
	save_settings()
func _on_sensitivity(_val: float) -> void:
	save_settings()

func _on_back() -> void:
	save_settings()
	get_tree().change_scene_to_file("res://Scenes/UI/MainMenu.tscn")
