import test from'node:test';import assert from'node:assert/strict';import{speechScript,synthesizeSpeech}from'../speech.mjs';
test('speech scripts use a role-specific neural voice and escape narration text',()=>{
 const script=speechScript('Harbour < Vale & gewinnt', 'de', 'stadium');
 assert.equal(script.voice,'de-DE-KillianNeural');assert.match(script.ssml,/Achtung, Stadion/);assert.match(script.ssml,/Harbour &lt; Vale &amp; gewinnt/);
 assert.throws(()=>speechScript('Text','de','invalid'));
});
test('speech synthesis sends secure SSML to the configured Azure region',async()=>{
 let request;const output=await synthesizeSpeech('Belegter Moment.',{endpoint:'https://unit.cognitiveservices.azure.com',key:'test-key',region:'swedencentral'},'de','commentator',async(url,init)=>{request={url,init};return{ok:true,headers:new Headers({'content-type':'audio/mpeg'}),arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer};});
 assert.equal(request.url,'https://swedencentral.tts.speech.microsoft.com/cognitiveservices/v1');assert.equal(request.init.headers['x-microsoft-outputformat'],'audio-24khz-48kbitrate-mono-mp3');assert.equal(output.contentType,'audio/mpeg');assert.deepEqual([...output.audio],[1,2,3]);
});
