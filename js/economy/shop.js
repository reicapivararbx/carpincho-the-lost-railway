export class Shop{ constructor(){ this.list=[{item:'wood',price:5},{item:'iron_ingot',price:20}] } price(item,region){ return item==='iron_ingot'&&region==='desert'?28:20 } }
