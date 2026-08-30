export class AudioManager{
  constructor(){this.volumes={master:.8,music:.7,effects:.8,ambient:.65,interface:.8};this.history=[];this.currentMusic=null;this.vol=.8}
  setVolume(value,channel='master'){if(!(channel in this.volumes))return false;this.volumes[channel]=Math.max(0,Math.min(1,Number(value)||0));if(channel==='master')this.vol=this.volumes.master;return true}
  getVolume(channel='master'){return this.volumes.master*(channel==='master'?1:(this.volumes[channel]??1))}
  play(name,{channel='effects',loop=false}={}){
    const event={name,channel,loop,volume:this.getVolume(channel),at:Date.now()};this.history.push(event);if(channel==='music')this.currentMusic=name;
    const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;if(AudioContext&&event.volume>0&&channel!=='ambient'){try{this.context??=new AudioContext();const oscillator=this.context.createOscillator(),gain=this.context.createGain(),frequencies={pistol_shot:150,pistol_hit:90,pistol_reload:440,mine_hit:180,chop:125,jump:320,boss_victory:523};oscillator.frequency.value=frequencies[name]||260;oscillator.type=name.includes('pistol')?'square':'sine';gain.gain.setValueAtTime(Math.min(.08,event.volume*.08),this.context.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,this.context.currentTime+(channel==='music'?.8:.12));oscillator.connect(gain).connect(this.context.destination);oscillator.start();oscillator.stop(this.context.currentTime+(channel==='music'?.8:.12))}catch{}}
    return event;
  }
  stopMusic(){this.currentMusic=null}
  toJSON(){return {...this.volumes}}
}
