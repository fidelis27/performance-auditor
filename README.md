# @lib-core-mfe/performance-auditor

`performance-auditor` is a skill pack for AI coding agents. It installs instructions that Claude Code, Cursor, or Codex can load and use to investigate web performance.

It is **not a standalone performance auditor**: the CLI does not collect browser traces, inspect a running application, or diagnose performance by itself. Its purpose is to make the included skills available to an AI agent in the project or user environment where that agent runs.

The executable is available as `perfom-audit` (the original command spelling) and `performance-auditor`.

## Requirements

- Node.js 18 or newer
- npm

## Install

Install globally only on a machine/environment where a supported AI agent is available. The agent can run the installer in a project to make a skill available to itself:

```sh
npm install --global @lib-core-mfe/performance-auditor
```

The npm package is published as `@lib-core-mfe/performance-auditor`; `perfom-audit` and `performance-auditor` are its CLI commands. Installing this package on a machine without an AI agent does not perform an audit.

You can also install it in a project:

```sh
npm install --save-dev @lib-core-mfe/performance-auditor
```

Or run it without adding a project dependency:

```sh
npx @lib-core-mfe/performance-auditor skills install
```

## Usage

From an agent's terminal or shell, run the installer in the project the agent should work on. The interactive command selects skills and agent destinations:

```sh
npx perfom-audit skills install
```

When an agent is setting itself up, install a skill explicitly for that agent. For example, from a Claude Code session:

```sh
npx --yes @lib-core-mfe/performance-auditor skills install performance-advisor --claude
```

The installed `SKILL.md` is then available for the agent to read and follow. To install a skill in all supported agent directories instead:

```sh
npx --yes @lib-core-mfe/performance-auditor skills install performance-advisor
```

Use the corresponding flag when bootstrapping from Cursor or Codex (`--cursor` or `--codex`). You can also install multiple agent copies with more than one flag.

By default, skills are installed in the current project:

| Agent | Destination |
| --- | --- |
| Cursor | `.cursor/skills/<skill-id>/SKILL.md` |
| Claude Code | `.claude/skills/<skill-id>/SKILL.md` |
| Codex | `.agents/skills/<skill-id>/SKILL.md` |

By default, skills are installed in the current project so that the agent working in it can discover them. Use `--global` to install under the current user's home directory for the agent's other projects. Use `--force` to overwrite an existing skill file:

```sh
npx perfom-audit skills install performance-advisor --global
npx perfom-audit skills install performance-advisor --claude --force
```

When a skill ID is provided without an agent flag, it is installed for all three agents. In interactive mode, select both the skills and agents from the prompts.

## Using the skills

After installation, open the project with the corresponding agent. The skills are discovered from that agent's standard project skill directory:

- **Claude Code:** start Claude Code in the project and ask it to assess a performance symptom or invoke a skill by name, such as `Use the network-profiler skill to inspect this route`.
- **Codex:** start Codex in the project and ask for an audit, for example `Use memory-leak-diagnostic to investigate growing heap usage`.
- **Cursor:** open the project in Cursor and ask the agent to use an installed skill, for example `Use react-opportunities to investigate this slow interaction`.

Use `performance-advisor` when you are unsure where to start. It routes the symptom to a focused audit; specialist skills describe evidence to collect, likely patterns, and verification steps. Give the agent a route, user journey, and any available traces or measurements for more useful findings.

## Skills catalog

| Skill | Focus | Analysis mode |
| --- | --- | --- |
| `performance-advisor` | Routes symptoms to the relevant specialist audit and prioritizes evidence-based actions. | Orchestrator |
| `bundling-opportunities` | Namespace imports, duplicate/heavy dependencies, tree-shaking, and bundle statistics. | Static |
| `react-opportunities` | Re-renders, inline props, async effects, and synchronous layout reads. | Static |
| `network-opportunities` | Sequential requests that may be independent, payload size, caching, and duplicate requests. | Static + runtime verification |
| `lazy-opportunities` | Eagerly imported heavy UI that can be deferred with `React.lazy()` or dynamic imports. | Static |
| `network-profiler` | Chrome DevTools, sanitized HAR, and RUM traces, including repeated requests. | Runtime |
| `memory-leak-diagnostic` | Heap retention, missing event-listener cleanup, timers, observers, and detached DOM. | Runtime |

Before installing, the CLI validates each skill's YAML frontmatter, declared skill name and description, and support for Claude Code, Cursor, and Codex. Installation stops if an existing destination would be overwritten without `--force`.

## Development

```sh
npm install
npm test
```

## Publishing

GitHub Actions runs the test suite for pull requests and pushes to `main`. Publishing runs when a GitHub Release is published. The release tag must match the package version, using the `v` prefix (for example, `v1.0.1` for version `1.0.1`).

Publishing uses the `NPM_TOKEN` GitHub Actions repository secret. Configure it with a granular npm token that has publish access to `@lib-core-mfe/performance-auditor` and bypass-2FA enabled. The workflow uses GitHub OIDC for npm provenance; the npm token authenticates publication.

1. In GitHub, open the repository's **Settings → Secrets and variables → Actions** and add/update the `NPM_TOKEN` repository secret with the granular npm token. Never commit or share the token.
2. Publish from a GitHub Release whose tag matches the package version, using the `v` prefix (for example, tag `v1.0.0` for version `1.0.0`).
3. To retry a failed publication or publish the current version from `main`, run **Actions → Publish → Run workflow** on the `main` branch.

For each new version, update `version` (and the lockfile if needed) on a pull request to `main`, then publish a release with a matching tag. The workflow tests and publishes the package with provenance. The first publication can also be started manually from the `main` branch after the `NPM_TOKEN` secret is configured.
