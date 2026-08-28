extends Node
## NPC database — all non-player characters.

var data: Dictionary = {}

func _ready() -> void:
	data = {
		"mechanic_anton": {
			"id": "mechanic_anton",
			"name": "Mechanic Anton",
			"profession": "Mechanic",
			"location": "plains_station",
			"position": {"x": 5.0, "y": 0.0, "z": -3.0},
			"dialogue_lines": [
				"Welcome to the last working station on the plains.",
				"That locomotive out there... she's a tough old girl.",
				"The tracks to the north are broken. Someone needs to fix them.",
				"I can help you upgrade your train, if you bring the right parts.",
			],
			"shop_items": ["repair_kit", "fuel_canister", "simple_part", "iron", "scrap"],
			"shop_prices": {"repair_kit": 25, "fuel_canister": 30, "simple_part": 35, "iron": 15, "scrap": 10},
			"quests_given": ["first_departure", "fix_the_track", "gather_wood"],
			"schedule": {
				"wake_hour": 6, "work_start": 7, "lunch_start": 12, "lunch_end": 13,
				"work_end": 18, "sleep_hour": 22
			},
			"greeting": "Hey there, traveler! Need something fixed?",
		},
		"merchant_lucia": {
			"id": "merchant_lucia",
			"name": "Merchant Lucia",
			"profession": "Merchant",
			"location": "plains_station",
			"position": {"x": -4.0, "y": 0.0, "z": 2.0},
			"dialogue_lines": [
				"Everything has a price, friend.",
				"Food, tools, supplies — I've got it all.",
				"Supply lines have been cut for months. Prices are... elevated.",
				"The forest station could use a delivery, if you're heading that way.",
			],
			"shop_items": ["food_apple", "food_bread", "herbs", "plants", "fuel_basic", "axe_basic", "shovel_basic"],
			"shop_prices": {"food_apple": 8, "food_bread": 15, "herbs": 10, "plants": 6, "fuel_basic": 20, "axe_basic": 35, "shovel_basic": 25},
			"quests_given": ["delivery_for_lucia"],
			"schedule": {
				"wake_hour": 7, "work_start": 8, "lunch_start": 12, "lunch_end": 13,
				"work_end": 17, "sleep_hour": 21
			},
			"greeting": "Looking to buy or sell? I've got deals for either.",
		},
		"old_timer_jake": {
			"id": "old_timer_jake",
			"name": "Old Timer Jake",
			"profession": "Retired Conductor",
			"location": "plains_station",
			"position": {"x": 2.0, "y": 0.0, "z": 5.0},
			"dialogue_lines": [
				"I used to run these rails, you know. Top to bottom.",
				"The railway used to connect the whole continent.",
				"Nobody knows why they stopped. One day the trains just... didn't come.",
				"I've seen lights in the cave near the forest. Strange lights.",
				"Zero Station... that's where it all began. And where it all ended.",
				"If you're heading into the forest, watch yourself. Things have changed out there.",
			],
			"shop_items": [],
			"shop_prices": {},
			"quests_given": ["explore_cave", "mystery_of_the_railway"],
			"schedule": {
				"wake_hour": 5, "work_start": 6, "lunch_start": 11, "lunch_end": 12,
				"work_end": 16, "sleep_hour": 20
			},
			"greeting": "Ah, another young one with big dreams. Sit down, I'll tell you a thing or two.",
		},
		"forest_merchant": {
			"id": "forest_merchant",
			"name": "Trader Moss",
			"profession": "Merchant",
			"location": "forest_station",
			"position": {"x": 0.0, "y": 0.0, "z": 0.0},
			"dialogue_lines": [
				"Hardly anyone comes this far anymore.",
				"I trade in herbs and rare materials.",
				"The forest holds many secrets, if you're brave enough to look.",
			],
			"shop_items": ["herbs", "plants", "crystals", "wood", "coal"],
			"shop_prices": {"herbs": 8, "plants": 5, "crystals": 60, "wood": 7, "coal": 12},
			"quests_given": [],
			"schedule": {
				"wake_hour": 6, "work_start": 7, "lunch_start": 12, "lunch_end": 13,
				"work_end": 17, "sleep_hour": 21
			},
			"greeting": "Welcome, traveler. Not many make it to the forest station.",
		},
	}

func lookup(id: String) -> Dictionary:
	return data.get(id, {})

func get_all() -> Dictionary:
	return data

func get_by_location(location_id: String) -> Array:
	var results: Array = []
	for npc in data.values():
		if npc.get("location") == location_id:
			results.append(npc)
	return results
