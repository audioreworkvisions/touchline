import{clock,passMetrics,player,team}from'./dist/engine.mjs';
const local={
 de:{title:'Audio-Replay',intro:'Barrierefreies Audio-Replay des synthetischen Spiels.',quiet:'In diesem Abschnitt liegt kein ausgewählter Schlüsselmoment vor.',pass:'spielt einen erfolgreichen Pass über',failedPass:'verliert einen Passversuch',shot:'kommt zum Abschluss',goal:'erzielt ein Tor',pressure:'setzt den Gegner unter Druck',turnover:'verliert den Ball',tackle:'gewinnt den Zweikampf',throw:'bringt den Ball wieder ins Spiel',left:'auf der linken Seite',centre:'durch das Zentrum',right:'auf der rechten Seite',final:'Endstand'},
 en:{title:'Audio replay',intro:'Accessible audio replay of the synthetic match.',quiet:'There is no selected key moment in this section.',pass:'completes a pass over',failedPass:'misses a pass attempt',shot:'takes a shot',goal:'scores',pressure:'pressures the opponent',turnover:'loses the ball',tackle:'wins the tackle',throw:'returns the ball to play',left:'on the left side',centre:'through the centre',right:'on the right side',final:'Final score'},
 es:{title:'Repetición de audio',intro:'Repetición de audio accesible del partido sintético.',quiet:'No hay un momento clave seleccionado en este tramo.',pass:'completa un pase de',failedPass:'no completa un pase',shot:'remata',goal:'marca',pressure:'presiona al rival',turnover:'pierde el balón',tackle:'gana la entrada',throw:'vuelve a poner el balón en juego',left:'por la izquierda',centre:'por el centro',right:'por la derecha',final:'Marcador final'}
};
const key=e=>(e.type==='shot'&&e.goal?6:e.type==='shot'?5:e.type==='turnover'||e.type==='tackle'?4:e.type==='pressure'?3:e.type==='pass'&&!e.success?3:1)+e.pressure;
const lane=e=>e.end.y<23?'left':e.end.y>45?'right':'centre';
function describe(e,lang){
 const copy=local[lang],who=player(e.player_id).name,club=team(e.team_id).name;
 if(e.type==='shot')return`${club}: ${who} ${e.goal?copy.goal:copy.shot} ${copy[lane(e)]}.`;
 if(e.type==='pass'){const distance=passMetrics(e).distance_m;return`${who} ${e.success?`${copy.pass} ${distance} Meter ${copy[lane(e)]}`:copy.failedPass} (${club}).`;}
 return`${club}: ${who} ${copy[e.type]} ${copy[lane(e)]}.`;
}
export function createAudioReplay(match,{lang='de',teamId='all',playerId='all',detail='compact'}={}){
 if(!local[lang]||!['all','harbour','vale'].includes(teamId)||!['compact','detailed'].includes(detail)||(playerId!=='all'&&!player(playerId))||(playerId!=='all'&&teamId!=='all'&&player(playerId).team!==teamId))throw Error('Invalid replay preferences');
 const span=detail==='detailed'?180:600,segments=[];
 for(let start=0,index=0;start<match.duration_s;start+=span,index++){
  const end=Math.min(match.duration_s,start+span),events=match.events.filter(event=>event.match_time_s>=start&&event.match_time_s<end),focused=events.filter(event=>(teamId==='all'||event.team_id===teamId)&&(playerId==='all'||event.player_id===playerId||event.receiver_id===playerId)),pool=focused.length?focused:events,chosen=pool.slice().sort((a,b)=>key(b)-key(a)||a.match_time_s-b.match_time_s).slice(0,detail==='detailed'?2:3),copy=local[lang];
  const prefix=`${clock(start)} bis ${clock(end)}. `,text=chosen.length?`${prefix}${chosen.map(event=>describe(event,lang)).join(' ')}`:`${prefix}${copy.quiet}`;
  segments.push({id:`r${index+1}`,start_s:start,end_s:end,title:`${clock(start)}–${clock(end)}`,text,evidence_ids:chosen.map(event=>event.id)});
 }
 const goals=match.events.filter(event=>event.type==='shot'&&event.goal),score={harbour:goals.filter(event=>event.team_id==='harbour').length,vale:goals.filter(event=>event.team_id==='vale').length},copy=local[lang];
 segments.push({id:'r-final',start_s:match.duration_s,end_s:match.duration_s,title:'90:00',text:`${copy.final}: ${score.harbour} zu ${score.vale}.`,evidence_ids:goals.map(event=>event.id).length?goals.map(event=>event.id):[match.events.at(-1).id]});
 return{schema_version:'1.0',id:`audio-${match.seed}-${lang}-${teamId}-${playerId}-${detail}`,synthetic:true,title:copy.title,intro:copy.intro,focus:{team_id:teamId,player_id:playerId,detail},duration_s:match.duration_s,segments,summary:`${copy.final}: ${score.harbour} zu ${score.vale}.`,score};
}
