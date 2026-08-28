extends Node
## Price Manager — handles regional pricing, buy/sell economics.

var regional_multipliers: Dictionary = {
	"plains": 1.0,
	"forest": 1.1,
	"mountains": 1.2,
	"city": 0.9,
	"desert": 1.3,
	"snow": 1.4,
	"volcanic": 1.5,
	"station_zero": 2.0,
}

func get_buy_price(item_id: String, region_id: String) -> int:
	var base: int = ItemDB.get_value(item_id)
	var multiplier: float = regional_multipliers.get(region_id, 1.0)
	return maxi(1, int(base * multiplier))

func get_sell_price(item_id: String, region_id: String) -> int:
	var buy_price := get_buy_price(item_id, region_id)
	return maxi(1, buy_price / 2)

func get_total_value(inventory: Array, region_id: String) -> int:
	var total := 0
	for entry in inventory:
		var item_id: String = entry.get("id", "")
		var qty: int = entry.get("quantity", 0)
		total += get_sell_price(item_id, region_id) * qty
	return total
