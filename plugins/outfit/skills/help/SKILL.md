---
name: help
description: One-screen reference for outfit — commands, the pipeline, profile options, brief statuses, the shortcut marker and how to update. Changes nothing.
disable-model-invocation: true
---

# /outfit:help

Print the card below as is. Read nothing, change nothing.

**Commands**
| Command | What it does |
|---|---|
| `/outfit:setup` | Asks a few questions and writes `company/profile.md`, which every agent reads. |
| `/outfit:build <idea>` | The whole pipeline below. Resumes an unfinished build. |
| `/outfit:status` | What's in progress, done, stopped, and waiting on you. |
| `/outfit:review-pr <PR number, URL or branch>` | Reviews someone else's PR in a separate worktree. Report only, never posts. |
| `/outfit:audit [folder or package]` | Audits existing code: numbered findings, a verdict. Report only. |
| `/outfit:help` | This card. |
| `use outfit:<agent> ...` | Calls one agent directly: product, manager, designer, frontend, backend, qa, review, marketing, finance. |

**Pipeline:** idea → product brief → you approve → plan → designer spec → you approve the design → frontend/backend → qa → review → design critique → local commit per slice.

**Options in `company/profile.md`** (all optional)
- `## Gates`: `Owner approves designs before code: yes | no`; `Owner reviews each slice: yes | risky only | no`.
- `## Teams in use`: `Only: product, manager, backend, qa, review` limits the pipeline to those teams; no `Only:` line means all.
- `## Models`: one line per role, e.g. `builders: opus`, `slice reviews: sonnet`, `qa: haiku`, `final review: opus`. Unlisted roles keep the defaults.
- `## Budget`: `stop above $5 per brief`. An estimate from token counts; it errs toward stopping early.
- `## Codebase`: `Expected load:` (what the code must handle) and `Shared code to reuse:` (helpers to use instead of new ones).
- `company/preferences.md`: up to 20 lines of ways you want things done; the manager reads it first.

**Brief statuses:** `draft` → `approved` → `building` → `testing` → `done`, plus `waiting-owner`, `parked`, `stopped`, `superseded`. `next:` says what happens next and who does it.

**Shortcut marker:** a code comment `shortcut: <the limit>, <when to upgrade>` records a deliberate shortcut. Reviews treat it as a decision, not a finding, unless the expected load already crosses it. `/outfit:status` counts them.

**Update:** `/plugin marketplace update outfit`, then `claude plugin update outfit@outfit`, then start a new session.
