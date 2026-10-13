const VOICES={
 de:{commentator:'de-DE-ConradNeural',stadium:'de-DE-KillianNeural',narrator:'de-DE-KatjaNeural'},
 en:{commentator:'en-US-GuyNeural',stadium:'en-US-DavisNeural',narrator:'en-US-JennyNeural'},
 es:{commentator:'es-ES-AlvaroNeural',stadium:'es-ES-ArnauNeural',narrator:'es-ES-ElviraNeural'}
};
const INTRO={
 de:{commentator:'Live aus dem Touchline-Studio: ',stadium:'Achtung, Stadion: ',narrator:''},
 en:{commentator:'Live from the Touchline studio: ',stadium:'Attention, stadium: ',narrator:''},
 es:{commentator:'En directo desde el estudio Touchline: ',stadium:'Atención, estadio: ',narrator:''}
};
const xml=value=>String(value).replace(/[<>&'"]/g,char=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[char]));
export function speechScript(text,lang,role){
 if(!VOICES[lang]||!VOICES[lang][role]||typeof text!=='string'||!text.trim())throw Error('Invalid speech request');
 const spoken=xml(INTRO[lang][role]+text).replace(/([.!?])\s+/g,'$1<break time="350ms"/>');
 return{voice:VOICES[lang][role],ssml:`<speak version="1.0" xml:lang="${lang}"><voice name="${VOICES[lang][role]}"><prosody rate="${role==='stadium'?'+8%':role==='narrator'?'-7%':'0%'}">${spoken}</prosody></voice></speak>`};
}
export async function synthesizeSpeech(text,{endpoint,key,region},lang,role,fetcher=fetch){
 if(!endpoint||!key||!region)throw Error('Azure Speech is not configured');
 const origin=new URL(endpoint);if(origin.protocol!=='https:'||!origin.hostname.endsWith('.cognitiveservices.azure.com')||origin.username||origin.password||!/^[a-z0-9]+$/.test(region))throw Error('Unsupported Azure Speech endpoint');
 const script=speechScript(text,lang,role),response=await fetcher(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,{method:'POST',headers:{'content-type':'application/ssml+xml','ocp-apim-subscription-key':key,'x-microsoft-outputformat':'audio-24khz-48kbitrate-mono-mp3','user-agent':'touchline/1.0'},signal:AbortSignal.timeout(15000),body:script.ssml});
 if(!response.ok)throw Error(`Azure Speech HTTP ${response.status}`);
 const contentType=response.headers.get('content-type')||'';if(!contentType.startsWith('audio/'))throw Error('Azure Speech returned a non-audio response');
 return{audio:Buffer.from(await response.arrayBuffer()),contentType,voice:script.voice};
}
