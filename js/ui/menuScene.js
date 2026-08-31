export class MenuScene{
  constructor(canvas){
    this.canvas=canvas;
    this.ctx=canvas?.getContext?.('2d')||null;
    this.running=Boolean(this.ctx);
    this.time=0;
    this.last=performance.now();
    this.locomotive=new Image();
    this.locomotive.src=`${import.meta.env.BASE_URL||'/'}assets/sprites/locomotive-realistic.webp`;
    this.stars=Array.from({length:90},(_,index)=>({
      x:(index*73%997)/997,
      y:(index*193%509)/509,
      size:1+(index%3),
      speed:.02+(index%5)*.006,
    }));
    this.resize();
    if(this.running)this.loop();
  }
  resize(){
    if(!this.ctx)return;
    const width=this.canvas.clientWidth||innerWidth;
    const height=this.canvas.clientHeight||innerHeight;
    const ratio=Math.min(2,devicePixelRatio||1);
    this.canvas.width=Math.max(1,Math.floor(width*ratio));
    this.canvas.height=Math.max(1,Math.floor(height*ratio));
    this.ctx.setTransform(ratio,0,0,ratio,0,0);
    this.width=width;
    this.height=height;
  }
  drawTrain(ctx,x,y,scale){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(0,31,150,20,0,0,Math.PI*2);ctx.fill();
    if(this.locomotive.complete&&this.locomotive.naturalWidth){ctx.drawImage(this.locomotive,-155,-56,310,113);ctx.restore();return}
    ctx.fillStyle='#8d321f';ctx.strokeStyle='#d7a74a';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-105,-25,170,58,10);ctx.fill();ctx.stroke();
    ctx.fillStyle='#c58b2c';ctx.fillRect(20,-58,63,34);ctx.strokeRect(20,-58,63,34);
    ctx.fillStyle='#101a18';ctx.fillRect(31,-50,22,17);ctx.fillRect(58,-50,17,17);
    ctx.fillStyle='#25211e';ctx.fillRect(-70,-57,24,33);ctx.beginPath();ctx.ellipse(-58,-58,18,9,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#241d19';for(const wx of [-72,-20,39]){ctx.beginPath();ctx.arc(wx,34,18,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d7a74a';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#241d19'}
    ctx.fillStyle='#f5d77b';ctx.beginPath();ctx.arc(-102,-2,8,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  draw(){
    const {ctx,width:w,height:h}=this;
    const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#071512');sky.addColorStop(.58,'#17351d');sky.addColorStop(1,'#081208');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    for(const star of this.stars){const alpha=.25+.55*Math.abs(Math.sin(this.time*star.speed*22+star.x*12));ctx.fillStyle=`rgba(246,214,123,${alpha})`;ctx.fillRect(star.x*w,star.y*h*.62,star.size,star.size)}
    ctx.fillStyle='#0b210f';ctx.beginPath();ctx.moveTo(0,h*.68);for(let x=0;x<=w;x+=80)ctx.lineTo(x,h*.59-Math.sin(x*.013)*35);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
    const railY=h*.78;ctx.strokeStyle='#3d2b20';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(0,railY);ctx.lineTo(w,railY);ctx.stroke();ctx.strokeStyle='#9b8b75';ctx.lineWidth=3;for(const offset of [-7,7]){ctx.beginPath();ctx.moveTo(0,railY+offset);ctx.lineTo(w,railY+offset);ctx.stroke()}ctx.strokeStyle='#34241a';ctx.lineWidth=5;for(let x=-20;x<w+30;x+=32){ctx.beginPath();ctx.moveTo(x,railY-14);ctx.lineTo(x+8,railY+14);ctx.stroke()}
    this.drawTrain(ctx,w*.73,railY-28,Math.max(.72,Math.min(1.15,w/1200)));
    const mist=ctx.createRadialGradient(w*.62,h*.65,10,w*.62,h*.65,w*.55);mist.addColorStop(0,'rgba(215,167,74,.08)');mist.addColorStop(1,'rgba(0,0,0,.38)');ctx.fillStyle=mist;ctx.fillRect(0,0,w,h);
  }
  loop(now=performance.now()){
    if(!this.running)return;
    this.time+=Math.min(.05,(now-this.last)/1000);this.last=now;this.draw();requestAnimationFrame(next=>this.loop(next));
  }
  stop(){this.running=false}
}
