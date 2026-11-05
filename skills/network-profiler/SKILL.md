---
name: network-profiler
description: "Guide a repeatable browser-network profiling session and produce an evidence-based findings report."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Network Profiler

Guide a repeatable network profiling session for a web route. Use available browser developer tools or project instrumentation; do not claim to run a browser trace when none was captured.

Use real runtime evidence from Chrome DevTools Network/Performance panels, a sanitized HAR, or field Real User Monitoring (RUM). Static inspection can suggest where to look but cannot replace a trace.

## Capture protocol

1. Select one representative route and user journey, and record the build/environment.
2. Choose a viewport, device profile, and network/CPU throttling appropriate to the target audience.
3. Capture cold-cache and warm-cache runs separately; repeat runs to detect variability.
4. Preserve a sanitized trace or HAR only when permitted by the project. Remove cookies, authorization headers, query secrets, and personal data before sharing.
5. Record the measurement source and any limitations.

## Analyze

- Identify navigation timing and the critical request chain.
- Inspect request initiators, blocking, priorities, transferred/compressed sizes, and response cache directives.
- Separate first-party application requests from third-party scripts and services.
- Note failed requests, redirects, duplicate requests, and long-tail responses.
- Correlate network activity with LCP, INP, and CLS where the trace supports it.
- Compare repeated visits and interactions to identify repeated requests for the same resource or data. Check initiators and cache behavior to distinguish intentional revalidation from accidental duplicate work.
- For RUM, segment by route, device, and relevant release where available; report distributions and sample counts rather than treating one outlier as representative.

## Report format

For each finding, include: observation, evidence (request/trace location and timing), affected journey, likely impact, confidence, and a suggested next experiment. Separate confirmed root causes from hypotheses. Include capture conditions and do not include sensitive request contents.

Bad pattern: call a large response a bottleneck based only on its size, without noting whether it is cached, transferred on the critical path, or used by the journey.

Good pattern: cite the repeated request's initiator, count, timing, cache status, and route, then recommend checking the caller or cache policy and recapturing the same journey.
