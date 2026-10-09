# Synthetic data card

## Provenance

Created by the supplied simulator. No real Premier League event feed, tracking dataset, player biography, club badge or broadcast video is used or redistributed. All names and clubs are fictional. Source version: `engine.mjs`, VERSION 1.0.0. Seed 42 generates 722 events for a synthetic 90-minute match, ending 1–1 with the current source.

## Generation

The generator uses a seeded pseudorandom number generator, possession ownership, a current ball position, successful/unsuccessful passes, pressure events, tackles, turnovers, throw-ins and shots. Coordinates are bounded to a 105 × 68 metre field. Each team's event coordinates are normalized toward the opponent goal at x=105; the pitch renderer mirrors the away team.

Tracking samples are generated after sorting all events. Each sample follows a bounded random velocity; derived displacement never exceeds the configured maximum speed. The tracking frame is an illustrative synthetic motion process, not a tactical multi-agent simulator. Actor/receiver locations are not guaranteed to coincide with the independently generated tracking positions, so pass arrows represent event coordinates and player dots represent separate synthetic samples.

The curated sequence at 62:00–62:28 always contains three Harbour pressure events, a Vale turnover, a forward Harbour pass and a Harbour goal. The automatic background generator leaves that interval open. This supports a repeatable explanation demo and is not used as an unbiased statistical evaluation set.

Match time omits real halftime wall-clock delay and stoppage time. Fouls, cards, offside, substitutions, set-piece rules and injuries are not simulated. Event volume and outcomes are not calibrated against a real competition; some seeds may yield unusual scores or shot totals.

## Units and metrics

| Metric | Definition | Interpretation |
|---|---|---|
| Pass distance | Euclidean distance between start and end in metres | Geometric event distance |
| Pass accuracy | Successful passes / attempted passes | Exact count in processed event prefix |
| Ball / throw speed | Distance / duration × 3.6 | Mean flight speed in km/h; not instantaneous radar speed |
| Pass difficulty | `100 × clamp(0.5 × distance/60 + 0.4 × pressure + 0.1 × abs(dy)/68, 0, 1)` | Transparent, uncalibrated score, not a learned completion probability |
| Shot quality | `clamp(0.55 × exp(-distance_to_goal/20) × (1 - 0.35 × pressure), .02, .55)` | Uncalibrated proxy, explicitly not real xG |
| Player distance | Sum of sampled Euclidean displacements | Sampled synthetic path length, underestimates unobserved curved paths |
| Top speed | Maximum synthetic sample speed | 30 km/h activates a player-mode threshold label |
| Control | Team share of events in last 120 seconds | Activity share, not possession duration |
| Chaos | `min(100, 200 × transition_events / all_events)` in last 120 seconds | Failed passes, tackles and turnovers count as transitions |
| Pressure cluster | At least three same-team pressure events in 30 seconds | Windowed heuristic with 15-second repeat suppression |
| Transition story | Shot within 30 seconds of the latest opponent turnover | Temporal association; no causal proof |

`pressure` is a simulator input from 0 to 1, not an independently measured tactical quantity. No confidence percentages are fabricated for the rule explanations.

## Example event fields

`id`, `match_id`, `sequence`, `synthetic`, `source`, `period`, `match_time_s`, `type`, `team_id`, `player_id`, `receiver_id`, `start`, `end`, `duration_s`, `pressure`, `success`, `tracking`. Shots add `goal` and a computed `shot_quality`. The validator recomputes shot quality at ingestion and rejects invalid bounds, identities or ordering.

## Vision data

The Vision Lab generates 630 × 408 RGBA frames at a simulated 20 Hz. Three colour-coded players and a yellow ball form two controlled transfers. A nearest-centroid classifier is trained from three labelled RGB samples per class; thresholded pixels yield object centroids. A temporal state machine estimates nearest-player possession, transfer distance and mean speed.

The detector receives only RGBA arrays, dimensions and timestamps. It does not read the renderer's ball coordinates or event labels. Player identity comes from unique synthetic colours; this is not jersey-number recognition. Quantization, occlusion and limited frame rate affect estimates. This model is not suitable for arbitrary real-world footage.

## Intended use and limits

Suitable for demonstrable pipelines, UI exploration, reproducibility tests, evidence traceability and controlled timing experiments. Unsuitable for scouting, betting, real player evaluation, broadcast accuracy claims or comparisons with actual Premier League statistics.


## Player Pulse: Historische Vergleichsdaten

Zusätzlich erzeugt `player-pulse.mjs` je Spieler und Seed 48 vorangegangene fiktive 90-Minuten-Einsätze in S1–S4, davon zwölf in S4. Dies sind individuelle Aktionsverläufe, keine vollständigen Mannschaftsspiele. Live und Historie werden bis zum gleichen Zeitpunkt mit derselben transparenten Indexformel ausgewertet. Keine echten Saison-, Karriere- oder Gesundheitsdaten. Details und Grenzen: [PLAYER-PULSE.md](PLAYER-PULSE.md).
