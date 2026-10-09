# Touchline: Spielmomente verstehen, Geschichten belegen

## Projekt in einem Satz

Touchline macht aus synthetischen Fußballereignissen eine gemeinsame, überprüfbare Faktenbasis und übersetzt sie in die passende Geschichte für Fans, Analysten und die Senderegie.

**Leitfrage:** „Was hat sich gerade verändert, warum könnte das wichtig sein, und woran kann ich das erkennen?“

## Das Problem

Ein Spielstand erklärt weder den Weg zu einer Chance noch eine neue Druckphase. Gleichzeitig überfordert eine Liste von Kennzahlen viele Zuschauer. Eine Redaktion braucht kurze Einblendungen, ein Analyst die Details, ein neuer Fan verständlichen Kontext. Drei getrennte Systeme würden Daten und Aussagen leicht auseinanderlaufen lassen.

Touchline erzeugt deshalb zunächst einen strukturierten Insight mit Ereignisbelegen. Erst danach werden Sprache, Detailgrad und Ausspielung gewählt. Die Interpretation bleibt an beobachtete Ereignisse gebunden.

## Die zentrale Vorführung

In Minute 62 übt Harbour FC mehrfach Druck aus. Vale United verliert den Ball. Luca Vale spielt einen progressiven Pass auf Kai Santos. Zehn Sekunden nach dem Ballverlust schließt Santos ab und erzielt den Ausgleich.

Die Fanansicht erklärt die schnelle Umschaltphase in normaler Sprache. Der Analyst sieht die Dauer, die Belegzahl und den als Heuristik gekennzeichneten Shot-Quality-Wert. Der Spielerfokus zeigt Santos' Aktionen und Laufmetriken. Die Regie kann den Moment prüfen und ein strukturiertes Overlay für zwölf Spielsekunden freigeben.

Der Belegdialog enthält sechs zeitgestempelte Ereignisse. Die Erklärung sagt ausdrücklich, dass ein zeitliches Muster keinen bewiesenen Kausalzusammenhang darstellt. Diese Szene ist kuratiert und als solche dokumentiert; der restliche Spielverlauf wird aus einem Seed erzeugt.

## Produkt und Zielgruppen

| Zielgruppe | Frage | Umsetzung |
|---|---|---|
| Gelegenheitsfan | Warum sollte ich auf diesen Moment achten? | Kurze, verständliche Erklärung ohne überladene Kennzahlen |
| Analyst | Welche Daten stützen die Interpretation? | Detailmodus, Belege, Formeln und Unsicherheitskennzeichnung |
| Spielerfan | Was trägt mein Lieblingsspieler bei? | Spielerfilter, Pässe, Abschlüsse, Distanz und Spitzengeschwindigkeit |
| Redaktion | Kann dieser Text rechtzeitig auf Sendung? | Sichtbare Belege, lokale Freigabe, Zeitfenster und maschinenlesbarer Export |
| Internationales Publikum | Kann ich die Geschichte in meiner Sprache verstehen? | Erzählungen und Zusammenfassungen auf Deutsch, Englisch und Spanisch |

## Umsetzung der fünf Stufen

1. **Aufnehmen:** synthetischer Generator oder validierter API-Ingest; Server-Feed über SSE mit letzter Ereignis-ID zur Wiederaufnahme.
2. **Interpretieren:** zustandsbasierte Statistiken, 30-Sekunden-Muster für Druck und Umschalten, 120-Sekunden-Fenster für Aktivität und Chaos.
3. **Erklären:** Fakten und Beleg-IDs bilden den Insight. Regeln liefern sofort eine Erklärung. Der vorbereitete Azure-OpenAI-Adapter kann dieselben Fakten sprachlich aufbereiten.
4. **Ausspielen:** Spielfeld, Storyboard, Zusammenfassung oder Overlay-JSON. Die Vorschau berücksichtigt Freigabe, Startzeit und Ablauf.
5. **Personalisieren:** Modus, Club, Spieler, Sprache und Ereignistyp bestimmen Auswahl und Detailgrad. Der Faktenkern bleibt gleich.

