extends Node
## Global event bus — decoupled signal hub for all systems.

# --- Player ---
signal player_died
signal player_hp_changed(current: int, maximum: int)
signal player_stamina_changed(current: float, maximum: float)
signal player_level_up(new_level: int)
signal player_xp_changed(current: int, to_next: int)
signal player_coins_changed(amount: int)
signal player_entered_train
signal player_exited_train
signal player_inventory_opened
signal player_inventory_closed
signal player_near_interactable(node: Node3D)
signal player_left_interactable(node: Node3D)

# --- Train ---
signal train_started
signal train_stopped
signal train_speed_changed(speed_kmh: float)
signal train_fuel_changed(current: float, maximum: float)
signal train_integrity_changed(current: float, maximum: float)
signal train_damaged(amount: float, damage_type: String)
signal train_wagon_added(wagon: Node3D)
signal train_wagon_removed(wagon: Node3D)
signal train_brake_applied
signal train_brake_released
signal train_horn
signal train_entered_cabin
signal train_exited_cabin

# --- Inventory ---
signal inventory_item_added(item_id: String, quantity: int)
signal inventory_item_removed(item_id: String, quantity: int)
signal inventory_full
signal inventory_changed
signal inventory_slot_clicked(slot_index: int)
signal item_used(item_id: String)

# --- Crafting ---
signal crafting_started(recipe_id: String)
signal crafting_completed(recipe_id: String)
signal crafting_failed(recipe_id: String)
signal recipe_unlocked(recipe_id: String)

# --- Quests ---
signal quest_started(quest_id: String)
signal quest_objective_completed(quest_id: String, objective_index: int)
signal quest_completed(quest_id: String)
signal quest_failed(quest_id: String)
signal quest_updated(quest_id: String)

# --- Economy ---
signal shop_opened(shop_id: String)
signal shop_closed
signal item_bought(item_id: String, price: int)
signal item_sold(item_id: String, price: int)

# --- World ---
signal region_discovered(region_id: String)
signal station_discovered(station_id: String)
signal location_discovered(location_id: String)
signal time_changed(hour: int, minute: int)
signal day_changed(day: int)
signal weather_changed(weather: String)

# --- Navigation ---
signal rail_reached_end_of_line
signal rail_switch_activated(switch_id: String)
signal destination_selected(destination_id: String)

# --- UI ---
signal notification_requested(text: String, type: String)
signal hud_update_requested
signal screen_shake_requested(intensity: float, duration: float)
signal dialog_started(dialog_data: Dictionary)
signal dialog_ended

# --- Save/Load ---
signal game_saved
signal game_loaded
signal save_error(error: String)

# --- Debug ---
signal debug_toggled(visible: bool)
