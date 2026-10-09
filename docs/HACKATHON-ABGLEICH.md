# Touchline: Abgleich mit den ergänzten Hackathon-Angaben

Stand: 9. Oktober 2026. Grundlage ist der vom Nutzer bereitgestellte Textauszug „Im Spiel: Entwickler-Hackathon“. Die vollständigen Teilnahmebedingungen, insbesondere der erwähnte Abschnitt 8.3 zur Preislieferung, liegen weiterhin nicht vor. Die nachfolgenden Anforderungen stammen aus dem Auszug; Empfehlungen und Implementierungsstand sind davon getrennt.

## Was wir jetzt konkret wissen

| Vorgabe im Auszug | Konsequenz für Touchline |
|---|---|
| Neu gebautes Projekt, das die Challenge erfüllt | Entstehung und Änderungen nachvollziehbar dokumentieren; zulässigen Entwicklungszeitraum noch anhand der vollständigen Regeln prüfen |
| Synthetische, fußballrealistische Daten | Generator und Datenkarte beibehalten; die bislang getrennten Ballereignisse und Spielerbewegungen für höhere Realitätsnähe verbessern |
| Kurzer Projekt-Pitch mit Problem, Wirkung und tatsächlich eingesetzten Microsoft-/Azure-Technologien | Vorbereitete Integrationen eindeutig von nachgewiesenem Einsatz unterscheiden |
| Demonstrationsvideo **kürzer als 2 Minuten** | Bisheriges 3-Minuten-Skript ersetzen; neues Ziel 1:50 inklusive aller Titel und Schlussbilder |
| Video zeigt das Projekt auf seiner Zielplattform | Tatsächliche Browser- und Backend-Abläufe aufnehmen; keine bloßen Mockups als Funktion zeigen |
| Öffentliche Video-URL auf YouTube, Vimeo, Facebook Video oder Youku | Upload und öffentliche Zugänglichkeit vor Abgabe überprüfen |
| Öffentliche GitHub-Repository-URL | Quellcode veröffentlichen; ein ZIP oder privates Repository allein genügt nicht |
| Keine unerlaubten fremden Marken, Musik oder sonstigen geschützten Materialien im Video | Eigene UI, fiktive Clubs und eigene Grafiken verwenden; zusätzliche Assets nur mit geklärter Erlaubnis |

Eine öffentlich erreichbare **App-URL** wird im gelieferten Auszug nicht ausdrücklich als Pflicht genannt. Sie ist für die Jury hilfreich, ersetzt aber weder öffentliches Repository noch öffentliches Demo-Video. Die Azure-Anforderung des zuvor gelieferten Challenge-Briefings bleibt bestehen.

## Preise: wichtige Korrektur zur Finanzierungsannahme

Die folgenden Beträge sind **laut Auszug pro einzelnem Teammitglied** angegeben. Der Geldpreis soll jeweils als E-Geschenkkarte nach Abschnitt 8.3 ausgeliefert werden.

| Kategorie | Geldpreis als E-Geschenkkarte je Mitglied | Weitere genannte Leistungen je Mitglied |
|---|---:|---|
| Hauptpreis, 1. Platz | 4.000 US-Dollar | Ein Spielticket mit geschätztem Wert 1.000 US-Dollar, ein Shop-Gutschein über 50 US-Dollar; zusätzlich soziale Promotion genannt |
| Hauptpreis, 2. Platz | 2.500 US-Dollar | Ein Spielticket mit geschätztem Wert 1.000 US-Dollar, ein Shop-Gutschein über 50 US-Dollar; zusätzlich soziale Promotion genannt |
| Beste Nutzung von Microsoft Foundry | 1.500 US-Dollar | Shop-Gutschein über 50 US-Dollar; zusätzlich soziale Promotion genannt |
| Beste Unternehmenslösung | 1.500 US-Dollar | Shop-Gutschein über 50 US-Dollar; zusätzlich soziale Promotion genannt |
| Beste Multi-Agenten-Orchestrierung | 1.500 US-Dollar | Shop-Gutschein über 50 US-Dollar; zusätzlich soziale Promotion genannt |
| Beste Azure Cloud Native Integration | 1.500 US-Dollar | Shop-Gutschein über 50 US-Dollar; zusätzlich soziale Promotion genannt |

Der Auszug bestätigt **keinen einzelnen Geldgewinn von 50.000 US-Dollar** und keine Barauszahlung. Er belegt auch nicht, ob Kategorien kombinierbar sind oder wie groß ein zulässiges Team sein darf. Spielticket und Shop-Gutschein sind Sachleistungen; deren geschätzten Wert nicht als verfügbares Entwicklungsbudget behandeln. Anbieter, Einlösbarkeit und Bedingungen der E-Geschenkkarte müssen in Abschnitt 8.3 geprüft werden. Eine Aufsummierung hypothetischer Teamgrößen oder Kategorien wäre derzeit nicht belastbar.

## Bewertungsrubrik: fünf gleich gewichtete Kriterien

Keine selbst vergebenen Jury-Punkte: Die folgende Tabelle beschreibt belegbare Stärken und Lücken, keine Prognose des Ergebnisses.

