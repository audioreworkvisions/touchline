import test from 'node:test';
import assert from 'node:assert/strict';
import {generateMatch} from '../dist/engine.mjs';
import {scorePlayer,syntheticHistory,playerPulse,pulseAction} from '../dist/player-pulse.mjs';

const match=generateMatch(42);
test('future events never affect current index, explanations or tracking',()=>{
  const cutoff=3745,prefix=match.events.filter(e=>e.match_time_s<=cutoff);
  assert.deepEqual(playerPulse(match.events,42,'p10',cutoff),playerPulse(prefix,42,'p10',cutoff));
  assert.ok(playerPulse(match.events,42,'p10',cutoff).tracking.every(t=>t.time_s<=cutoff&&t.time_s>=cutoff-60));
});
test('curated goal change is explained by its event and all deltas reconcile',()=>{
  const before=scorePlayer(match.events,'p10',3745),after=scorePlayer(match.events,'p10',3750);
  const last=after.contributions.at(-1);
  assert.match(last.label,/Tor/);assert.equal(last.time_s,3748);
  assert.equal(Number((after.index-before.index).toFixed(1)),last.delta);
  assert.equal(Number((50+after.contributions.reduce((s,c)=>s+c.delta,0)).toFixed(1)),after.index);
});
test('histories are reproducible, distinct, synthetic, and exclude current fixture',()=>{
  const history=syntheticHistory(42,'p10');
  assert.equal(history.length,48);assert.equal(history.filter(m=>m.season==='S4').length,12);
  assert.deepEqual(history,syntheticHistory(42,'p10'));
  assert.notDeepEqual(history,syntheticHistory(43,'p10'));
  assert.notDeepEqual(history,syntheticHistory(42,'p7'));
  assert.ok(history.every(m=>m.synthetic&&m.relative_fixture<0&&m.id!==match.id&&m.played_seconds===5400));
  assert.ok(history.every(m=>m.events.every(e=>e.synthetic&&e.player_id==='p10'&&e.match_time_s<5400)));
});
test('season median uses the same scoring formula and same minute',()=>{
  const time=1800,report=playerPulse(match.events,42,'p7',time);
  const indices=syntheticHistory(42,'p7').filter(m=>m.season==='S4').map(m=>scorePlayer(m.events,'p7',time).index).sort((a,b)=>a-b);
  assert.equal(report.season.median,Number(((indices[5]+indices[6])/2).toFixed(1)));
  assert.equal(report.career.matches,48);assert.equal(report.season.matches,12);
});
test('missing actions and goalkeeper coverage are not represented as a real rating',()=>{
  assert.equal(playerPulse(match.events,42,'p10',0).current.index,null);
  const keeper=playerPulse(match.events,42,'p1',5400);
  assert.equal(keeper.current.supported,false);assert.equal(keeper.current.index,null);
  assert.equal(keeper.season.median,null);assert.equal(keeper.career.median,null);
});
test('bounded scores preserve exact displayed attribution under saturation',()=>{
  const base=match.events.find(e=>e.type==='shot');
  const events=Array.from({length:30},(_,i)=>({...base,id:`goal${i}`,player_id:'p10',goal:true,match_time_s:i,sequence:i+1}));
  const result=scorePlayer(events,'p10',100);
  assert.equal(result.index,100);assert.equal(result.contributions.at(-1).delta,0);
  assert.equal(Number(result.contributions.reduce((sum,c)=>sum+c.delta,50).toFixed(1)),100);
});
test('role weighting is explicit and failed actions reduce the index',()=>{
  assert.equal(pulseAction({type:'tackle',success:true},'CB').points,1.4);
  assert.equal(pulseAction({type:'tackle',success:true},'ST').points,1);
  assert.equal(pulseAction({type:'turnover'},'ST').points,-1.5);
  assert.equal(pulseAction({type:'pass',success:false},'CM').points,-.8);
});
