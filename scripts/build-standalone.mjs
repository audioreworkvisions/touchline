import{readFile,writeFile}from'node:fs/promises';
const root=new URL('../dist/',import.meta.url);
const read=name=>readFile(new URL(name,root),'utf8');
const [html,css,engine,vision,pulse,pulseUI,app]=await Promise.all(['index.html','style.css','engine.mjs','vision.mjs','player-pulse.mjs','pulse-ui.mjs','app.mjs'].map(read));
const js=[engine,vision,pulse,pulseUI,app].map(s=>s.replace(/^import.*;\r?\n/gm,'')).join('\n').replace(/^export /gm,'');
const result=html.replace('<link rel="stylesheet" href="style.css">',`<style>${css.replace(/^@import[^;]+;/m,'')}</style>`).replace('<script type="module" src="app.mjs"></script>',`<script type="module">${js}</script>`);
await writeFile(new URL('../../Touchline-Demo.html',import.meta.url),result);console.log('Standalone Touchline-Demo.html created. Open directly in a browser; cloud/API features require the server version.');
