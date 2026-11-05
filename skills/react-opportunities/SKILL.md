---
name: react-opportunities
description: "Diagnose React rendering and loading costs and recommend focused, measurable optimizations."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# React Opportunities

Inspect React performance using profiling evidence and the existing component architecture. Do not add memoization by default: first establish whether rendering or JavaScript execution is a meaningful bottleneck.

Use static inspection to find likely causes, then distinguish those candidates from confirmed runtime cost.

## Diagnose

- Reproduce the slow route or interaction and record the conditions.
- Use React DevTools Profiler or browser performance traces to locate expensive commits, repeated renders, and long tasks.
- Inspect component props, state ownership, context providers, list sizes, and effects associated with the measured path.
- Distinguish React rendering cost from network delay, layout/paint, and third-party script work.
- Look for new object/function literals passed as props to memoized or expensive children, such as `<List filters={{ status: 'active' }} />` or `<Row onSelect={() => select(id)} />`. Confirm whether child work is actually repeated before suggesting memoization.
- Flag `async` effect callbacks, which React cannot use for cleanup, and effects that launch requests without handling cancellation, stale results, or errors.
- Look for repeated synchronous layout reads such as `getBoundingClientRect()` inside render loops or alternating read/write DOM operations that can force layout.

## Improve selectively

- Keep state close to the components that use it and avoid broad updates from frequently changing context values.
- Stabilize expensive derived values or callbacks only where profiling shows downstream work is avoidable.
- Use list virtualization for genuinely large rendered collections, while preserving keyboard and screen-reader access.
- Defer non-critical work or load route/interaction-specific modules when this removes work from the critical path.
- Avoid effect-driven state synchronization when values can be derived during render.
- Preserve server-rendering and hydration behavior where the project uses them.

Bad pattern:

```jsx
<List filters={{ status: 'active' }} />
```

when `List` is memoized and the inline object causes expensive work on every parent render.

Good pattern when profiling confirms this is the cause:

```jsx
const filters = useMemo(() => ({ status: 'active' }), []);
return <List filters={filters} />;
```

For asynchronous effects, use a synchronous effect callback and handle the request lifecycle:

```js
useEffect(() => {
  const controller = new AbortController();
  loadItems({ signal: controller.signal }).catch(handleError);
  return () => controller.abort();
}, []);
```

Do not add `useMemo`/`useCallback` everywhere. A memoized child, expensive calculation, or measured layout bottleneck should justify the added complexity.

## Verify

- Compare profiler commits and browser traces before and after using the same user journey.
- Test state updates, navigation, loading/error states, and accessibility after changes.
- Do not use render counts alone as proof of a user-visible improvement.
