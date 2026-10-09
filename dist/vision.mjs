// Small supervised nearest-centroid model trained on labelled synthetic RGB samples.
// The detector receives pixels and timestamps only, never simulator events or positions.
export const PALETTE={ball:[247,202,47],p7:[107,230,170],p10:[182,243,108],p17:[180,160,250],background:[22,54,38]};
export function trainColorModel(){const model={};for(const [label,color]of Object.entries(PALETTE)){const samples=[-3,0,3].map(delta=>color.map(c=>Math.min(255,Math.max(0,c+delta))));model[label]=[0,1,2].map(k=>samples.reduce((a,s)=>a+s[k],0)/samples.length);}return model;}
export class PixelTracker{
 constructor(){this.model=trainColorModel();this.previous=null;this.lastOwner=null;this.departure=null;this.passes=[];this.lastTime=-1;}
 infer(rgba,width,height,time){
  if(time<=this.lastTime)throw Error('Frame timestamps must increase');this.lastTime=time;
  const sums={};for(let y=0;y<height;y+=2)for(let x=0;x<width;x+=2){const o=(y*width+x)*4;let best='unknown',dist=Infinity;for(const [label,c]of Object.entries(this.model)){const d=(rgba[o]-c[0])**2+(rgba[o+1]-c[1])**2+(rgba[o+2]-c[2])**2;if(d<dist){dist=d;best=label;}}if(dist<225&&best!=='background'){const s=sums[best]??={x:0,y:0,n:0};s.x+=x;s.y+=y;s.n++;}}
  const detections=Object.fromEntries(Object.entries(sums).filter(([,s])=>s.n>=3).map(([k,s])=>[k,{x:s.x/s.n/width*105,y:s.y/s.n/height*68}]));const ball=detections.ball;
  let speed=null,owner=null,newPass=null;if(ball){if(this.previous&&time-this.previous.time<.5)speed=Math.hypot(ball.x-this.previous.x,ball.y-this.previous.y)/(time-this.previous.time)*3.6;
   let nearest=2.8;for(const [id,p]of Object.entries(detections))if(id!=='ball'){const d=Math.hypot(p.x-ball.x,p.y-ball.y);if(d<nearest){owner=id;nearest=d;}}
   if(!owner&&this.lastOwner&&!this.departure)this.departure={id:this.lastOwner,position:{...this.previous},time:this.previous?.time??time};
   if(owner&&this.departure&&owner!==this.departure.id){const d=Math.hypot(ball.x-this.departure.position.x,ball.y-this.departure.position.y);newPass={from:this.departure.id,to:owner,distance_m:Number(d.toFixed(1)),speed_kmh:Number((d/(time-this.departure.time)*3.6).toFixed(1)),time,synthetic:true,source:'pixel-centroid-model'};this.passes.push(newPass);this.departure=null;}
   if(owner){if(this.lastOwner===owner)this.departure=null;this.lastOwner=owner;}this.previous={...ball,time};
  }else{this.previous=null;this.departure=null;this.lastOwner=null;}
  return{detections,ball_speed_kmh:speed===null?null:Number(speed.toFixed(1)),owner,newPass,passes:this.passes.length};
 }
}
export function renderSyntheticFrame(ctx,time){
 const w=ctx.canvas.width,h=ctx.canvas.height;ctx.fillStyle='rgb(22,54,38)';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#45644b';ctx.lineWidth=1;ctx.strokeRect(12,12,w-24,h-24);ctx.beginPath();ctx.moveTo(w/2,12);ctx.lineTo(w/2,h-12);ctx.stroke();ctx.beginPath();ctx.arc(w/2,h/2,55,0,Math.PI*2);ctx.stroke();
 const ps={p7:{x:24,y:40},p10:{x:65,y:24},p17:{x:90,y:46}};const t=time%12;
 const mix=(a,b,k)=>({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k});
 let b=t<2?ps.p7:t<5?mix(ps.p7,ps.p10,(t-2)/3):t<7?ps.p10:t<10?mix(ps.p10,ps.p17,(t-7)/3):ps.p17;
 for(const [id,p]of Object.entries(ps)){ctx.fillStyle=`rgb(${PALETTE[id].join(',')})`;ctx.beginPath();ctx.arc(p.x/105*w,p.y/68*h,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d8e7d0';ctx.font='11px sans-serif';ctx.fillText(id,p.x/105*w-8,p.y/68*h-15);}
 ctx.fillStyle=`rgb(${PALETTE.ball.join(',')})`;ctx.beginPath();ctx.arc(b.x/105*w,b.y/68*h+6,4,0,Math.PI*2);ctx.fill();
 return ctx.getImageData(0,0,w,h);
}