## Anforderungsmatrix

| Anforderung aus dem Briefing | Projektumsetzung | Status / Nachweis |
|---|---|---|
| Synthetische Fußballereignisse | Generator mit 90-Minuten-Spiel, Seeds, Pässen, Schüssen, Tackles, Druck, Ballverlusten, Einwürfen | Implementiert, JSONL und Tests |
| Echtzeitverarbeitung | Inkrementelle Engine, Browser-Replay und SSE | Lokal geprüft; Azure-Netzwerklatenz noch offen |
| Spielernamen | Verknüpfung synthetischer Spieler-ID mit fiktivem Kader | Implementiert; keine Namenserkennung aus realem Video |
| Lauf- und Geschwindigkeitsanzeigen | Trackingdistanz, Spitzengeschwindigkeit, 30-km/h-Schwelle im Spielerfokus | Implementiert auf synthetischen Samples |
| Passqualität | Distanz, Genauigkeit und transparenter Schwierigkeitswert | Implementiert, unkalibrierte Heuristik |
| Ball- und Einwurfgeschwindigkeit | Strecke / Flugzeit im Ereignis-Replay; Ballbewegung im Vision-Labor | Implementiert; keine echte Radarmessung |
| Auto-Eventing aus Video | Pixelmodell auf synthetischer Bildfolge mit Übergabe- und Geschwindigkeitserkennung | Begrenzter Proof of Concept, keine Broadcast-CV |
| Narrative und Performance-Kontext | Regeln, Detailmodus, Spielerfokus und optionale Azure-Neuformulierung | Regeln geprüft; echter Azure-Aufruf noch offen |
| Kontrolle, Chaos, Druck, Rhythmus | Erklärte Heuristiken mit festem Zeitfenster | Implementiert, keine Taktik-Ground-Truth |
| Mehrsprachigkeit | DE/EN/ES-Erzählungen und Zusammenfassungen | Implementiert; UI deutsch |
| Studio-/Streaming-Overlay | Zeitfenster, Priorität, Sprache, Evidenz, Freigabe und JSON | Implementiert in lokaler Vorschau; Renderer-Integration offen |
| Azure-Laufzeit | Node-Container, Bicep, Secrets, Modelladapter | Vorbereitet; noch nicht auf Azure bereitgestellt |

## Technische Architektur

Der gleiche JavaScript-Analysekern läuft im Browser und im Node-Server. So kann die Jury das Produkt auch ohne Cloud-Zugang ausprobieren. Die vorgesehene Azure-Variante betreibt denselben Server in Azure Container Apps und verwendet ein vorhandenes Azure-OpenAI-Modell-Deployment.

Der Browser erhält synthetische Ereignisse über SSE. Er aktualisiert Statistiken und Geschichten inkrementell. Für eine KI-Neuformulierung sendet er nur Seed, Spielzeit, Insight-ID und Präferenzen an den Server. Der Server berechnet den Insight selbst erneut. Er übernimmt keine frei erfundenen Client-Fakten in den Modellprompt.

Geheimnisse bleiben serverseitig. KI-Aufrufe benötigen ein eigenes Zugriffstoken, sind zeitlich und mengenmäßig begrenzt und liefern bei Fehlern die belegte Regelversion. Ein LLM-Aufruf steht nicht im kritischen Pfad der Statistikberechnung.

## Differenzierung für eine überzeugende Einreichung

- **Prüfbare Erklärungen:** Die Jury kann von einer Aussage auf ihre tatsächlichen Ereignisse zurückgehen.
- **Eine Story in mehreren echten Nutzungsformen:** Personalisierung verändert Auswahl und Erklärung, nicht nur die Oberfläche.
- **Redaktionelle Kontrolle:** Einblendungen besitzen eine definierte Lebensdauer und benötigen Freigabe.
- **Reproduzierbare Demo:** Derselbe Seed erzeugt denselben Spielablauf. Die Vorführszene ist jederzeit erreichbar.
- **Ehrlicher Umgang mit Modellen:** Heuristiken, Cloud-KI und experimentelle Pixelanalyse werden voneinander unterschieden.

