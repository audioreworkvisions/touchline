import {player, team, clock} from './dist/engine.mjs';

const number = value => new Intl.NumberFormat('de-DE', {maximumFractionDigits: 0}).format(value);
const scoreText = score => `Harbour FC ${score.harbour}, Vale United ${score.vale}`;

function position(point) {
 const depth = point.x < 35 ? 'im eigenen Drittel' : point.x < 70 ? 'im mittleren Drittel' : 'im Angriffsdrittel';
 return `${depth}, ungefähr ${number(105 - point.x)} Meter vor der gegnerischen Torlinie`;
}

function action(event) {
 const who = player(event.player_id).name;
 const club = team(event.team_id).name;
 const location = position(event.start);
 switch (event.type) {
  case 'pass': {
   const receiver = player(event.receiver_id).name;
   const direction = event.end.x - event.start.x > 5 ? 'nach vorn' : event.end.x - event.start.x < -5 ? 'zurück' : 'quer';
   return `${who} für ${club}, ${location}. Er spielt ${direction}, sucht ${receiver}. ${event.success ? `${receiver} erreicht der Ball. Der Pass sitzt!` : 'Doch der Pass kommt nicht an!'}`;
  }
  case 'shot':
   return `${who} für ${club}, ${location}. Er schließt ab! ${event.goal ? `Tor! Tor für ${club}! ${who} trifft!` : 'Kein Tor! Es bleibt beim bisherigen Spielstand.'}`;
  case 'turnover':
   return `${who} von ${club}, ${location}. Und da geht der Ball verloren!`;
  case 'tackle':
   return `${who} von ${club}, ${location}. Er geht in den Zweikampf! ${event.success ? `${who} setzt sich in dieser Aktion durch.` : 'Doch in diesem Duell gelingt ihm die Aktion nicht.'}`;
  case 'pressure':
   return `${who} von ${club}, ${location}. Er macht Druck auf den Gegner!`;
  case 'throw':
   return `Einwurf für ${club}. ${who}, ${location}, bringt den Ball ins Spiel. ${event.success ? 'Der Einwurf gelingt.' : 'Dieser Einwurf bleibt ohne Erfolg.'}`;
  default: throw Error(`Unsupported podcast event: ${event.type}`);
 }
}

export function createPodcast(match, {eventsPerChapter = 6} = {}) {
 if (!Number.isInteger(eventsPerChapter) || eventsPerChapter < 1 || eventsPerChapter > 20) throw Error('Invalid chapter event budget');
 if (!match.synthetic || match.duration_s !== 5400 || !match.events.length) throw Error('Podcast requires a complete synthetic 90-minute match');
 const chapters = [];
 const add = (title, text, events = []) => chapters.push({id: `chapter-${chapters.length + 1}`, title, text, evidence_ids: events.map(e => e.id)});
 add('Vor dem Spiel: Jetzt zählt jeder Ball!', `Harbour FC gegen Vale United! Zwei Mannschaften, ein Ball, und die große Frage: Wer macht heute den entscheidenden Unterschied? Mach dich bereit für Pässe, Zweikämpfe und die Momente vor dem Tor. Jetzt zählt jeder Ball!
 Das ist Touchline Hörfußball: eine fiktive Partie als verdichtetes Match-Hörspiel mit künstlicher Stimme, keine echte Liveübertragung. Wir nehmen dich mit ins Spiel. Du brauchst kein Bild: Wir nennen dir Spieler, Mannschaft und den Raum, in dem die Aktion stattfindet.
 Denk das Spielfeld immer aus Sicht der Mannschaft am Ball: hinten das eigene Drittel, dazwischen das Mittelfeld, vorn das Angriffsdrittel. Dazu hörst du die Entfernung zur gegnerischen Torlinie. So kannst du den Weg zum Tor verfolgen. Bei längeren Sprüngen wechseln wir ausdrücklich die Szene; nicht jeder Pass des Spiels ist zu hören.
 Noch steht es null zu null. Wer findet den freien Mitspieler? Wer kommt zum Abschluss? Die Antworten liefert das Spiel. Harbour FC. Vale United. Jetzt geht es los!`);
 const score = {harbour: 0, vale: 0};
 for (let start = 0; start < 5400; start += 300) {
  if (start === 2700) add('Halbzeit', `Halbzeit! ${scoreText(score)}. Eine Hälfte liegt hinter uns, eine liegt noch vor uns. Nimm diesen Spielstand mit in die Pause. Was bringt die zweite Hälfte? Kann sich das Kräfteverhältnis auf der Anzeigetafel noch verschieben? Wir verraten nichts vorweg. Gleich sind wir wieder bei den Spielern und beim Ball.`, match.events.filter(e => e.match_time_s < start && e.goal));
  const end = start + 300;
  const events = match.events.filter(e => e.match_time_s >= start && e.match_time_s < end);
  const selected = new Set(events.filter(e => e.goal));
  for (const goal of events.filter(e => e.goal)) {
   // Include the recorded approach to a goal without asserting causal links.
   for (const e of events.filter(e => e.match_time_s >= goal.match_time_s - 30 && e.match_time_s < goal.match_time_s)) selected.add(e);
  }
  const shot = events.find(e => e.type === 'shot');
  if (shot && selected.size < eventsPerChapter) selected.add(shot);
  for (let i = 0; i < eventsPerChapter && events.length && selected.size < eventsPerChapter; i++) selected.add(events[Math.floor(i * events.length / eventsPerChapter)]);
  const ordered = [...selected].sort((a, b) => a.match_time_s - b.match_time_s);
  const lines = [start === 0 ? 'Hinein in die Anfangsphase!' : start === 2700 ? 'Weiter geht es mit der zweiten Halbzeit!' : `Wir gehen weiter in die nächste Spielphase, nach ${start / 60} Minuten. ${scoreText(score)}.`];
  let previous;
  for (const event of ordered) {
   const transition = previous && event.match_time_s - previous.match_time_s > 20
    ? ['Etwas später, in einer neuen Szene.', 'Wir wechseln zu einer späteren Aktion.', 'Ein Sprung zur nächsten Szene.'][ordered.indexOf(event) % 3]
    : '';
   lines.push(`${transition ? `${transition} ` : ''}${action(event)}`);
   if (event.goal) { score[event.team_id]++; lines.push(`Der neue Spielstand: ${scoreText(score)}.`); }
   previous = event;
  }
  add(`${clock(start)} bis ${clock(end)}`, lines.join('\n\n'), ordered);
 }
 add('Schlussbericht', `Das war dieses Spiel! Nach zwei Halbzeiten steht fest: ${scoreText(score)}.
 ${score.harbour === score.vale ? 'Kein Sieger heute. Die beiden Mannschaften trennen sich unentschieden.' : `${team(score.harbour > score.vale ? 'harbour' : 'vale').name} entscheidet diese Partie für sich!`}
 Vom ersten ausgewählten Pass bis zum letzten Abschluss: Du warst dabei, mit Spielernamen, Spielstand und dem Weg zum Tor im Ohr.
 Das war Touchline Hörfußball. Ein fiktives Match-Hörspiel mit künstlicher Stimme auf Basis synthetischer Spieldaten. Keine echte Liveübertragung. Kapitel und Ereignisbelege findest du im begleitenden Transkript und in den Produktionsdaten. Bis zum nächsten Spiel!`, match.events.filter(e => e.goal));
 return {version: 2, seed: match.seed, synthetic: true, language: 'de', title: 'Touchline Hörfußball: Harbour FC gegen Vale United', score, chapters};
}
