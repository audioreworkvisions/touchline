import http from'node:http';
import{readFile}from'node:fs/promises';
import{fileURLToPath}from'node:url';
import path from'node:path';
import{timingSafeEqual}from'node:crypto';
import{generateMatch,Engine,validateEvent}from'./dist/engine.mjs';
import{createNarrative}from'./narrator.mjs';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const parsedNumber=(s,min,max,def)=>{if(s===null||s===undefined)return def;const n=Number(s);if(!Number.isFinite(n)||n<min||n>max)throw Error('Invalid numeric parameter');return n;};
async function body(req){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>128000)throw Error('Request exceeds 128 KB');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
function authenticated(req,token){if(!token||token.length<24)return false;const given=Buffer.from(req.headers.authorization||''),expected=Buffer.from(`Bearer ${token}`);return given.length===expected.length&&timingSafeEqual(given,expected);}
export function createServer(config={}){
 const env={endpoint:process.env.AZURE_OPENAI_ENDPOINT,key:process.env.AZURE_OPENAI_API_KEY,deployment:process.env.AZURE_OPENAI_DEPLOYMENT,...config.ai};const token=config.token??process.env.TOUCHLINE_API_TOKEN;const imported=new Engine();let aiInFlight=0,aiRequests=[],streams=0;const cache=new Map(),matches=new Map();
 const getMatch=seed=>{if(!matches.has(seed)){if(matches.size>=8)matches.delete(matches.keys().next().value);matches.set(seed,generateMatch(seed));}return matches.get(seed);};
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; script-src 'self'; frame-ancestors 'self'");
  const json=(status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value));};
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/api/health'&&req.method==='GET')return json(200,{service:'touchline',version:'1.0.0',synthetic_only:true,ai_configured:Boolean(env.endpoint&&env.key&&env.deployment),ai_access_configured:Boolean(token?.length>=24)});
   if(url.pathname==='/api/stream'&&req.method==='GET'){
    if(streams>=24)return json(503,{error:'Stream capacity reached'});const seed=parsedNumber(url.searchParams.get('seed'),1,999999,42),speed=parsedNumber(url.searchParams.get('speed'),1,120,30);if(!Number.isInteger(seed))return json(400,{error:'Seed must be an integer'});
    const match=getMatch(seed),last=req.headers['last-event-id'];let ix=last?match.events.findIndex(e=>e.id===last)+1:0;if(last&&ix===0)return json(400,{error:'Unknown resume event'});
    res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache','connection':'keep-alive','x-accel-buffering':'no'});res.write(': touchline synthetic stream\n\n');streams++;let timer,closed=false;
    const next=()=>{if(closed)return;if(ix>=match.events.length){res.write('event: complete\ndata: {}\n\n');res.end();return;}const e=match.events[ix++];const writable=res.write(`id: ${e.id}\ndata: ${JSON.stringify(e)}\n\n`);const schedule=()=>{if(!closed)timer=setTimeout(next,Math.max(10,((match.events[ix]?.match_time_s??e.match_time_s)-e.match_time_s)*1000/speed));};if(writable)schedule();else res.once('drain',schedule);};
    req.on('close',()=>{closed=true;clearTimeout(timer);streams--;});next();return;
   }
   if(url.pathname.startsWith('/api/')){
    if(!authenticated(req,token))return json(401,{error:'Set a server API token of at least 24 characters and send it as a Bearer token.'});
    const origin=req.headers.origin;if(origin&&new URL(origin).host!==req.headers.host)return json(403,{error:'Cross-origin writes are not allowed'});
    if(url.pathname==='/api/events'&&req.method==='POST'){if(imported.events.length>=5000)return json(409,{error:'Demo ingest capacity reached; restart server for a new session'});const e=await body(req);validateEvent(e);return json(200,imported.ingest(e));}
    if(url.pathname==='/api/state'&&req.method==='GET')return json(200,{state:imported.state(),insights:imported.insights.slice(-50)});
    if(url.pathname==='/api/narrate'&&req.method==='POST'){
     const b=await body(req),seed=parsedNumber(b.seed,1,999999,42),asOf=parsedNumber(b.as_of,0,5400,0);if(!Number.isInteger(seed))return json(400,{error:'Seed must be an integer'});const prefs=b.preferences??{};if(!['de','en','es'].includes(prefs.lang)||!['fan','analyst','player'].includes(prefs.mode))return json(400,{error:'Invalid language or mode'});
     const engine=new Engine();for(const e of getMatch(seed).events){if(e.match_time_s>asOf)break;engine.ingest(e);}const insight=engine.insights.find(i=>i.id===b.insight_id);if(!insight)return json(404,{error:'Insight is not grounded in the requested match state'});
     const key=JSON.stringify([seed,insight.id,prefs.lang,prefs.mode]);if(cache.has(key))return json(200,cache.get(key));
     aiRequests=aiRequests.filter(t=>Date.now()-t<60000);if(aiInFlight>=2||aiRequests.length>=20)return json(429,{error:'Narration limit reached; use deterministic narration or retry later'});aiRequests.push(Date.now());aiInFlight++;
     try{const out=await createNarrative(insight,prefs,env,config.fetcher);if(out.source==='azure-openai'){if(cache.size>=200)cache.delete(cache.keys().next().value);cache.set(key,out);}return json(200,out);}finally{aiInFlight--;}
    }
    return json(404,{error:'Unknown API route'});
   }
   if(!['GET','HEAD'].includes(req.method))return json(405,{error:'Method not allowed'});
   let requested;try{requested=decodeURIComponent(url.pathname);}catch{return json(400,{error:'Invalid URL'});}
   if(requested.includes('\0'))return json(400,{error:'Invalid path'});const file=path.resolve(ROOT,'.'+(requested==='/'?'/index.html':requested));if(!file.startsWith(ROOT+path.sep))return json(403,{error:'Path rejected'});
   const data=await readFile(file);res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream','cache-control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
  }catch(e){if(res.headersSent){res.end();return;}json(e.code==='ENOENT'?404:400,{error:e.code==='ENOENT'?'Not found':e.message||'Request rejected'});}
 });server.requestTimeout=15000;server.headersTimeout=10000;return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT||8765);const host=process.env.HOST||'127.0.0.1';createServer().listen(port,host,()=>console.log(`Touchline ready: http://${host}:${port}`));}
