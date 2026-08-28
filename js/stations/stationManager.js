import { Station } from './station.js';
export class StationManager{ constructor(){ this.stations=[new Station('plain_station','Estação Planície',2,10)] } nearest(x,z){ return this.stations[0] } }
