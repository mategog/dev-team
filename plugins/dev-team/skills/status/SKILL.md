---
name: status
description: Show what the dev-team is working on — briefs and their status, what's next, open owner checks, design verdicts, recent decisions, uncommitted changes, and what's waiting on the owner.
disable-model-invocation: true
---

# /dev-team:status

Read, don't change anything. All paths are relative to the current project's root (the folder this command was run in), never a parent project's `company/`:
- `company/briefs/*.md` (files with no `status:` frontmatter are notes: skip them) — each brief's `status:`, `next:`, `repos:`, unticked `- [ ]` lines under **Owner checks**, and the last line of `company/briefs/<slug>/log.md` (older briefs: of their inline Progress log).
- `design/**/*-spec.md` and `*-critique.md` — latest verdict per feature.
- The last 10 lines of `company/decisions.md`.
- For each repo in an unfinished brief's `repos:`: `git -C <path> status --short`, its branch, and the last 3 commits.

Answer in under 15 lines:
- **Waiting on the owner:** `waiting-owner` and `draft` briefs (with `next:`), unanswered open questions, `changes needed` verdicts, and unticked owner checks — including on `done` briefs.
- **In progress:** `approved`, `building`, `testing` — say they can be resumed with `/dev-team:build`.
- **Done**, **parked**, **stopped** (with the reason); `superseded` briefs as one count.
- A status outside these: list it as unknown and suggest fixing it.

If `company/` doesn't exist, say so and suggest `/dev-team:setup`.
