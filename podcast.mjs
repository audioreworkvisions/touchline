import {player, team, clock} from './dist/engine.mjs';

const number = value => new Intl.NumberFormat('de-DE', {maximumFractionDigits: 0}).format(value);
const time = seconds => `Minute ${Math.floor(seconds / 60)}, Sekunde ${Math.floor(seconds % 60)}`;
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
   return `${who}, ${club}, ${location}. Ein Pass ${direction} zu ${receiver}. ${event.success ? 'Der Ball kommt an.' : 'Der Ball kommt nicht an.'}`;
  }
  case 'shot':
   return `${who} für ${club}, ${location}. Der Abschluss! ${event.goal ? `Tor für ${club}! ${who} trifft.` : 'Kein Tor. Die genaue Art des Fehlschlags ist nicht erfasst.'}`;
  case 'turnover':
   return `${club}, ${who}, ${location}. Ballverlust! Die Kontrolle über die weitere Aktion ist damit zunächst offen.`;
  case 'tackle':
   return `${who} von ${club}, ${location}, geht in einen Zweikampf. ${event.success ? 'Eine erfolgreiche Aktion.' : 'Diese Aktion gelingt nicht.'}`;
  case 'pressure':
   return `${who} von ${club} setzt den Gegner unter Druck. Der Ort dieser Pressingaktion: ${location}.`;
  case 'throw':
   return `${club}: Einwurf von ${who}, ${location}. ${event.success ? 'Erfolgreich ausgeführt.' : 'Die Aktion bleibt ohne Erfolg.'}`;
  default: throw Error(`Unsupported podcast event: ${event.type}`);
 }
}

export function createPodcast(match, {eventsPerChapter = 6} = {}) {
 if (!Number.isInteger(eventsPerChapter) || eventsPerChapter < 1 || eventsPerChapter > 20) throw Error('Invalid chapter event budget');
 if (!match.synthetic || match.duration_s !== 5400 || !match.events.length) throw Error('Podcast requires a complete synthetic 90-minute match');
 const chapters = [];
 const add = (title, text, events = []) => chapters.push({id: `chapter-${chapters.length + 1}`, title, text, evidence_ids: events.map(e => e.id)});
 add('Willkommen und Orientierung', `Willkommen zu Touchline Hörfußball. Harbour FC gegen Vale United. Eine fiktive Begegnung, erzählt aus synthetisch erzeugten Spieldaten. Du hörst eine zeitlich verdichtete Reportage, keine reale Übertragung und keine lückenlose Live-Audiodeskription.
 Wir begleiten beide Halbzeiten in chronologischer Reihenfolge. Zeitsprünge werden angesagt. Die Spielzeit ist nicht die Laufzeit dieser Audiodatei. Jeder ausgewählte Moment nennt Mannschaft, Spieler und Ort der Aktion. Zur Orientierung verwenden wir das eigene Drittel, das mittlere Drittel und das Angriffsdrittel, jeweils aus Sicht der handelnden Mannschaft. Die Entfernung zur gegnerischen Torlinie hilft, die Situation einzuordnen. Links und rechts lassen wir weg, weil die Daten dafür keine verlässliche Hörperspektive festlegen.
 Nicht erfasst sind unter anderem Zuschauerreaktionen, Schiedsrichterpfiffe, Verletzungen und Auswechslungen. Wir erfinden diese Geräusche oder Ereignisse nicht dazu. Auch taktische Absichten sind keine beobachteten Fakten. Den Spielstand nennen wir nach jedem Tor und an den Abschnittsgrenzen. Noch steht es null zu null. Beginnen wir mit den ersten aufgezeichneten Aktionen.`);
 const score = {harbour: 0, vale: 0};
 for (let start = 0; start < 5400; start += 300) {
  if (start === 2700) add('Halbzeit', `45 Minuten liegen hinter uns. Halbzeitstand: ${scoreText(score)}. Wir machen einen kurzen gedanklichen Halt. Die erste Hälfte ist abgeschlossen. Gleich geht es mit den aufgezeichneten Aktionen der zweiten Hälfte weiter. Die Raumangaben bleiben auf die jeweils handelnde Mannschaft bezogen. Es gibt keine verlässlichen Angaben zu einer Kabinenansprache oder zu Wechseln; darüber spekulieren wir nicht.`, match.events.filter(e => e.match_time_s < start && e.goal));
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
  const lines = [`Spielabschnitt von Minute ${start / 60} bis Minute ${end / 60}. Aktueller Stand zu Beginn: ${scoreText(score)}.`];
  for (const event of ordered) {
   lines.push(`${time(event.match_time_s)}. ${action(event)}`);
   if (event.goal) { score[event.team_id]++; lines.push(`Der neue Spielstand: ${scoreText(score)}.`); }
  }
  lines.push(`Stand nach ${end / 60} Minuten: ${scoreText(score)}. Wir springen zum nächsten Abschnitt.`);
  add(`${clock(start)} bis ${clock(end)}`, lines.join('\n\n'), ordered);
 }
 add('Schlussbericht', `Das Ende unserer synthetischen Partie ist erreicht. Nach 90 Spielminuten lautet der Endstand: ${scoreText(score)}.
 ${score.harbour === score.vale ? 'Damit endet diese Begegnung unentschieden.' : `${team(score.harbour > score.vale ? 'harbour' : 'vale').name} hat diese fiktive Begegnung gewonnen.`}
 Wir haben ausgewählte Aktionen beider Mannschaften verfolgt, die Toraktionen eingeordnet und den Spielstand laufend aktualisiert. Der Podcast ist eine verdichtete Darstellung, kein Ersatz für eine vollständige Analyse. Im beiliegenden Transkript findest du die Kapitel; die Produktionsdaten enthalten die Ereignisbelege.
 Danke fürs Zuhören bei Touchline Hörfußball. Diese Folge wurde mit einer künstlichen Stimme produziert. Die Mannschaften, Spieler und Spieldaten sind fiktiv.`, match.events.filter(e => e.goal));
 return {version: 1, seed: match.seed, synthetic: true, language: 'de', title: 'Touchline Hörfußball: Harbour FC gegen Vale United', score, chapters};
}
