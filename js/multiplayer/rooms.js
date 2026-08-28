export class Rooms{ create(n){ return {code:Math.random().toString(36).slice(2,6).toUpperCase()} } join(c){ return true } }
