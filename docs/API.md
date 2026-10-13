# API and integration contract

Base URL locally: `http://127.0.0.1:8765`. All supplied data is synthetic. The static Sites preview does not run these server routes.

## Routes

| Method and path | Authorization | Behaviour |
|---|---|---|
| GET `/api/health` | None | Service/version, whether AI credentials and API access are configured; no secrets |
| GET `/api/stream?seed=42&speed=30` | None | SSE event replay; integer seed 1–999999, speed 1–120 |
| POST `/api/events` | Bearer token | Validate and ingest a single synthetic event into the demo's in-memory engine |
| GET `/api/state` | Bearer token | Current imported state and last 50 insights |
| POST `/api/narrate` | Bearer token | Reconstruct a seeded insight and request a grounded Azure rewrite or rule fallback |

`TOUCHLINE_API_TOKEN` must have at least 24 characters. API responses use JSON. Maximum input body: 128 KB. Unauthorized requests return 401, disallowed origins 403, unknown routes/insights 404, capacity exhaustion 409 or 503 and narrative throttling 429. Invalid inputs return 400.

`POST /api/speech` requires the same authorization as the narration endpoint. It reconstructs a grounded insight, generates its validated narrative and returns an Azure Speech MP3 audio overlay.

## SSE

Each event uses its stable event ID:

```text
id: s42-0001
data: {"id":"s42-0001", "synthetic":true, ...}

```

The full emitted JSON is a valid event from `data/synthetic-42.jsonl`; the abbreviated example above illustrates framing only. Browsers automatically send `Last-Event-ID` on reconnect. The server resumes after that ID for the requested seed. On completion, it sends `event: complete` with `{}` data. Clients should close the EventSource after completion. There is a maximum of 24 active streams per process.

## Narration request

```json
{
  "seed": 42,
  "as_of": 3750,
  "insight_id": "ins-s42-0505",
  "preferences": {"lang":"en", "mode":"fan"}
}
```

Response fields include `title`, `text`, `evidence_ids`, `lang`, `mode` and `source` (`rules` or `azure-openai`). AI output additionally carries `requires_editor_approval: true`. A fallback includes a human-readable `warning`. Missing cloud credentials do not prevent deterministic explanations.

## Speech overlay request

```json
{
  "seed": 42,
  "as_of": 3750,
  "insight_id": "ins-s42-0505",
  "preferences": {"lang":"de", "mode":"fan"},
  "role": "commentator"
}
```

`role` must be `commentator` or `stadium`. The endpoint uses the same reconstructed insight and validated narration boundary as `/api/narrate`; the browser never supplies the text that Azure Speech reads. It returns an MP3 audio stream and records the selected neural voice in the `X-Touchline-Voice` response header. Configure `AZURE_AI_SPEECH_ENDPOINT`, `AZURE_AI_SPEECH_KEY` and `AZURE_AI_SPEECH_REGION` server-side. Requests are limited to one concurrent and ten per minute per process, with a bounded five-minute in-memory audio cache.

## Accessible audio replay

`POST /api/audio-replay` returns a deterministic, 90-minute scene plan from the requested synthetic match. It accepts `seed`, `preferences.lang`, `team_id` (`all`, `harbour`, `vale`), `player_id` (`all` or a roster ID), and `detail` (`compact` for six-minute chapters or `detailed` for three-minute chapters). Each chapter contains a stable ID, match-clock bounds, narration and source event IDs.

`POST /api/audio-replay/speech` accepts the same selection and a server-issued `segment_id`. It recreates the scene plan before synthesis, so callers cannot make Azure Speech read arbitrary text. It uses the slower `narrator` voice profile, sentence pauses and a 40-requests-per-minute replay limit. The route is designed as an accessible replay of synthetic data, not as live descriptive commentary or a substitute for a professional accessibility service.

## Overlay contract

See `data/sample-overlay.json` for the exact generated object. Required fields:

| Field | Meaning |
|---|---|
| schema_version | Current format `1.0` |
| id / insight_id | Stable overlay and originating insight IDs |
| synthetic | Always `true` for this application |
| clock | `match-relative-ms` |
| start_ms / end_ms | Inclusive start, exclusive expiry in match-clock milliseconds |
| priority | Current ranking weight; goal 100, pressure 70, chance 65, progression 45 |
| locale | `de`, `en`, `es` |
| headline / body | Personalized deterministic copy |
| evidence_ids | Source event IDs |
| requires_editor_approval | Draft state; the locally approved export sets this to false and `approved` to true |

The local flag is a UI demonstration, not a signed editorial authorization. A production renderer must validate the schema, enforce authenticated approval and revision history, map the clock to media timestamps, escape text and expire overlays. No proprietary renderer integration is claimed.
