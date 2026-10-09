import test from'node:test';import assert from'node:assert/strict';import{createServer}from'../server.mjs';import{generateMatch}from'../dist/engine.mjs';
test('HTTP integration: health, assets, auth, ingest, narrative grounding, SSE resume',async()=>{
 const token='test-only-token-at-least-24-characters',s=createServer({token,ai:{endpoint:'',key:'',deployment:''}});await new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${s.address().port}`;const auth={'authorization':`Bearer ${token}`,'content-type':'application/json'};
 try{
  assert.equal((await(await fetch(base+'/api/health')).json()).service,'touchline');assert.equal((await fetch(base+'/')).status,200);assert.equal((await fetch(base+'/dist/nope')).status,404);
  assert.equal((await fetch(base+'/api/events',{method:'POST',body:'{}'})).status,401);
  const e=generateMatch().events[0];const post=()=>fetch(base+'/api/events',{method:'POST',headers:auth,body:JSON.stringify(e)});
  assert.equal((await(await post()).json()).accepted,true);assert.equal((await(await post()).json()).reason,'duplicate');
  assert.equal((await fetch(base+'/api/events',{method:'POST',headers:{...auth,origin:'https://untrusted.example'},body:JSON.stringify(e)})).status,403);
  assert.equal((await fetch(base+'/api/narrate',{method:'POST',headers:auth,body:JSON.stringify({seed:42,as_of:0,insight_id:'invented',preferences:{lang:'en',mode:'fan'}})})).status,404);
  const controller=new AbortController(),res=await fetch(base+'/api/stream?seed=42&speed=120',{headers:{'last-event-id':e.id},signal:controller.signal});assert.equal(res.status,200);const reader=res.body.getReader();let text='';while(!text.includes('data:')){const part=await reader.read();text+=new TextDecoder().decode(part.value);}assert.ok(text.includes(generateMatch().events[1].id));controller.abort();
  assert.equal((await fetch(base+'/api/stream?seed=1.5')).status,400);
 }finally{s.closeAllConnections();await new Promise(resolve=>s.close(resolve));}
});
