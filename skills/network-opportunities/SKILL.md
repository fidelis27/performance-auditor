---
name: network-opportunities
description: "Identify network latency, request volume, caching, and payload opportunities using trace evidence."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Network Opportunities

Investigate browser network activity for a specified route and journey. Use browser traces, server logs, or existing observability; never infer a network bottleneck only from source code.

Use static code analysis to spot sequential `await` operations and duplicate fetch sites, then verify the request timeline at runtime.

## Inspect

- Record the route, cache state, viewport, network profile, and whether the test is a cold or warm load.
- Group requests by criticality, origin, type, size, duration, and initiator.
- Look for request waterfalls, serialized dependencies, duplicate fetches, oversized responses, redirects, and unnecessary third-party origins.
- Check response cache headers and application caching behavior without exposing credentials or sensitive response data.
- In source code, find independent requests awaited one after another. Confirm that neither request depends on the other's result before recommending parallel execution.

Bad pattern for independent requests:

```js
const profile = await getProfile();
const alerts = await getAlerts();
```

Good pattern when both calls can safely run at the same time:

```js
const [profile, alerts] = await Promise.all([
  getProfile(),
  getAlerts()
]);
```

Keep sequential awaits when the second request needs an identifier or value returned by the first. Use `Promise.allSettled` only when partial results are useful and the interface handles failures explicitly.

## Recommend

- Remove requests only after confirming the data or resource is not needed.
- Reduce payloads through appropriate compression, pagination, responsive assets, or selective fields.
- Parallelize independent requests while preserving dependent ordering and error semantics.
- Use caching with explicit freshness and invalidation rules; do not cache personalized or sensitive data publicly.
- Consider preconnect or preload only for resources proven to be critical and used on the measured route.
- Avoid speculative prefetching that increases bandwidth or server load without evidence of likely use.

## Verify

- Compare request count, transferred bytes, waterfall timing, and user-facing metrics under matching conditions.
- Test cache misses, stale data, offline/error responses, and authenticated flows where applicable.
