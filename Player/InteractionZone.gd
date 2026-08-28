extends Area3D
## Interaction zone — detects when the player is nearby an interactable object.

@export var interact_prompt: String = "Interact"
@export var highlight_on_hover: bool = true

var is_player_near: bool = false
var player: CharacterBody3D = null

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)

func _on_body_entered(body: Node3D) -> void:
	if body.is_in_group("player"):
		is_player_near = true
		player = body
		player.is_near_interactable = true
		player.nearest_interactable = get_parent()
		EventBus.player_near_interactable.emit(get_parent())

func _on_body_exited(body: Node3D) -> void:
	if body.is_in_group("player"):
		is_player_near = false
		player.is_near_interactable = false
		EventBus.player_left_interactable.emit(get_parent())
		player.nearest_interactable = null
		player = null

func get_interact_prompt() -> String:
	return interact_prompt

func interact(interactor: Node3D) -> void:
	# Override in child scripts
	pass
