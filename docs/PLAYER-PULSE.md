# Player Pulse – Spieler, Index und synthetische Historie

## Ausprobieren

Die HTML-Demo öffnen, im Feld **Spieler** Kai Santos auswählen und den Replay starten. Der markierte Spieler trägt seinen Namen und Live-Index auf dem Spielfeld. Die helle Spur zeigt seine letzten 60 Spielsekunden. Die Positionszeile nennt den letzten Datenzeitpunkt und das Alter der Position; die Anzeige interpoliert keine unbekannten Positionen.

Unter dem Spielfeld zeigt **Player Pulse** den Live-Index, die Saison und die Karriere. Bei Seed 42 steht Kai um 62:25 bei **59,9**. Der Demo-Knopf springt hinter sein Tor: um 62:30 steht er bei **65,4**. Der Eintrag „Tor und Abschlussqualität +5,5“ öffnet die Berechnung samt Originalereignis `s42-0505`.

Spielerwechsel, Zurückspulen und ein neuer Seed berechnen sämtliche Werte neu. „Spielerbericht“ exportiert den aktuellen Stand einschließlich Aktionsbeiträgen, Laufspur und Vergleichswerten; der allgemeine Spielbericht enthält diese ebenfalls. Die Auswahl bleibt lokal im Browser gespeichert. Spielertracking und Player Pulse funktionieren auch im Fanmodus; der Modus „Spieler im Fokus“ filtert zusätzlich Geschichten und Kennzahlen.

## Vergleichsgrundlage

Pro Spieler und Seed erzeugt `dist/player-pulse.mjs` reproduzierbar 48 fiktive frühere Einsätze in vier fiktiven Saisons S1–S4. Die jüngste Saison S4 enthält zwölf Spiele. Alle Spiele liegen im Modell vor der aktuellen Begegnung, dauern 90 Minuten und verwenden dieselbe feste Spielerrolle. Es gibt in diesem Modell keine Auswechslungen, Verletzungen oder Altersentwicklung. Die Karriere umfasst auch die zwölf Spiele der aktuellen Saison; beide Referenzgruppen sind daher nicht unabhängig.

Verglichen wird der Median des Index **bis zur gleichen Spielminute**. Um 62:30 fließen aus historischen Spielen nur Aktionen bis 62:30 ein. Das aktuelle Spiel wird nie seiner eigenen Vergleichsbasis hinzugefügt. Historische Spiele ohne gewertete Aktion bis zum Zeitpunkt werden aus dem Median ausgeschlossen; ohne Daten erscheint ein Strich. Die Stichprobenzahlen bezeichnen den gesamten historischen Bestand.

## Formel pulse-v1

Startwert 50 plus Summe der Aktionsbeiträge, begrenzt auf 0–100, angezeigt mit einer Nachkommastelle:

| Aktion | Beitrag |
|---|---:|
| Erfolgreicher Pass | 0,2 + positive Vorwärtsmeter / 40 + Passschwierigkeit / 200 |
| Fehlpass | −0,8 |
| Abschluss | 2 × Shot Quality |
| Tor | zusätzlich +5 |
| Druckaktion | +0,6 bei LB/CB/RB/DM, sonst +0,4 |
| Gewonnener Tackle | +1,4 bei LB/CB/RB/DM, sonst +1 |
| Verlorener Tackle | −0,6 |
| Ballverlust | −1,5 |
| Einwurf | 0 |

Passschwierigkeit und Shot Quality sind die vorhandenen geometrischen Heuristiken der Match-Engine. Live und Historie verwenden exakt dieselben Funktionen. Die angezeigte Veränderung ist die Differenz zweier gerundeter, begrenzter Indexstände. Dadurch bleiben die sichtbaren Veränderungen auch bei 0 oder 100 nachvollziehbar. Im Torbeispiel beträgt der ungerundete Beitrag 5,476 und die sichtbare Veränderung 5,5.

Unter fünf gewerteten Aktionen erscheint „vorläufig“. Ohne gewertete Aktion wird kein Index angezeigt. Torhüter lassen sich verfolgen, erhalten aber keinen Index, weil der Ereigniskatalog keine Paraden oder anderen ausreichenden Torwartmerkmale besitzt. Die Formel berechnet sich deterministisch; ein Sprachmodell vergibt keine Punkte.

## Aussagegrenzen und Validierung

Dies ist ein **unkalibrierter Beitrags- und Aktivitätsindex**, keine objektive Spielernote, kein Marktwert, keine Fitnessmessung und keine Vorhersage. Rollenabhängige Gewichte sind offengelegte Designentscheidungen; sie sind nicht empirisch validiert. Historische Ereignisse werden pro Spieler generiert und sind keine vollständigen konsistenten Mannschaftsspiele. Laufwege und Ballaktionen des bestehenden Simulators sind unabhängig erzeugt; die Spur ist deshalb eine Tracking-Demonstration, kein Nachweis einer passenden taktischen Position. Laufdistanz und Geschwindigkeit verändern den Index nicht.

Die Tests prüfen Zukunftsausschluss, Torbeleg und Änderungssumme, historische Reproduzierbarkeit und Trennung vom aktuellen Spiel, zeitgleichen Medianvergleich, fehlende Daten, Torwartabdeckung, Begrenzung und Rollenregeln. Zusätzlich im Browser geprüft: Demo-Tor, Belegdialog, Spielerwechsel, Torwartzustand, Zurücksetzen zum Anpfiff und mobile Darstellung bei 390 Pixel Breite ohne horizontalen Überlauf. Alle 32 automatisierten Tests bestanden (der HTTP-Test nach Freigabe des lokalen Netzwerkzugriffs). Der Beispielbericht liegt unter `data/player-pulse-42-p10.json`; die Exporte enthalten auch die einzelnen historischen Referenzwerte. Azure-Deployment und echtes Broadcast-Tracking werden durch diese Erweiterung nicht behauptet.
