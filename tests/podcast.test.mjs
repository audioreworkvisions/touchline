import test from 'node:test';
import assert from 'node:assert/strict';
import {generateMatch} from '../dist/engine.mjs';
import {createPodcast} from '../podcast.mjs';
test('podcast is reproducible, chronological and preserves every goal', () => {
 const match = generateMatch(42), episode = createPodcast(match);
 assert.deepEqual(episode, createPodcast(match));
 assert.deepEqual(episode.score, {harbour: 1, vale: 1});
 assert.equal(episode.chapters.length, 21);
 const matchChapters = episode.chapters.filter(c => c.title.includes(' bis '));
 const evidence = matchChapters.flatMap(c => c.evidence_ids);
 assert.equal(new Set(evidence).size, evidence.length);
 const times = evidence.map(id => match.events.find(e => e.id === id).match_time_s);
 assert.deepEqual(times, [...times].sort((a,b) => a-b));
 for (const goal of match.events.filter(e => e.goal)) assert.ok(evidence.includes(goal.id));
 assert.match(episode.chapters[0].text, /fiktive/);
 const half = episode.chapters.find(c => c.title === 'Halbzeit');
 assert.match(half.text, /Harbour FC 0, Vale United 1/);
});
test('podcast event budget is bounded and controls content volume', () => {
 const match = generateMatch(42);
 assert.throws(() => createPodcast(match, {eventsPerChapter: 0}));
 const words = budget => createPodcast(match, {eventsPerChapter: budget}).chapters.map(c => c.text).join(' ').split(/\s+/).length;
 assert.ok(words(10) > words(6));
});
test('match drama opens energetically without per-action clock announcements', () => {
 const episode = createPodcast(generateMatch(42));
 const spoken = episode.chapters.map(c => c.text).join('\n');
 assert.match(episode.chapters[0].text, /Jetzt zählt jeder Ball!/);
 assert.doesNotMatch(spoken, /Willkommen|Sekunde|Minute \d|Spielabschnitt von|aufgezeichneten Aktionen|synthetischen Partie/);
 assert.match(spoken, /keine echte Liveübertragung/i);
 assert.match(spoken, /gegnerischen Torlinie/);
 assert.match(spoken, /später|späteren|Sprung/);
 assert.ok(episode.chapters.some(c => c.title === '00:00 bis 05:00'));
});
