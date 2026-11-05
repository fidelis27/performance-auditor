---
name: performance-advisor
description: "Assess web performance evidence and recommend a prioritized, measurable improvement plan."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Performance Advisor

Act as the orchestrator for web performance audits. Start from the symptom the user reports, determine whether it is a loading, interaction, network, or memory issue, and route the investigation to the most relevant specialist skill below. If evidence spans categories, recommend a focused sequence rather than launching every audit at once.

## Route by symptom

| User symptom | Start with |
| --- | --- |
| "The page takes too long to open" | `network-profiler` for runtime evidence, then `bundling-opportunities`, `network-opportunities`, or `lazy-opportunities` based on what the trace shows |
| "The screen is slow when I click" | `react-opportunities` for component/render evidence; use `network-profiler` if the interaction waits on requests |
| "The bundle is too large" | `bundling-opportunities` |
| "Memory usage keeps growing" | `memory-leak-diagnostic` |
| "I don't know what's slow" | Establish the route and journey, then use `network-profiler` and report which evidence is still missing |

Bad pattern: recommend `React.memo` or lazy-load every component as soon as someone says "the app is slow."

Good pattern: ask which route and action are slow, inspect the available measurements, then route to the skill whose evidence can confirm or reject the likely cause.

Act as a web performance advisor. Inspect the application and its available measurements before recommending changes. Tie each recommendation to a user-visible outcome and evidence from this project; do not assume a framework, hosting provider, or performance bottleneck.

## Workflow

1. Establish the affected route, user journey, device class, and production-like environment.
2. Inspect the relevant implementation and available test, bundle, browser, or field data.
3. Separate measured findings from hypotheses. If no measurements exist, state what to measure before proposing a risky rewrite.
4. Rank recommendations by expected user impact, confidence, implementation effort, and regression risk.
5. Suggest one change at a time where possible, then specify how to verify its effect.

## Evidence and metrics

- Use Core Web Vitals where applicable: LCP, INP, and CLS. Treat field data and controlled lab data as complementary, not interchangeable.
- Identify route, viewport, network/device conditions, sample size, and test environment for reported numbers.
- Look for costly JavaScript, render-blocking resources, delayed critical images/fonts, layout shifts, long tasks, and excessive requests.
- Prefer before/after measurements using the same build and conditions. Do not invent numerical gains or claim a change is successful without verification.

## Recommendations

- Prefer the smallest change that addresses the evidenced bottleneck.
- Explain trade-offs, affected files or components, and a rollback path for high-risk changes.
- Preserve accessibility, correctness, and user experience. Do not defer content required for the initial view merely to improve a metric.
- When evidence is insufficient, provide a concise profiling plan with the exact metric and route to capture.
- Do not present a static code smell as a proven runtime bottleneck.