Diese Eigenschaften sind eine begründete Positionierung, keine verifizierte Behauptung, dass kein anderes Team Vergleichbares baut. Ein Gewinn lässt sich nicht versprechen.

## Wirkung und Weiterentwicklung

Die zu prüfende Produkthypothese lautet: Kontext mit sichtbaren Belegen erleichtert das Verstehen wichtiger Spielphasen und reduziert den redaktionellen Aufwand für erste Entwürfe. Als mögliche spätere Nutzer kommen Broadcaster, Streaminganbieter und Fan-Plattformen infrage.

Ein ehrlicher Nutzertest vergleicht „Scoreboard allein“ mit „Scoreboard plus Touchline“. Messgrößen: Verständnisfragen, Zeit bis zum Verstehen, Zahl redaktioneller Korrekturen und subjektive Informationsüberlastung. Es liegen noch keine Nutzerstudie, Umsatzzahlen oder nachgewiesenen Produktivitätsgewinne vor.

Nächste sinnvolle Ausbaustufen: reales Azure-Deployment, überprüfte KI-Ausgaben in drei Sprachen, persistenter Matchzustand, Renderer-Adapter, verbesserter Fußballsimulator mit konsistenter Ball-/Spielerphysik und ein trainiertes Vision-Modell für anspruchsvollere synthetische Videos. Echte Spieldaten wären nur nach geklärten Nutzungsrechten ein separater Schritt.

## Offizielle Referenzen und offene Teilnahmefragen

- [Hackathon-Portal](https://innovationstudio.microsoft.com/hackathons/insidethegamedeveloperhackathon): vom Nutzer bereitgestellt; bei der Prüfung am 9. Oktober 2026 war eine Microsoft-Anmeldung erforderlich.
- [Microsoft Reactor: Inside the Game](https://developer.microsoft.com/en-us/reactor/series/S-1709/): bestätigt den Rahmen synthetischer, erklärbarer Spielintelligenz für Broadcast und Streaming.
- [Azure OpenAI v1](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle?tabs=key): Grundlage der Modellanbindung.
- [Container Apps Ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-how-to): Grundlage der HTTP-Bereitstellung.

Der am 9. Oktober 2026 nachgereichte Textauszug konkretisiert die Abgabe: ein neu gebautes Projekt, ein kurzer Pitch, eine öffentliche GitHub-URL und eine öffentliche Video-URL auf YouTube, Vimeo, Facebook Video oder Youku. Das Demonstrationsvideo muss **kürzer als zwei Minuten** sein. Das Demo-Skript ist deshalb auf 1:50 angepasst.

Die Bewertung umfasst fünf gleich gewichtete Bereiche: technologische Umsetzung, agentisches Design/Innovation, praktische Wirkung, UX/Präsentation und Kategorieeinhaltung, jeweils 20 %. Die bislang fehlende echte Agentenorchestrierung ist daher eine wesentliche Lücke. Ein geplanter Analyst-/Belegprüfer-/Redakteur-Ablauf ist im [Hackathon-Abgleich](HACKATHON-ABGLEICH.md) beschrieben und ausdrücklich noch nicht implementiert.

Für den ersten Platz nennt der Auszug **4.000 US-Dollar pro Teammitglied als E-Geschenkkarte**, daneben Spielticket, Shop-Gutschein und Promotion. Ein einzelner Geldgewinn über 50.000 US-Dollar ist damit nicht belegt. Abgabefrist, Teilnahmeberechtigung, Teamgröße, zulässiger Entwicklungszeitraum, KI-Unterstützung, Lizenzvorgaben, Kombinierbarkeit von Preisen und der vollständige Abschnitt 8.3 zur Preislieferung müssen noch anhand der vollständigen Regeln geprüft werden.