| Kriterium | Gewicht | Stand des Prototyps | Wichtigster nächster Nachweis |
|---|---:|---|---|
| Technologische Umsetzung | 20 % | Ausführbare App, Server, dokumentierte Daten/Methoden, 25 zuvor bestandene Tests, kompilierte Bicep-Datei | Tatsächlicher Azure-/KI-Betrieb; kompakte Kernmodule in besser lesbare Funktionsabschnitte aufteilen |
| Agentisches Design & Innovation | 20 % | Regel-Engine und optionaler einzelner Modellaufruf; **noch keine Agentenorchestrierung** | Sinnvolle spezialisierte KI-Rollen mit gemeinsamen Belegen, überprüfbarer Übergabe und Fehlerbehandlung |
| Praktische Wirkung & Anwendbarkeit | 20 % | Plausibler redaktioneller Arbeitsablauf; lokale Freigabe und Erklärbarkeit | Nutzer-/Redaktionstest, gemessener Korrekturaufwand, belastbarere Zustands- und Freigabespeicherung |
| User Experience & Präsentation | 20 % | Browser- und Mobilansicht geprüft; Personalisierung, Evidenzdialog und Overlay | Verständliche Vorführung in weniger als 120 Sekunden mit sichtbarer Frontend-/Backend-Funktion |
| Einhaltung der Hackathon-Kategorie | 20 % | Fünfstufige Pipeline und synthetische Daten vorhanden; Cloud und Vision nur teilweise erfüllt | Azure bereitstellen, echten KI-Aufruf zeigen, geforderten Auto-Eventing-Umfang und Fußballrealismus absichern |

**Größte aktuelle Lücke:** Touchline sieht bereits wie ein Produkt aus, erfüllt aber das gleich stark gewichtete agentische Kriterium bislang nur sehr eingeschränkt. Ein einzelner Sprachmodell-Aufruf oder mehrere umbenannte Regelfunktionen sind kein Nachweis gezielter Agentenzusammenarbeit.

## Empfohlene Wettbewerbsstrategie

Den Hauptpreis als Gesamtziel verfolgen: eine durchgängige, ehrliche und nachvollziehbare Lösung. Als mögliche zusätzliche Schwerpunkte passen Unternehmensnutzen und Azure-Integration zur bestehenden Richtung. Das ist eine Produktstrategie, keine bestätigte Mehrfachteilnahme oder Gewinnprognose.

Für einen Foundry- oder Multi-Agenten-Sonderpreis fehlen derzeit die zentralen technischen Nachweise. Diese Kategorien erst beanspruchen, wenn eine tatsächliche Implementierung und ihr Nutzen gezeigt werden können. Für den Cloud-Native-Sonderpreis reicht eine unbereitgestellte Bicep-Datei ebenfalls nicht.

### Geplanter Ausbau der Agentenfunktion — noch nicht implementiert

1. **Match Analyst:** erhält berechnete Fakten und Ereignis-IDs und erstellt eine taktische Interpretation mit ausdrücklich benannter Unsicherheit.
2. **Evidence Reviewer:** prüft, ob die Interpretation durch die ausgewählten Belege gedeckt ist; gibt einen konkreten Annahme-/Ablehnungsgrund zurück. Deterministische Zahlen- und ID-Prüfungen bleiben zusätzlich erhalten.
3. **Audience Editor:** formuliert ausschließlich die akzeptierten Inhalte für Modus und Sprache. Bei neuen oder widersprüchlichen Aussagen wird der Entwurf erneut geprüft oder verworfen.

Gemeinsamer Zustand: Match-ID, Insight-ID, Quellereignisse, Fakten, Entwurfsversion, Prüfergebnis, Sprache und Laufstatus. Ein prüfbarer Ablauf protokolliert jede Übergabe. Ein Timeout, eine Ablehnung oder eine fehlerhafte Ausgabe führt zu einer begrenzten Überarbeitung oder zur vorhandenen Regel-Erklärung. Die menschliche Broadcast-Freigabe bleibt der letzte Schritt.

Die Zusammenarbeit müsste gegenüber dem bestehenden Einzelaufruf gemessen werden: Zahl unbelegter Aussagen, redaktioneller Korrekturen, zusätzliche Laufzeit und Kosten. Mehr Agenten allein sind kein Qualitätsnachweis. Die schnelle Statistikverarbeitung bleibt unabhängig von der langsameren Textgenerierung.

## Reihenfolge bis zur tatsächlichen Einreichung

1. Vollständige Regeln und Frist beschaffen; Entwicklungszeitraum, Teamgröße, Teilnahmeberechtigung, KI-Unterstützung und Preisbedingungen bestätigen.
2. Reales Azure-/Modell-Setup und Budget festlegen; den vorhandenen Server auf Azure ausführen und einen echten Modellaufruf nachweisen.
3. Agentische Verarbeitung implementieren und gegen den Einzelaufruf evaluieren, falls Zeit und Budget das erlauben. Andernfalls die begrenzte Umsetzung ehrlich beschreiben und die Auswirkung auf das 20-%-Kriterium akzeptieren.
4. Fußballrealismus und den erforderlichen Videoanalyseumfang klären; bekannte Einschränkungen gezielt beheben.
5. Öffentliches GitHub-Repository mit Startanleitung, Datenkarte, Tests, Architektur und zutreffendem Implementierungsstatus vorbereiten. Veröffentlichung erst ausdrücklich freigeben lassen.
6. Einen echten Durchlauf aufnehmen, auf 1:50 schneiden und die Gesamtdatei auf weniger als 120 Sekunden prüfen. Öffentliches Video auf einem der genannten Dienste bereitstellen.
7. Pitch und Pflicht-URLs in die Projektseite übernehmen und die finale Einreichung kontrollieren.

Diese Ergänzung verändert die Dokumentation und Prioritäten. Sie implementiert keine zusätzlichen Agenten, stellt keine Cloud-Ressourcen bereit und veröffentlicht weder Repository noch Video.
