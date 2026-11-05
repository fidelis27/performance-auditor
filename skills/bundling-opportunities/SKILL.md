---
name: bundling-opportunities
description: "Find and validate opportunities to reduce shipped JavaScript and improve loading performance."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Bundling Opportunities

Analyze the production dependency graph and route loading behavior to find opportunities to reduce JavaScript transfer, parse, and execution costs. Ground findings in build output or dependency usage rather than assuming a package is expensive.

This is primarily a static analysis. Inspect imports, package metadata, bundler configuration, and available build statistics; use measured bundle output to confirm impact.

## Investigation

1. Identify the package manager, bundler, production build command, and route entry points.
2. Inspect bundle analyzer output, chunk manifests, source maps when available, and import sites.
3. Distinguish initial-route JavaScript from deferred or route-specific chunks. Report compressed and uncompressed sizes only when the measurement source is clear.
4. Check for duplicate dependency versions, broad barrel imports, large locale/data payloads, and code included on routes that do not use it.
5. Flag namespace imports such as `import * as utils from './utils'` when they pull in many exports or defeat tree-shaking in the project's build setup. Confirm actual output before calling them a bundle regression.
6. Identify packages with expensive transitive dependencies or side effects that limit tree-shaking; check package exports and the configured bundler before recommending replacement.
7. Include useful build statistics: initial versus async chunks, largest modules, duplicate modules, and compressed sizes when the tooling provides them.

Bad pattern:

```js
import * as utils from './utils';
import _ from 'large-library';
```

when the route uses only one small helper and one utility.

Good pattern, when supported by the library and confirmed by the bundler:

```js
import { formatDate } from './utils/format-date.js';
import { debounce } from 'small-tree-shakeable-library';
```

Do not treat every namespace import as a defect: some modules expose only a single export, and some bundlers eliminate unused exports correctly.

## Opportunities

- Replace an oversized dependency only when a compatible smaller alternative preserves behavior and maintenance quality.
- Prefer tree-shakeable named imports where the library supports them.
- Split route-specific or interaction-only code at a natural boundary; avoid excessive tiny chunks and waterfalls.
- Remove dead code and unused dependencies only after confirming references and build/runtime needs.
- Consider native platform APIs only after checking browser support, accessibility, and project conventions.

## Validation

- Build before and after with the same production configuration.
- Compare initial and route-level chunk sizes and test the affected routes, including lazy-loaded interactions.
- Verify loading states, error handling, caching behavior, and source-map/build output.
- Report the exact evidence and avoid promising a performance gain based solely on source-code line counts.
