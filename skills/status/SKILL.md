---
name: status
description: Show what the dev-team is working on — briefs and their status, the latest progress, design verdicts, recent decisions, uncommitted changes, and what's waiting on the owner.
disable-model-invocation: true
---

# /dev-team:status

Read, don't change anything:
- `company/briefs/*.md` — each brief's `status:`, `branch:`, and the last line of its Progress log.
- `design/**/*-spec.md` and `*-critique.md` — latest verdict per feature.
- The last 10 lines of `company/decisions.md`.
- If this is a git repo: `git status --short`, the current branch, and the last 5 commits.

Answer in under 15 lines: **in progress** (any status other than done/stopped — say it can be resumed with `/dev-team:build`), **done**, **stopped** (with the reason), **waiting on the owner** (unapproved drafts, unanswered open questions, `changes needed` verdicts). If `company/` doesn't exist, say so and suggest `/dev-team:setup`.
