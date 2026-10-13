import test from'node:test';import assert from'node:assert/strict';import{generateMatch}from'../dist/engine.mjs';import{createAudioReplay}from'../audio-replay.mjs';
test('audio replay covers a full match with grounded, deterministic scenes',()=>{
 const replay=createAudioReplay(generateMatch(42),{lang:'de',teamId:'harbour',playerId:'p10',detail:'detailed'});
 assert.equal(replay.synthetic,true);assert.equal(replay.segments.length,31);assert.equal(replay.segments[0].start_s,0);assert.equal(replay.segments.at(-1).id,'r-final');assert.equal(replay.segments.at(-1).end_s,5400);assert.ok(replay.segments.every(segment=>segment.text.length>10));assert.ok(replay.segments.every(segment=>segment.evidence_ids.length>0));
});
test('audio replay rejects incompatible team and player focus',()=>assert.throws(()=>createAudioReplay(generateMatch(42),{teamId:'vale',playerId:'p1'})));
