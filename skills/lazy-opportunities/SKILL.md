---
name: lazy-opportunities
description: "Find safe code and asset loading boundaries that defer non-critical work without harming usability."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Lazy Loading Opportunities

Identify code, images, and other resources that can be deferred until they are needed. Confirm that each candidate is outside the critical user experience and that deferral will not create a visible delay or accessibility regression.

This is primarily static analysis: inspect eager imports, route boundaries, component usage, and event handlers. Confirm candidates with production chunk and runtime evidence.

## Find candidates

- Inspect route/component usage and production bundle or network traces.
- Prioritize below-the-fold images, route-specific modules, and heavy features opened by explicit user interaction.
- Keep above-the-fold content, primary navigation, and resources needed for a meaningful first render available promptly.
- Check whether existing framework conventions already provide route splitting or image loading behavior.
- Find heavy UI components imported at module load but rendered only after a user action, such as a chart, editor, or rarely opened dialog. These are candidates for `React.lazy()` or the framework's dynamic-import equivalent.

Bad pattern when an expensive dialog is needed only after a click:

```js
import ReportEditor from './ReportEditor';
```

Good pattern when the project uses React and the feature is not needed for the initial render:

```js
const ReportEditor = React.lazy(() => import('./ReportEditor'));
```

Render the lazy component inside an appropriate `Suspense` boundary with a useful fallback. Do not lazy-load primary content or the likely LCP image simply to reduce the entry chunk.

## Apply carefully

- Use the framework's established dynamic import, route-level split, or image-loading APIs.
- Provide clear loading, empty, and error states for deferred features.
- Avoid nested lazy boundaries that introduce request waterfalls or layout shifts.
- Preserve keyboard access and announce asynchronous state changes where appropriate.
- Use stable dimensions or aspect ratios for images to prevent layout movement.
- Avoid lazy-loading an image that is likely to be the page's Largest Contentful Paint element.

## Verify

- Test initial render, navigation, scroll behavior, slow networks, and failed module/resource loads.
- Compare initial transfer and LCP as well as deferred interaction latency.
- Confirm deferred content remains discoverable and works without relying on pointer-only interaction.
