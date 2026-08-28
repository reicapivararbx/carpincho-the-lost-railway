export class DayNight{
  constructor(){ this.time=8 }
  tick(dt){ this.time=(this.time+dt*0.02)%24 }
  phase(){ if(this.time<5) return 'madrugada'; if(this.time<8) return 'manhã'; if(this.time<17) return 'dia'; if(this.time<19) return 'entardecer'; return 'noite' }
}
