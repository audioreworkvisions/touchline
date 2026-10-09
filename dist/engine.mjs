export const VERSION = '1.0.0';
export const TEAMS = [{id:'harbour',name:'Harbour FC',short:'HBR',color:'#b6f36c'},{id:'vale',name:'Vale United',short:'VAL',color:'#b4a0fa'}];
const names = ['Leon Hart','Idris Cole','Noah Silva','Elias Reed','Finn Mori','Milo Adebayo','Luca Vale','Amir Sol','Theo Marin','Kai Santos','Jules Rossi','Owen Park','Samir West','Hugo Lane','Nico Bell','Arlo Cruz','Adam Noor','Ezra King','Rayan Frost','Leo Quinn','Felix Stone','Ivo Bloom'];
export const PLAYERS = names.map((name,i)=>({id:`p${i+1}`,name,team:i<11?'harbour':'vale',number:i%11+1,role:['GK','LB','CB','CB','RB','DM','CM','CM','LW','ST','RW'][i%11]}));
export const player = id => PLAYERS.find(p=>p.id===id);
export const team = id => TEAMS.find(t=>t.id===id);
export const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
export const round = (x,n=1)=>Number(x.toFixed(n));
export const clock = s=>`${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;
export function rng(seed){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function passMetrics(e){const distance=Math.hypot(e.end.x-e.start.x,e.end.y-e.start.y);return{distance_m:round(distance),speed_kmh:round(distance/e.duration_s*3.6),difficulty:Math.round(clamp(distance/60*.5+e.pressure*.4+Math.abs(e.end.y-e.start.y)/68*.1,0,1)*100)};}
export function shotQuality(e){const d=Math.hypot(105-e.end.x,34-e.end.y);return round(clamp(.55*Math.exp(-d/20)*(1-e.pressure*.35),.02,.55),3);}
const bases = [[5,34],[25,10],[20,26],[20,43],[25,58],[39,34],[50,22],[50,46],[68,9],[73,34],[68,59]];
export function generateMatch(seed=42){
 const r=rng(seed),events=[];let time=0,owner='harbour',pos={x:30,y:34},seq=0;
 let tracks=PLAYERS.map((p,i)=>({player_id:p.id,x:bases[i%11][0],y:bases[i%11][1]}));
 const emit=(type,opts={})=>{
  const tm=opts.team_id||owner;const pool=PLAYERS.filter(p=>p.team===tm&&p.role!=='GK');const who=opts.player_id||pool[Math.floor(r()*pool.length)].id;
  const pressure=opts.pressure??round(r());const start=opts.start||{...pos};
  const end=opts.end||(type==='shot'?{...start}:{x:round(clamp(pos.x+(r()-.4)*35,2,103)),y:round(clamp(pos.y+(r()-.5)*30,1,67))});
  const dist=Math.hypot(end.x-start.x,end.y-start.y);const duration=round(Math.max(.35,dist/(8+r()*15)),2);
  const success=opts.success??(r()>(.08+pressure*.14+(dist>30?.1:0)));
  const receiver=pool.filter(p=>p.id!==who)[Math.floor(r()*(pool.length-1))].id;
  const prev=events.at(-1)?.match_time_s??0;const dt=Math.max(.1,time-prev);
  tracks=tracks.map((t,i)=>{const dx=(r()-.5)*Math.min(8,dt*3),dy=(r()-.5)*Math.min(8,dt*3);const x=clamp(t.x+dx,1,104),y=clamp(t.y+dy,1,67);return{player_id:t.player_id,x:round(x,2),y:round(y,2),speed_kmh:round(Math.hypot(x-t.x,y-t.y)/dt*3.6)};});
  const e={id:`s${seed}-${String(++seq).padStart(4,'0')}`,match_id:`synthetic-${seed}`,sequence:seq,synthetic:true,source:'seeded-simulator',period:time<=2700?1:2,match_time_s:round(time,2),type,team_id:tm,player_id:who,receiver_id:receiver,start,end,duration_s:duration,pressure,success,tracking:structuredClone(tracks),...opts};
  if(type==='shot'){e.shot_quality=shotQuality(e);e.goal=opts.goal??(r()<e.shot_quality);e.success=e.goal;}
  events.push(e);if(type==='pass'&&success)pos=end;
  if((type==='pass'&&!success)||type==='turnover'||type==='tackle'||type==='shot'){owner=tm==='harbour'?'vale':'harbour';pos={x:type==='shot'?30:105-end.x,y:end.y};}
 };
 while(time<5400){time=round(time+3+r()*9,2);if(time>=5400)break;if(time>=3720&&time<3770)continue;
  const v=r();const type=pos.x>77&&v<.4?'shot':v<.10?'pressure':v<.15?'tackle':v<.18?'turnover':v<.2?'throw':'pass';emit(type);
 }
 // Curated, physically plausible synthetic teaching sequence; explicit metadata in data card.
 time=3720;owner='vale';pos={x:35,y:25};emit('pressure',{team_id:'harbour',player_id:'p6',pressure:.9,end:{x:35,y:25}});
 time=3726;emit('pressure',{team_id:'harbour',player_id:'p7',pressure:.94,end:{x:38,y:27}});
 time=3732;emit('pressure',{team_id:'harbour',player_id:'p8',pressure:.96,end:{x:40,y:29}});
 time=3738;emit('turnover',{team_id:'vale',player_id:'p17',start:{x:40,y:29},end:{x:40,y:29},success:false,pressure:.96});
 time=3743;emit('pass',{team_id:'harbour',player_id:'p7',receiver_id:'p10',start:{x:65,y:29},end:{x:91,y:32},success:true,pressure:.7});
 time=3748;emit('shot',{team_id:'harbour',player_id:'p10',start:{x:91,y:32},end:{x:91,y:32},pressure:.35,goal:true});
 events.sort((a,b)=>a.match_time_s-b.match_time_s);
 tracks=PLAYERS.map((p,i)=>({player_id:p.id,x:bases[i%11][0],y:bases[i%11][1]}));
 events.forEach((e,i)=>{e.sequence=i+1;e.id=`s${seed}-${String(i+1).padStart(4,'0')}`;
  const dt=Math.max(.01,e.match_time_s-(events[i-1]?.match_time_s??0));
  tracks=tracks.map(t=>{const angle=r()*Math.PI*2,speed=r()<.04?7+r()*2:1+r()*4;const x=clamp(t.x+Math.cos(angle)*speed*dt,1,104),y=clamp(t.y+Math.sin(angle)*speed*dt,1,67);return{player_id:t.player_id,x:round(x,2),y:round(y,2),speed_kmh:round(Math.hypot(x-t.x,y-t.y)/dt*3.6)};});e.tracking=structuredClone(tracks);
 });
 return{schema_version:'1.0',id:`synthetic-${seed}`,seed,duration_s:5400,synthetic:true,teams:TEAMS,players:PLAYERS,events};
}
export function validateEvent(e){
 if(!e||e.synthetic!==true)throw Error('Only explicitly synthetic events are accepted');
 if(typeof e.match_id!=='string'||!e.match_id||e.match_id.length>100)throw Error('Invalid match ID');
 if(typeof e.id!=='string'||!e.id||e.id.length>100)throw Error('Invalid event ID');
 if(!Number.isInteger(e.sequence)||e.sequence<1)throw Error('Invalid sequence');
 if(!Number.isFinite(e.match_time_s)||e.match_time_s<0||e.match_time_s>7200)throw Error('Invalid match clock');
 if(!['pass','shot','pressure','turnover','tackle','throw'].includes(e.type))throw Error('Invalid event type');
 if(!team(e.team_id)||player(e.player_id)?.team!==e.team_id)throw Error('Invalid player/team');
 if(!Number.isFinite(e.pressure)||e.pressure<0||e.pressure>1||!Number.isFinite(e.duration_s)||e.duration_s<=0)throw Error('Invalid physical values');
 for(const pt of [e.start,e.end])if(!pt||!Number.isFinite(pt.x)||!Number.isFinite(pt.y)||pt.x<0||pt.x>105||pt.y<0||pt.y>68)throw Error('Invalid coordinates');
 if(typeof e.success!=='boolean')throw Error('Invalid outcome');
 if(['pass','throw'].includes(e.type)&&player(e.receiver_id)?.team!==e.team_id)throw Error('Invalid receiver');
 if(e.type==='shot'&&typeof e.goal!=='boolean')throw Error('Invalid goal');
 if(e.tracking!==undefined&&(!Array.isArray(e.tracking)||e.tracking.some(t=>!player(t.player_id)||![t.x,t.y,t.speed_kmh].every(Number.isFinite)||t.speed_kmh<0||t.speed_kmh>50||t.x<0||t.x>105||t.y<0||t.y>68)))throw Error('Invalid tracking');
 return true;
}
const blank=()=>({passes:0,completed:0,shots:0,goals:0,pressure:0,quality:0,events:0});
export class Engine{
 constructor(){this.events=[];this.seen=new Set();this.insights=[];this.stats={harbour:blank(),vale:blank()};this.playerStats=Object.fromEntries(PLAYERS.map(p=>[p.id,{...blank(),distance_m:0,top_speed_kmh:0}]));this.rejected=0;}
 ingest(input){validateEvent(input);if(this.events.length&&input.match_id!==this.events[0].match_id)throw Error('Cannot mix matches in one engine');if(this.seen.has(input.id))return{accepted:false,reason:'duplicate'};
  if(this.events.length&&(input.match_time_s<this.events.at(-1).match_time_s||input.sequence<=this.events.at(-1).sequence)){this.rejected++;return{accepted:false,reason:'out-of-order'};}
  const e=structuredClone(input);if(e.type==='shot')e.shot_quality=shotQuality(e);this.seen.add(e.id);this.events.push(e);
  for(const s of [this.stats[e.team_id],this.playerStats[e.player_id]]){s.events++;if(e.type==='pass'){s.passes++;s.completed+=Number(e.success);}if(e.type==='shot'){s.shots++;s.goals+=Number(e.goal);s.quality+=e.shot_quality;}if(e.type==='pressure')s.pressure++;}
  const prev=this.events.at(-2);for(const t of e.tracking||[]){const ps=this.playerStats[t.player_id];ps.top_speed_kmh=Math.max(ps.top_speed_kmh,t.speed_kmh);const old=prev?.tracking?.find(p=>p.player_id===t.player_id);if(old)ps.distance_m+=Math.hypot(t.x-old.x,t.y-old.y);}
  const recent=this.events.filter(x=>x.match_time_s>=e.match_time_s-30);
  let kind,rank=0,evidence=[e],facts={};
  if(e.type==='shot'){const loss=recent.filter(x=>x.type==='turnover'&&x.team_id!==e.team_id).at(-1);kind=loss?'transition':e.goal?'goal':'chance';rank=e.goal?100:65;facts={quality:e.shot_quality,goal:e.goal,seconds_since_turnover:loss?round(e.match_time_s-loss.match_time_s):null};if(loss)evidence=recent.filter(x=>x.match_time_s>=loss.match_time_s||(x.type==='pressure'&&x.team_id===e.team_id&&x.match_time_s>=loss.match_time_s-20));}
  else if(e.type==='pressure'){const p=recent.filter(x=>x.type==='pressure'&&x.team_id===e.team_id);if(p.length>=3){kind='pressure';rank=70;evidence=p;facts={pressures:p.length,window_s:30};}}
  else if(e.type==='pass'&&e.success&&e.end.x-e.start.x>=20){kind='progression';rank=45;facts={...passMetrics(e),progression_m:round(e.end.x-e.start.x)};}
  if(kind){const last=this.insights.filter(i=>i.kind===kind&&i.team_id===e.team_id).at(-1);if(!last||e.match_time_s-last.match_time_s>=15||e.goal){const ins={id:`ins-${e.id}`,kind,rank,team_id:e.team_id,player_id:e.player_id,match_time_s:e.match_time_s,evidence_ids:evidence.map(x=>x.id),facts,method:'deterministic-v1',uncertainty:kind==='transition'||kind==='pressure'?'pattern-not-causality':'observed-synthetic'};this.insights.push(ins);return{accepted:true,insight:ins};}}
  return{accepted:true};
 }
 state(){const now=this.events.at(-1)?.match_time_s??0;const recent=this.events.filter(e=>e.match_time_s>now-120);const changes=recent.filter(e=>['turnover','tackle'].includes(e.type)||(e.type==='pass'&&!e.success)).length;const h=recent.filter(e=>e.team_id==='harbour').length;return{time:now,stats:structuredClone(this.stats),control:recent.length?Math.round(h/recent.length*100):50,chaos:Math.min(100,Math.round(changes/Math.max(1,recent.length)*200)),window_s:120,events:this.events.length};}
}
export const COPY={
 de:{transition:'Vom Ballgewinn zur Chance',goal:'Der Moment, der zählt',chance:'Eine Chance entsteht',pressure:'Der Druck nimmt zu',progression:'Ein Pass öffnet Raum'},
 en:{transition:'From turnover to opportunity',goal:'The moment that matters',chance:'An opening appears',pressure:'The press is building',progression:'A pass opens up the pitch'},
 es:{transition:'De la recuperación a la ocasión',goal:'El momento decisivo',chance:'Aparece una oportunidad',pressure:'La presión aumenta',progression:'Un pase abre el campo'}
};
export function narrate(i,{lang='de',mode='fan'}={}){
 lang=COPY[lang]?lang:'en';const p=player(i.player_id).name,t=team(i.team_id).name,f=i.facts;let text='';
 const strings={de:{transition:`${t} kommt ${f.seconds_since_turnover} Sekunden nach dem gegnerischen Ballverlust zum Abschluss. Die kurze Umschaltphase spricht für eine Chance, bevor die Abwehr sich neu ordnen konnte.`,goal:`${p} trifft für ${t}. Der Abschluss verändert den Spielstand und damit die Ausgangslage für beide Teams.`,chance:`${p} kommt zum Abschluss. Die Position liefert einen Hinweis auf die Qualität dieser Chance, sagt aber keinen Treffer voraus.`,pressure:`${t} setzt in ${f.window_s} Sekunden ${f.pressures} Druckereignisse. Das deutet auf eine intensivere Pressingphase hin; daraus allein folgt noch kein erzwungener Fehler.`,progression:`${p} bringt den Ball mit einem erfolgreichen Pass ${f.progression_m} Meter näher ans gegnerische Tor. So wird Raum für den nächsten Angriff gewonnen.`},en:{transition:`${t} shoots ${f.seconds_since_turnover} seconds after an opposition turnover. The short transition suggests an opportunity before the defence could reset.`,goal:`${p} scores for ${t}. The finish changes the scoreline and the situation both teams must respond to.`,chance:`${p} gets a shot away. Its location offers context on chance quality, but does not predict a goal.`,pressure:`${t} records ${f.pressures} pressure events in ${f.window_s} seconds. This suggests a more intense press; it does not prove that pressure forced an error.`,progression:`${p} completes a pass that advances the ball ${f.progression_m} metres toward goal, creating territory for the next attack.`},es:{transition:`${t} remata ${f.seconds_since_turnover} segundos después de una pérdida rival. La transición rápida sugiere una ocasión antes de que la defensa pudiera reorganizarse.`,goal:`${p} marca para ${t}. El gol cambia el marcador y la situación de ambos equipos.`,chance:`${p} remata. La posición ayuda a contextualizar la ocasión, pero no predice un gol.`,pressure:`${t} registra ${f.pressures} eventos de presión en ${f.window_s} segundos. Esto sugiere una presión más intensa, sin demostrar que causara un error.`,progression:`${p} completa un pase que acerca el balón ${f.progression_m} metros a la portería rival.`}};
 text=strings[lang][i.kind];if(i.kind==='transition'&&f.goal)text+=lang==='de'?` ${p} trifft.`:lang==='es'?` ${p} marca.`:` ${p} scores.`;if(mode==='analyst')text+=` ${lang==='de'?'Belege':lang==='es'?'Evidencias':'Evidence'}: ${i.evidence_ids.length}. ${f.quality!==undefined?`Shot-quality proxy: ${f.quality.toFixed(3)} (${lang==='de'?'Heuristik, kein kalibriertes xG':'heuristic, not calibrated xG'}).`:f.difficulty!==undefined?`Pass difficulty: ${f.difficulty}/100; ${f.distance_m} m; ${f.speed_kmh} km/h.`:''}`;
 if(mode==='player')text=`${p} · ${text}`;
 return{title:COPY[lang][i.kind],text,lang,mode,source:'rules',evidence_ids:i.evidence_ids};
}
export function personalize(insights,{club='all',playerId='all',mode='fan',metric='all'}={}){return insights.filter(i=>(club==='all'||i.team_id===club)&&(mode!=='player'||playerId==='all'||i.player_id===playerId)&&(metric==='all'||(metric==='pressure'?i.kind==='pressure':metric==='passing'?i.kind==='progression':['chance','goal','transition'].includes(i.kind)))).slice().sort((a,b)=>b.match_time_s-a.match_time_s||b.rank-a.rank);}
export function overlay(i,prefs={},delayMs=0){const n=narrate(i,prefs);return{schema_version:'1.0',id:`overlay-${i.id}`,insight_id:i.id,synthetic:true,clock:'match-relative-ms',start_ms:Math.round(i.match_time_s*1000)+delayMs,end_ms:Math.round(i.match_time_s*1000)+delayMs+12000,priority:i.rank,locale:n.lang,headline:n.title,body:n.text,evidence_ids:i.evidence_ids,requires_editor_approval:true};}
export const overlayActive=(o,feedTimeMs)=>feedTimeMs>=o.start_ms&&feedTimeMs<o.end_ms;
export function recap(engine,prefs={}){const s=engine.state(),lang=prefs.lang||'de';const selected=personalize(engine.insights,prefs).sort((a,b)=>b.rank-a.rank||a.match_time_s-b.match_time_s).slice(0,5).sort((a,b)=>a.match_time_s-b.match_time_s);return{synthetic:true,as_of:clock(s.time),complete:s.time>=5390,score:`${s.stats.harbour.goals} : ${s.stats.vale.goals}`,title:lang==='de'?'Die Geschichte bisher':lang==='es'?'La historia hasta ahora':'The story so far',moments:selected.map(i=>({time:clock(i.match_time_s),...narrate(i,prefs)})),stats:s.stats};}
