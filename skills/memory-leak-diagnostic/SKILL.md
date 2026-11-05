---
name: memory-leak-diagnostic
description: "Diagnose suspected browser memory growth through repeatable heap and lifecycle evidence."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Memory Leak Diagnostic

Investigate suspected client-side memory leaks using repeatable browser measurements and lifecycle evidence. Distinguish a leak from normal caching, garbage-collection timing, and one-time initialization.

This is a runtime diagnosis. Use browser heap snapshots and allocation/retainer evidence; static inspection identifies candidates but does not prove a leak.

## Reproduce and measure

1. Define a repeatable journey such as opening and closing a route, dialog, or data view.
2. Capture a baseline heap snapshot, repeat the journey several times, allow cleanup/garbage collection when the tooling permits, and capture another snapshot.
3. Compare retained objects and retaining paths rather than relying on a single memory graph reading.
4. Record browser, build, data volume, interaction count, and whether the growth stabilizes across repeated cycles.

## Inspect likely retention paths

- Event listeners, timers, observers, and subscriptions that are not cleaned up.
- Detached DOM nodes retained by closures or long-lived references.
- Unbounded caches, global stores, and collections that grow with each navigation or interaction.
- Async callbacks or effects that outlive the component or owner that created them.
- Large object graphs retained by debugging tools or development-only instrumentation.

Inspect React effects for event listeners registered on `window` or `document` without a matching cleanup:

Bad pattern:

```js
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);
```

Good pattern:

```js
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

Apply the same lifecycle check to `setInterval`/`setTimeout`, `ResizeObserver`/`MutationObserver`, subscriptions, and imperative DOM nodes. Verify that cleanup uses the same listener/options or disconnects/clears the exact resource that was created. Look for detached DOM nodes retained through closures or global collections in heap snapshot retaining paths.

## Fix and verify

- Follow the framework's lifecycle and cleanup patterns; keep cleanup paired with resource registration.
- Bound caches and collections where unbounded growth is not intentional.
- Preserve in-flight request and subscription semantics when cancelling or disposing.
- Re-run the same journey and compare retained objects and heap trends after repeated cycles.
- Test remounting, navigation, and rapid interactions. Report evidence and uncertainty; do not label expected cache warm-up as a leak without a persistent retaining path.
