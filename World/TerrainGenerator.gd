extends Node3D
## Terrain generator — creates the ground plane and basic geometry for the plains region.

@export var chunk_size: float = 50.0
@export var chunks_ahead: int = 5
@export var chunks_behind: int = 2

var ground_material: StandardMaterial3D

func _ready() -> void:
	ground_material = StandardMaterial3D.new()
	ground_material.albedo_color = Color(0.45, 0.55, 0.3)
	ground_material.roughness = 0.9
	_generate_terrain()

func _generate_terrain() -> void:
	# Ground plane
	var ground := StaticBody3D.new()
	ground.name = "Ground"
	ground.collision_layer = 2  # world layer
	add_child(ground)
	
	var mesh_inst := MeshInstance3D.new()
	var plane_mesh := PlaneMesh.new()
	plane_mesh.size = Vector2(chunk_size * (chunks_ahead + chunks_behind), chunk_size * 6)
	plane_mesh.subdivide_width = 32
	plane_mesh.subdivide_depth = 32
	mesh_inst.mesh = plane_mesh
	mesh_inst.material_override = ground_material
	ground.add_child(mesh_inst)
	
	# Collision shape
	var col := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(chunk_size * (chunks_ahead + chunks_behind), 0.1, chunk_size * 6)
	col.shape = shape
	col.position.y = -0.05
	ground.add_child(col)
	
	# Add scattered decorations
	_add_rocks()
	_add_bushes()
	_add_rivers()

func _add_rocks() -> void:
	var rock_mat := StandardMaterial3D.new()
	rock_mat.albedo_color = Color(0.5, 0.48, 0.45)
	for i in 20:
		var rock := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(randf_range(0.5, 2.0), randf_range(0.3, 1.0), randf_range(0.5, 1.5))
		rock.mesh = box
		rock.material_override = rock_mat
		rock.position = Vector3(randf_range(-40, 40), box.size.y * 0.5, randf_range(-20, 80))
		rock.rotation.y = randf() * PI
		add_child(rock)

func _add_bushes() -> void:
	var bush_mat := StandardMaterial3D.new()
	bush_mat.albedo_color = Color(0.2, 0.5, 0.15)
	for i in 15:
		var bush := MeshInstance3D.new()
		var sphere := SphereMesh.new()
		sphere.radius = randf_range(0.5, 1.5)
		sphere.height = sphere.radius * 1.5
		bush.mesh = sphere
		bush.material_override = bush_mat
		bush.position = Vector3(randf_range(-35, 35), sphere.radius * 0.6, randf_range(-15, 70))
		add_child(bush)

func _add_rivers() -> void:
	# Simple blue strip representing a river
	var river_mat := StandardMaterial3D.new()
	river_mat.albedo_color = Color(0.2, 0.4, 0.7)
	river_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	river_mat.albedo_color.a = 0.7
	var river := MeshInstance3D.new()
	var river_mesh := PlaneMesh.new()
	river_mesh.size = Vector2(3.0, 120.0)
	river.mesh = river_mesh
	river.material_override = river_mat
	river.position = Vector3(25, 0.02, 30)
	river.rotation.y = deg_to_rad(15)
	add_child(river)
