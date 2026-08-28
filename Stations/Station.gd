extends Node3D
## Station — interactive hub with shop, garage, NPCs, missions, rest.

@export var station_id: String = "plains_station"
@export var station_name: String = "Plains Station"

var npc_scenes: Dictionary = {}

func _ready() -> void:
	_spawn_npcs()
	EventBus.player_near_interactable.connect(_on_player_near)

func _spawn_npcs() -> void:
	var npcs_in_station: Array = NPCDB.get_by_location(station_id)
	for npc_data in npcs_in_station:
		var npc_node := _create_npc_visual(npc_data)
		add_child(npc_node)

func _create_npc_visual(data: Dictionary) -> Node3D:
	var npc := CharacterBody3D.new()
	npc.name = data["id"]
	npc.collision_layer = 16  # NPC layer
	
	# Body mesh
	var body := MeshInstance3D.new()
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.4
	capsule.height = 1.2
	body.mesh = capsule
	body.position.y = 0.6
	npc.add_child(body)
	
	# Name label
	var label := Label3D.new()
	label.text = data["name"]
	label.font_size = 24
	label.position.y = 1.5
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	npc.add_child(label)
	
	# Interaction area
	var area := Area3D.new()
	area.collision_layer = 128  # interaction layer
	area.collision_mask = 1  # player
	var area_shape := CollisionShape3D.new()
	var sphere := SphereShape3D.new()
	sphere.radius = 2.0
	area_shape.shape = sphere
	area.add_child(area_shape)
	npc.add_child(area)
	
	# Position from data
	var pos: Dictionary = data.get("position", {})
	npc.position = Vector3(pos.get("x", 0.0), 0.0, pos.get("z", 0.0))
	
	# Attach NPC script
	var script := load("res://NPC/NPC.gd") if ResourceLoader.exists("res://NPC/NPC.gd") else null
	if script:
		npc.set_script(script)
		npc.npc_id = data["id"]
		npc.npc_data = data
	
	return npc

func _on_player_near(node: Node3D) -> void:
	pass  # UI hints handled by HUD

# === Station Services ===

func open_shop(shop_id: String) -> void:
	GameManager.change_state(GameManager.GameState.SHOP)
	EventBus.shop_opened.emit(shop_id)

func open_garage() -> void:
	# Show train upgrade/repair UI
	pass

func open_missions() -> void:
	# Show available quests from NPCs at this station
	pass

func rest() -> void:
	# Heal player, advance time
	var player := GameManager.player
	if player:
		player.heal(50)
		player.stamina = player.max_stamina
	# Advance time by 8 hours
	var world := SaveManager.get_world_data()
	var hour: int = world.get("hour", 8)
	hour = (hour + 8) % 24
	SaveManager.update_world("hour", hour)
	EventBus.time_changed.emit(hour, 0)
	EventBus.notification_requested.emit("Rested! HP and stamina restored.", "success")

func get_interact_prompt() -> String:
	return "[E] " + station_name

func interact(interactor: Node3D) -> void:
	EventBus.notification_requested.emit("Welcome to " + station_name + "!", "info")
