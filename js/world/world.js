import { REGIONS,RegionDB } from '../data/regions.js';
export class World{constructor(){this.regions=REGIONS.map(region=>({...region}));this.seed=Math.floor(Math.random()*2**31);this.events=[]}regionAt(position){return RegionDB.at(position)}addEvent(event){this.events.push({...event,at:Date.now()});return event}toJSON(){return {seed:this.seed,events:this.events}}}
