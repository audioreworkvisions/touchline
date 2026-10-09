# Verification report

Date: 9 October 2026. Environment: Windows, Node.js v22.22.2. Results describe this local prototype and do not certify production readiness.

## Automated tests

**25 tests passed, 0 failed.** Command: `node --test tests/*.test.mjs`.

Coverage includes deterministic reproduction and changed seeds; valid events, identity and motion bounds across 20 seeds; known distance/speed calculation; duplicate and late-event handling; rejection of nonsynthetic events and mixed matches; exact score/pass totals; the six-event demo sequence; observed-only evidence; no future-event leakage; club/player/metric filtering; language and audience changes; exact overlay start and expiry; recap empty states; recomputation of shot quality; missing-credential fallback; invalid model references and numeric claims; valid mocked provider output; errors, malformed JSON and incomplete responses; endpoint allowlisting; HTTP health/static/API authorization; ingestion; SSE resumption; pixel-only transfer detection; missing-ball handling; and frame timestamp ordering.

The Azure inference tests use injected mock responses. They are not evidence of a real model call.

## Browser checks

Verified in the Codex browser against the local HTTP server:

- Match Studio loads, shows the expected score and responds to replay controls.
- The demo jump produces the 62:28 transition goal and the six-event evidence dialog.
- Analyst mode adds details; English stories and the generated recap contain the selected-language narrative.
- Player focus on Kai Santos changes both the selected story and the four player metrics.
- Broadcast approval starts the preview at the overlay time with 1× playback and a twelve-second lifetime.
- The Vision Lab completed 230 frames and reported four detected objects and two transfers.
- The server-stream button switches the app to live SSE delivery and advances the displayed clock.
- At a 390-pixel mobile viewport, the page had no horizontal overflow; the insight panel and controls remained readable.

Remaining checks before final submission: real Azure model output quality, deployment/network behaviour, actual jury permissions, screen-reader usability across a full session, and any official video/renderer contract requirements.

The separate one-file HTML bundle passed JavaScript syntax validation. Direct `file:` navigation is blocked by the automation browser's URL policy, so browser interaction tests were performed on the same application modules through the local HTTP server, not on the one-file bundle. Private Sites publication was attempted but blocked by automatic approval policy before source credentials could be passed to the upload helper.

## Local timing measurement

`scripts/benchmark.mjs` generated ten seeded matches and measured synchronous event validation, ingestion and deterministic narration. The report is saved in `benchmark.json`.

Observed run: 7,235 events, 598 stories, median approximately **0.09 ms**, 95th percentile approximately **0.218 ms**, maximum approximately **5.156 ms** per measured operation. These values are machine-specific microbenchmarks. They exclude generation, HTTP transport, browser rendering, model calls and Azure cold starts. They must not be presented as end-to-end latency or a production SLA.

## Infrastructure verification

The Bicep template compiled locally using Bicep CLI 0.41.2. The Dockerfile and configuration were inspected. Docker build, Azure resource validation/what-if, deployment, model quota, live inference and cloud monitoring were not performed. The compiled ARM artifact is an intermediate check, not proof of deployed resources.

## Known limitations

The simulator is deliberately simplified and not calibrated against real football. The tracking process is separate from event geometry. The Vision Lab only supports known synthetic colours. Rule-based narratives are not generative AI. Numeric/evidence checks do not prove semantic truth of future model outputs. The ingest state and approval state are not durable; there is no real renderer, multi-user identity or distributed scaling.

## Proposed evaluation after Azure connection

Use held-out seeds and manually labelled moment sequences; measure precision/recall for pressure clusters and transitions, unsupported claims by language, model response latency, fallback rate, event-to-overlay delay and editorial correction rate. Compare fan comprehension with and without the explanation. Report measured outcomes, not aspirational target numbers.
