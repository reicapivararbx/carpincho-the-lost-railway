extends Node
## Quest database — all quests defined in the game.

var data: Dictionary = {}

func _ready() -> void:
	data = {
		# === MAIN QUESTS ===
		"first_departure": {
			"id": "first_departure",
			"name": "First Departure",
			"description": "Get the old locomotive running and leave the station for the first time.",
			"type": "main",
			"region": "plains",
			"prerequisites": [],
			"objectives": [
				{"type": "interact", "target": "locomotive", "quantity": 1, "description": "Inspect the locomotive"},
				{"type": "interact", "target": "fuel_tank", "quantity": 1, "description": "Check the fuel tank"},
				{"type": "use_item", "target": "fuel_canister", "quantity": 1, "description": "Refuel the locomotive"},
				{"type": "interact", "target": "cabin", "quantity": 1, "description": "Enter the cabin"},
				{"type": "interact", "target": "engine_start", "quantity": 1, "description": "Start the engine"},
				{"type": "travel_distance", "target": "any", "quantity": 50, "description": "Travel 50 meters from the station"},
			],
			"rewards": {
				"xp": 150,
				"coins": 50,
				"items": [{"id": "repair_kit", "qty": 2}, {"id": "fuel_canister", "qty": 1}]
			},
			"dialogue_start": "The old mechanic waves you over. 'This locomotive hasn't moved in years. Let's see if we can bring it back to life.'",
			"dialogue_complete": "'She's alive! I can hear her heartbeat. The railway may be lost, but your journey is just beginning.'",
		},
		"mystery_of_the_railway": {
			"id": "mystery_of_the_railway",
			"name": "Mystery of the Railway",
			"description": "Uncover what happened to the great railway network.",
			"type": "main",
			"region": "plains",
			"prerequisites": ["first_departure"],
			"objectives": [
				{"type": "discover", "target": "old_documents", "quantity": 1, "description": "Find old documents at the station"},
				{"type": "talk", "target": "old_timer_jake", "quantity": 1, "description": "Ask Old Timer Jake about the railway"},
				{"type": "discover", "target": "forest_research", "quantity": 1, "description": "Discover the forest research outpost"},
			],
			"rewards": {
				"xp": 300,
				"coins": 100,
				"items": [{"id": "motor_part", "qty": 1}]
			},
			"dialogue_start": "Scraps of paper lie scattered on the station master's desk. The ink has faded but the words are still legible...",
			"dialogue_complete": "'The research outpost in the forest... someone was studying something important before the railway fell silent.'",
		},
		# === SIDE QUESTS ===
		"gather_wood": {
			"id": "gather_wood",
			"name": "Gathering Supplies",
			"description": "Collect wood for the station repairs.",
			"type": "side",
			"region": "plains",
			"prerequisites": [],
			"npc_giver": "mechanic_anton",
			"objectives": [
				{"type": "collect", "target": "wood", "quantity": 10, "description": "Collect 10 wood"},
			],
			"rewards": {
				"xp": 75,
				"coins": 30,
				"items": [{"id": "simple_part", "qty": 1}]
			},
			"dialogue_start": "'The station platform is falling apart. If you could bring me some wood, I could patch it up.'",
			"dialogue_complete": "'Perfect! This will keep the platform standing a while longer. Here, take this — you'll need it more than me.'",
		},
		"fix_the_track": {
			"id": "fix_the_track",
			"name": "Fix the Track",
			"description": "Repair the broken section of track near the station.",
			"type": "side",
			"region": "plains",
			"prerequisites": [],
			"npc_giver": "mechanic_anton",
			"objectives": [
				{"type": "collect", "target": "scrap", "quantity": 5, "description": "Find 5 scrap metal"},
				{"type": "collect", "target": "iron", "quantity": 3, "description": "Find 3 iron"},
				{"type": "interact", "target": "broken_track", "quantity": 1, "description": "Repair the broken track"},
			],
			"rewards": {
				"xp": 100,
				"coins": 50,
				"items": []
			},
			"dialogue_start": "'There's a broken section of track just north of here. Without it, you can't go further. Bring me some materials and I'll show you how to fix it.'",
			"dialogue_complete": "'There! Good as new. Well... good enough. The rails don't need to be pretty, they just need to hold.'",
		},
		"explore_cave": {
			"id": "explore_cave",
			"name": "Into the Dark",
			"description": "Investigate the cave entrance near the forest.",
			"type": "side",
			"region": "plains",
			"prerequisites": ["first_departure"],
			"npc_giver": "old_timer_jake",
			"objectives": [
				{"type": "discover", "target": "forest_cave", "quantity": 1, "description": "Find the cave entrance"},
				{"type": "collect", "target": "crystals", "quantity": 3, "description": "Collect 3 crystals from inside"},
			],
			"rewards": {
				"xp": 120,
				"coins": 60,
				"items": [{"id": "crystals", "qty": 2}]
			},
			"dialogue_start": "'I've seen strange lights coming from a cave near the forest. Probably nothing... but then again, everything about this railway was something.'",
			"dialogue_complete": "'Crystals! Real ones! Do you know how rare these are? The old railway company would have paid a fortune for these.'",
		},
		"delivery_for_lucia": {
			"id": "delivery_for_lucia",
			"name": "A Merchant's Request",
			"description": "Deliver supplies to the forest station for Merchant Lucia.",
			"type": "side",
			"region": "plains",
			"prerequisites": ["first_departure"],
			"npc_giver": "merchant_lucia",
			"objectives": [
				{"type": "collect", "target": "food_bread", "quantity": 3, "description": "Prepare 3 bread"},
				{"type": "travel_distance", "target": "forest_station", "quantity": 1, "description": "Travel to the forest station"},
				{"type": "talk", "target": "forest_merchant", "quantity": 1, "description": "Deliver the bread"},
			],
			"rewards": {
				"xp": 90,
				"coins": 45,
				"items": [{"id": "herbs", "qty": 5}]
			},
			"dialogue_start": "'I have a customer at the forest station who's been waiting for a delivery. Would you take it there on your next trip?'",
			"dialogue_complete": "'Thank you so much! Here, take these herbs as payment. They grow like weeds in the forest but they're worth their weight here.'",
		},
	}

func get(id: String) -> Dictionary:
	return data.get(id, {})

func get_all() -> Dictionary:
	return data

func get_by_type(quest_type: String) -> Array:
	var results: Array = []
	for q in data.values():
		if q.get("type") == quest_type:
			results.append(q)
	return results

func get_available(player_level: int, completed_quests: Array) -> Array:
	var results: Array = []
	for q in data.values():
		if q["id"] in completed_quests:
			continue
		var prereqs_met := true
		for prereq in q.get("prerequisites", []):
			if prereq not in completed_quests:
				prereqs_met = false
				break
		if prereqs_met:
			results.append(q)
	return results
