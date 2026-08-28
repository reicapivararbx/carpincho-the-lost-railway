extends Node
## Region database — world regions.

var data: Dictionary = {}

func _ready() -> void:
	data = {
		"plains": {
			"id": "plains", "name": "The Plains", "description": "Wide open fields with scattered farms and rivers.",
			"recommended_level": 1, "recommended_fuel": 20,
			"resources_available": ["wood", "stone", "iron", "herbs", "plants", "scrap"],
			"enemy_types": [],
			"stations": ["plains_station"],
			"climate": "temperate",
			"music_track": "plains_theme",
			"ambient_sounds": ["wind", "birds", "insects"],
			"color_tint": Color(0.85, 0.95, 0.75),
		},
		"forest": {
			"id": "forest", "name": "The Whispering Forest", "description": "Dense woodland shrouded in mist and mystery.",
			"recommended_level": 5, "recommended_fuel": 30,
			"resources_available": ["wood", "herbs", "plants", "coal", "crystals"],
			"enemy_types": ["wild_boar", "forest_spider"],
			"stations": ["forest_station"],
			"climate": "humid",
			"music_track": "forest_theme",
			"ambient_sounds": ["leaves", "animals", "water"],
			"color_tint": Color(0.65, 0.85, 0.6),
		},
		"mountains": {
			"id": "mountains", "name": "Iron Peaks", "description": "Towering mountains riddled with mines and tunnels.",
			"recommended_level": 10, "recommended_fuel": 40,
			"resources_available": ["iron", "coal", "crystals", "stone"],
			"enemy_types": ["rock_golem", "cave_bat"],
			"stations": ["mountain_station"],
			"climate": "cold",
			"music_track": "mountain_theme",
			"ambient_sounds": ["wind", "rocks", "echoes"],
			"color_tint": Color(0.75, 0.8, 0.85),
		},
		"city": {
			"id": "city", "name": "Rusthaven City", "description": "The remnants of a once-great technological hub.",
			"recommended_level": 15, "recommended_fuel": 50,
			"resources_available": ["scrap", "components", "iron", "coal"],
			"enemy_types": ["rogue_robot", "security_drone"],
			"stations": ["city_station"],
			"climate": "urban",
			"music_track": "city_theme",
			"ambient_sounds": ["machines", "energy", "traffic"],
			"color_tint": Color(0.8, 0.8, 0.85),
		},
		"desert": {
			"id": "desert", "name": "Scorched Expanse", "description": "Blistering heat and buried secrets beneath the sand.",
			"recommended_level": 20, "recommended_fuel": 60,
			"resources_available": ["stone", "iron", "crystals", "scrap"],
			"enemy_types": ["sand_scorpion", "dust_wraith"],
			"stations": ["desert_station"],
			"climate": "hot",
			"music_track": "desert_theme",
			"ambient_sounds": ["wind", "sand"],
			"color_tint": Color(0.95, 0.85, 0.65),
		},
		"snow": {
			"id": "snow", "name": "Frozen Crossing", "description": "A frozen wasteland where the rails are buried in snow.",
			"recommended_level": 25, "recommended_fuel": 70,
			"resources_available": ["stone", "iron", "crystals"],
			"enemy_types": ["frost_wolf", "ice_elemental"],
			"stations": ["snow_station"],
			"climate": "freezing",
			"music_track": "snow_theme",
			"ambient_sounds": ["cold_wind", "ice"],
			"color_tint": Color(0.85, 0.9, 1.0),
		},
		"volcanic": {
			"id": "volcanic", "name": "Molten Frontier", "description": "Volcanic terrain with rivers of lava and rare minerals.",
			"recommended_level": 30, "recommended_fuel": 80,
			"resources_available": ["crystals", "iron", "coal", "stone"],
			"enemy_types": ["lava_slime", "fire_serpent"],
			"stations": ["volcanic_station"],
			"climate": "extreme_heat",
			"music_track": "volcanic_theme",
			"ambient_sounds": ["fire", "rocks", "subterranean"],
			"color_tint": Color(1.0, 0.7, 0.5),
		},
		"station_zero": {
			"id": "station_zero", "name": "Station Zero", "description": "The origin of the railway. Mysterious and heavily guarded.",
			"recommended_level": 40, "recommended_fuel": 0,
			"resources_available": ["crystals", "components", "iron"],
			"enemy_types": ["sentinel", "corrupted_conductor"],
			"stations": ["station_zero_main"],
			"climate": "unknown",
			"music_track": "station_zero_theme",
			"ambient_sounds": ["machines", "echoes", "mysterious"],
			"color_tint": Color(0.6, 0.6, 0.7),
		},
	}

func lookup(id: String) -> Dictionary:
	return data.get(id, {})

func get_all() -> Dictionary:
	return data

func get_neighbors(region_id: String) -> Array:
	var connections := {
		"plains": ["forest"],
		"forest": ["plains", "mountains"],
		"mountains": ["forest", "city"],
		"city": ["mountains", "desert"],
		"desert": ["city", "snow"],
		"snow": ["desert", "volcanic"],
		"volcanic": ["snow", "station_zero"],
		"station_zero": ["volcanic"],
	}
	return connections.get(region_id, [])
