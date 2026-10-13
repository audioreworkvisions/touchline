# Fictional match podcast production

Run `node scripts/produce-podcast.mjs 42` from the repository root.
Requires Node 22+, FFmpeg and FFprobe on PATH, and the existing Azure Speech
configuration in `.env`. This performs billable speech synthesis.

The German episode is a chronological, condensed report from the existing
synthetic match, not a real match or a continuous 90-minute audio description.
The script includes an introduction, eighteen five-minute match windows,
half-time and a final report. All goals and their available preceding actions
are preserved. Unrecorded outcomes, crowd sounds and causal tactical claims are
not invented. The current source simulator remains a simplified demo, not a
validated realistic football simulation.

Outputs are ignored by Git under `outputs/podcasts/match-SEED/`:

- `episode.mp3`: one playable file with chapter metadata.
- `transcript.txt`: complete spoken text.
- `episode.json`: source event IDs, chapter audio times and measured duration.
- `chunks/`: reusable synthesis cache for interrupted production.

The producer measures the actual audio with FFprobe and adjusts the number of
selected events if needed. It only publishes an episode between 20 and 30
minutes, without padding silence or changing playback speed to meet that range.
It also decodes the finished file with FFmpeg as an integrity check.

This is an on-demand production command, not a public RSS feed or podcast-hosting
integration. Neural speech naturalness and accessibility still need listening
tests, particularly with blind and visually impaired fans. The voice remains
Azure Speech's standard German narrator; a more expressive model is not claimed.
