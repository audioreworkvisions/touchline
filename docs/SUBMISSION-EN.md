# Touchline — Every moment, explained.

**Tagline:** One match. Every fan's perspective. Every story backed by evidence.

## Short project pitch

Touchline turns synthetic football events into explainable stories for fans and broadcast teams. Our working browser and Node.js prototype links every insight to source events, personalizes the explanation and exports timed overlays. We have prepared Azure Container Apps infrastructure and an Azure OpenAI narration adapter, but have not yet verified live cloud inference. The problem we address is the gap between raw match statistics and trustworthy, audience-appropriate context. The current version uses deterministic narratives; agent orchestration is a planned next step.

## Inspiration

A scoreline tells us what happened, but rarely explains the sequence that made it possible. Fans also need different levels of detail: an analyst wants the evidence, a casual viewer wants a clear explanation, and a producer needs a concise, timed graphic. We built Touchline around a shared, traceable insight rather than three disconnected versions of the match.

## What it does

Touchline turns synthetic football events into match statistics, meaningful patterns and explainable stories. Each story links to the events that support it. Fans can select their club, player, language and level of detail. Producers can review the same insight and export a timed overlay with explicit start, expiry, priority and evidence references.

The main demonstration follows a pressing sequence into a turnover, a progressive pass and a goal. Users can inspect all six source events, see how the explanation changes between fan and analyst modes, switch storytelling language, and preview the insight as a broadcast graphic.

## How we built it

A seeded simulator generates fictional teams, players, match events and tracking samples. A shared JavaScript engine validates and ingests each event incrementally, updates statistics and identifies pressure clusters, forward progression and short turnover-to-shot sequences. It explicitly separates observation from interpretation.

The browser app includes Match Studio, a Storyboard with automatic recaps, a Broadcast workspace, and a Data & Vision Lab. A Node.js server provides a resumable Server-Sent Events feed, authenticated event ingestion and an optional Azure OpenAI narration endpoint. The server reconstructs the requested insight from the match instead of trusting client-supplied facts.

The prepared Azure deployment uses Azure Container Apps for the application and an existing Azure OpenAI model deployment for language generation. Model responses are checked for valid evidence references, length and unsupported numeric claims. Timeouts and rejected outputs fall back to deterministic narration. AI-generated copy is marked as an editorial draft.

## Data innovation and auto-eventing

All clubs, players and match data are synthetic. Seed 42 produces a reproducible 90-minute demonstration with 722 events. A curated sequence at minute 62 provides a repeatable teaching and evaluation case and is explicitly disclosed.

The Vision Lab trains a small colour-prototype classifier from labelled synthetic samples. It reads pixels from a generated frame sequence, tracks the ball and colour-coded players, and detects transfers and ball speed without receiving event tags. This is a constrained proof of concept; it does not support real broadcast video, occlusion or jersey-number recognition.

## What makes it useful

Touchline combines evidence-linked explanations, audience-specific stories and an editorial output contract. It aims to make insights understandable and reviewable before they appear on screen. The synchronous metrics path remains usable even when the language model is unavailable.

## Testing and current status

The implementation includes 25 passing automated tests for deterministic data generation, ordering, deduplication, metrics, evidence, personalization, overlay timing, pixel-based detection, API authorization, SSE resumption and model failure handling. Browser workflows were also checked. Local performance measurements are included with their scope and limitations.

**At the time of this draft, the application runs locally and the standalone demo uses browser-side computation. Azure infrastructure and model integration are prepared but a live Azure deployment and real model call have not yet been verified.** The offline narratives use rules. There is no multi-agent orchestration or demonstrated Microsoft Foundry workflow in the current implementation. We have not measured production broadcast latency or conducted a user study.

## What is next

Complete and verify the Azure deployment, implement and evaluate an analyst/reviewer/audience-editor workflow with shared evidence and failure recovery, record a demonstration under two minutes, test narrative quality with viewers and producers, improve the simulator's tactical fidelity, and integrate the structured overlay contract with a production renderer. Agentic design and innovation account for 20% of the supplied judging rubric, so the missing orchestration is a material gap rather than a completed feature.

---

Submission requirements from the supplied excerpt: a newly built eligible project; a short pitch identifying the problem, effect and actually used Microsoft/Azure technologies; a **public GitHub repository URL**; and a **public demonstration video URL on YouTube, Vimeo, Facebook Video or Youku**. The entire video must be **strictly shorter than two minutes**, show the application operating on its intended device/platform, and avoid unauthorized third-party trademarks, music or other protected material.

Human team details and any further licence/disclosure fields must be completed in the portal. A live Azure demo URL is useful supporting evidence but is not expressly listed as a required submission field in this excerpt. The original challenge's Azure requirement still applies. Review the full rules, eligibility and deadline. Update the implementation-status language only after the missing work has actually been verified.
