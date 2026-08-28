extends Node
## Central audio manager — handles music, SFX, and ambient sounds.

var music_player: AudioStreamPlayer
var ambient_player: AudioStreamPlayer
var sfx_pool: Array[AudioStreamPlayer] = []

var music_volume: float = 1.0
var sfx_volume: float = 1.0
var ambient_volume: float = 1.0

func _ready() -> void:
	music_player = AudioStreamPlayer.new()
	music_player.bus = "Music"
	add_child(music_player)
	
	ambient_player = AudioStreamPlayer.new()
	ambient_player.bus = "Ambient"
	add_child(ambient_player)
	
	# Create SFX pool (8 concurrent sounds)
	for i in 8:
		var player := AudioStreamPlayer.new()
		player.bus = "SFX"
		add_child(player)
		sfx_pool.append(player)

func play_music(stream: AudioStream, fade_time: float = 1.0) -> void:
	if music_player.stream == stream:
		return
	music_player.stream = stream
	music_player.play()

func stop_music(fade_time: float = 1.0) -> void:
	music_player.stop()

func play_sfx(stream: AudioStream, volume_db: float = 0.0) -> void:
	for player in sfx_pool:
		if not player.playing:
			player.stream = stream
			player.volume_db = volume_db
			player.play()
			return

func play_ambient(stream: AudioStream) -> void:
	ambient_player.stream = stream
	ambient_player.play()

func stop_ambient() -> void:
	ambient_player.stop()

func set_music_volume(vol: float) -> void:
	music_volume = clampf(vol, 0.0, 1.0)

func set_sfx_volume(vol: float) -> void:
	sfx_volume = clampf(vol, 0.0, 1.0)

func set_ambient_volume(vol: float) -> void:
	ambient_volume = clampf(vol, 0.0, 1.0)
