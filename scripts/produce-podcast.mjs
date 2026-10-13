import {mkdir, readFile, writeFile, rename, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateMatch} from '../dist/engine.mjs';
import {createPodcast} from '../podcast.mjs';
import {synthesizeSpeech} from '../speech.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
try { process.loadEnvFile(path.join(root, '.env')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const seed = Number(process.argv[2] || 42);
if (!Number.isInteger(seed) || seed < 1 || seed > 999999) throw Error('Seed must be an integer from 1 to 999999');
const folder = path.join(root, 'outputs', 'podcasts', `match-${seed}`);
const cache = path.join(folder, 'chunks');
await mkdir(cache, {recursive: true});
function run(command, args) {
 const result = spawnSync(command, args, {encoding: 'utf8', windowsHide: true});
 if (result.error) throw result.error;
 if (result.status !== 0) throw Error(`${command} failed: ${result.stderr}`);
 return result.stdout.trim();
}
const duration = file => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file]));
run('ffmpeg', ['-version']);
run('ffprobe', ['-version']);
const config = {endpoint: process.env.AZURE_AI_SPEECH_ENDPOINT, key: process.env.AZURE_AI_SPEECH_KEY, region: process.env.AZURE_AI_SPEECH_REGION};
const match = generateMatch(seed);
let budget = 3, finished = false;
for (let attempt = 0; attempt < 3; attempt++) {
 const podcast = createPodcast(match, {eventsPerChapter: budget});
 const entries = [];
 for (const chapter of podcast.chapters) {
  const hash = createHash('sha256').update(`narrator-v1:${chapter.text}`).digest('hex');
  const file = path.join(cache, `${hash}.mp3`);
  try { await readFile(file); } catch (error) {
   if (error.code !== 'ENOENT') throw error;
   console.log(`Synthesizing ${chapter.title}`);
   const result = await synthesizeSpeech(chapter.text, config, 'de', 'narrator');
   await writeFile(file, result.audio);
  }
  const seconds = duration(file);
  if (!Number.isFinite(seconds) || seconds <= 0) throw Error(`Invalid audio for ${chapter.id}`);
  entries.push({file, seconds});
 }
 const rawDuration = entries.reduce((sum, entry) => sum + entry.seconds, 0);
 console.log(`Measured duration: ${(rawDuration / 60).toFixed(2)} minutes; event budget ${budget}`);
 if (rawDuration < 1200 || rawDuration > 1800) {
  const next = Math.max(1, Math.min(20, Math.round(budget * 1500 / rawDuration)));
  if (next === budget) throw Error('Cannot reach requested duration with the supported event budget');
  budget = next;
  continue;
 }
 const list = path.join(folder, 'concat.txt'), metadata = path.join(folder, 'chapters.ffmeta');
 const draft = path.join(folder, 'episode.pending.mp3'), final = path.join(folder, 'episode.mp3');
 await writeFile(list, entries.map(entry => `file '${entry.file.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
 let elapsed = 0;
 const chapterMetadata = podcast.chapters.map((chapter, i) => {
  chapter.audio_start_s = elapsed; elapsed += entries[i].seconds; chapter.audio_end_s = elapsed;
  return `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(chapter.audio_start_s * 1000)}\nEND=${Math.round(elapsed * 1000)}\ntitle=${chapter.title}`;
 });
 await writeFile(metadata, `;FFMETADATA1\ntitle=${podcast.title}\nartist=Touchline\ncomment=Fiktives Spiel. Synthetische Daten und KI-Stimme.\n${chapterMetadata.join('\n')}`);
 run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-i', metadata, '-map_metadata', '1', '-map_chapters', '1', '-c:a', 'libmp3lame', '-b:a', '96k', draft]);
 const seconds = duration(draft);
 if (!Number.isFinite(seconds) || seconds < 1200 || seconds > 1800) throw Error(`Final episode duration outside 20-30 minutes: ${seconds}`);
 run('ffmpeg', ['-v', 'error', '-i', draft, '-f', 'null', '-']);
 await rename(draft, final);
 podcast.audio_duration_s = seconds;
 await writeFile(path.join(folder, 'episode.json'), JSON.stringify(podcast, null, 2));
 await writeFile(path.join(folder, 'transcript.txt'), podcast.chapters.map(c => `${c.title}\n\n${c.text}`).join('\n\n'));
 await rm(list); await rm(metadata);
 console.log(`Verified podcast: ${final}\nDuration: ${(seconds / 60).toFixed(2)} minutes`);
 finished = true;
 break;
}
if (!finished) throw Error('Requested duration not achieved; no episode published');
