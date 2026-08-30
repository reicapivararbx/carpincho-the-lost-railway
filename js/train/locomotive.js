export class Locomotive{
  constructor(){
    this.id='loco-carpincho'; this.weight=1200; this.maxSpeed=12; this.power=80; this.traction=1;
    this.baseConsumption=.03; this.fuel=80; this.fuelCapacity=100; this.upgrades=[];
    this.damage={engine:100,tank:100,hull:100,electrical:100,brakes:100};
  }
  upgrade(id,effects={}){ if(this.upgrades.includes(id)) return false; this.upgrades.push(id); Object.assign(this,effects); return true; }
}
