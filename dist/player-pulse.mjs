import {player, rng, clamp, round, shotQuality, passMetrics} from './engine.mjs';

export const PULSE_VERSION = 'pulse-v1';
// Same weights and clock cutoff for the live match and every historical match.
export function pulseAction(e, role) {
  const defence = ['LB','CB','RB','DM'].includes(role);
  if(e.type==='pass') return {label:e.success?'Pass angekommen':'Pass fehlgeschlagen', points:e.success ? .2 + Math.max(0,e.end.x-e.start.x)/40 + passMetrics(e).difficulty/200 : -.8};
  if(e.type==='shot') return {label:e.goal?'Tor und Abschlussqualität':'Abschlussqualität', points:shotQuality(e)*2 + (e.goal?5:0)};
  if(e.type==='pressure') return {label:'Druckaktion',points:defence?.6:.4};
  if(e.type==='tackle') return {label:e.success?'Tackle gewonnen':'Tackle verloren',points:e.success?(defence?1.4:1):-.6};
  if(e.type==='turnover') return {label:'Ballverlust',points:-1.5};
  return {label:'Einwurf · ohne Indexwertung',points:0};
}

export function scorePlayer(events, playerId, asOf) {
  const p=player(playerId); if(!p) throw new Error('Unknown player');
  if(!Number.isFinite(asOf)||asOf<0) throw new Error('Invalid clock');
  let raw=50, previous=50;
  const contributions=[];
  for(const e of events.filter(e=>e.player_id===playerId&&e.match_time_s<=asOf).sort((a,b)=>a.match_time_s-b.match_time_s||a.sequence-b.sequence)) {
    const action=pulseAction(e,p.role); raw+=action.points;
    const value=round(clamp(raw,0,100),1);
    contributions.push({event_id:e.id,time_s:e.match_time_s,label:action.label,points:round(action.points,3),delta:round(value-previous,1),index:value}); previous=value;
  }
  const rated=contributions.filter(c=>c.points!==0).length;
  return {supported:p.role!=='GK',index:p.role==='GK'||!rated?null:previous,raw_points:round(raw-50,3),rated_events:rated,provisional:rated<5,contributions:p.role==='GK'?[]:contributions};
}

const historyCache=new Map();
export function syntheticHistory(seed, playerId) {
  const key=`${seed}:${playerId}`; if(historyCache.has(key)) return historyCache.get(key);
  const p=player(playerId); if(!p) throw new Error('Unknown player');
  const random=rng((Number(seed)*997+Number(playerId.slice(1))*7919)>>>0), matches=[];
  // Four fictional seasons, twelve complete appearances each. All precede the live fixture.
  for(let season=1;season<=4;season++) for(let fixture=1;fixture<=12;fixture++) {
    const id=`history-${seed}-${playerId}-S${season}-${fixture}`, events=[];
    for(let time=45+random()*160;time<5400;time+=70+random()*210) {
      const r=random(), type=r<.55?'pass':r<.68?'pressure':r<.80?'tackle':r<.91?'turnover':'shot';
      const start={x:20+random()*70,y:5+random()*58},end=type==='shot'?{...start}:{x:clamp(start.x+random()*45-12,0,105),y:clamp(start.y+random()*30-15,0,68)};
      events.push({id:`${id}-e${events.length+1}`,sequence:events.length+1,match_id:id,synthetic:true,source:'synthetic-history-v1',player_id:playerId,team_id:p.team,type,match_time_s:Math.floor(time),start,end,duration_s:1+random()*3,pressure:random(),success:random()<.78,goal:type==='shot'&&random()<.13});
    }
    matches.push({id,season:`S${season}`,fixture,relative_fixture:matches.length-48,played_seconds:5400,synthetic:true,events});
  }
  historyCache.set(key,matches); return matches;
}

export function playerPulse(events, seed, playerId, asOf) {
  const current=scorePlayer(events,playerId,asOf), history=syntheticHistory(seed,playerId);
  const summarize=matches=>{
    const reference_scores=matches.map(m=>({match_id:m.id,season:m.season,relative_fixture:m.relative_fixture,index:scorePlayer(m.events,playerId,asOf).index}));
    const values=reference_scores.map(m=>m.index).filter(v=>v!==null).sort((a,b)=>a-b);
    const median=values.length?round((values[Math.floor((values.length-1)/2)]+values[Math.ceil((values.length-1)/2)])/2):null;
    return {matches:matches.length,available:values.length,median,delta:median!==null&&current.index!==null?round(current.index-median):null,reference_scores};
  };
  const samples=events.filter(e=>e.match_time_s<=asOf&&e.match_time_s>=asOf-60).map(e=>({time_s:e.match_time_s,...e.tracking?.find(t=>t.player_id===playerId)})).filter(t=>t.player_id);
  return {version:PULSE_VERSION,synthetic:true,player_id:playerId,as_of_s:asOf,current,season:summarize(history.filter(m=>m.season==='S4')),career:summarize(history),tracking:samples,history_definition:'48 previous full matches: 12 in S4; 36 in S1–S3. Same clock cutoff. No current match in baseline.'};
}
