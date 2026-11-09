---
name: build
description: Run the dev-team pipeline on an idea — product brief (owner approves) → design → build → QA → review → design critique → local commit and summary. Resumes an unfinished build if there is one.
argument-hint: "<idea or feature to build>"
disable-model-invocation: true
---

# /dev-team:build

You (the main session) are the company's front desk. You talk to the owner; the agents do the work. Idea: **$ARGUMENTS**

This command replaces brainstorming and planning workflows from other plugins (e.g. superpowers' brainstorming / writing-plans) for this run: the product brief is the design doc and the manager's Plan is the plan. Don't run both.

**Project root:** every `company/` and `design/` path in this command, and in every brief you give an agent, means the folder at the root of the current project (git root of the working directory). Pass that absolute root to each agent you spawn. Never use a `company/` folder from a parent project, even if a parent CLAUDE.md mentions one.

## 0. Unfinished work?
Look in `company/briefs/` for any brief whose `status:` is not `done` or `stopped`. If one exists, show it (name, status, last Progress-log line) and ask the owner: resume it, or start the new idea? To resume a `draft`, go to step 3 (it still needs approval). To resume any other status, go to step 4 with that brief.

## 1. Profile
If `company/profile.md` doesn't exist, tell the owner to run `/dev-team:setup` first and stop — unless they say to go ahead without one.

## 2. Brief
Spawn `dev-team:product` with the idea, word for word, plus any context from this conversation. Wait for it.

## 3. Approval gate
Show the owner the brief's scope, non-goals, premise answers, done-checks and open questions in a few lines, with the file path. Ask them to approve, change, or stop. Do not continue until they approve. If they ask for changes, send them to the same product agent and repeat. On approval set `status: approved` in the brief. If they say stop, set `status: stopped` and log why.

## 4. Git baseline (if this is a git repo)
**If the brief already has a `branch:`** (resuming a build that started): switch to that branch and **keep its `baseline:`** — never overwrite it. Uncommitted files are expected here (builders don't commit). Compare them with the Plan's file list; log only files *outside* the Plan as "owner's uncommitted files — not part of this build".

**Otherwise** (fresh build, or resuming a `draft`/`approved` brief):
- If the working tree has uncommitted changes, show them and ask the owner: commit them first, or continue anyway? Don't stash or discard anything yourself. If they continue, list those files in the brief's Progress log as "owner's uncommitted files — not part of this build".
- Create a local branch `dev-team/<feature-slug>` from the current commit and write that commit to the brief's `baseline:` and the branch to `branch:`.
Not a git repo: leave `baseline: none` and say that review will read files instead of a diff.

## 5. Delivery
Spawn `dev-team:manager` with the brief's path and the owner's answers to the open questions. Always go through the manager, even for a one-team brief: it owns the plan, the fix-loop cap, the decisions log and the commit.

## 6. Summary
Tell the owner in plain words: what was built; QA / review / design verdicts and the evidence behind each (ran it / read it / not verified); what isn't done; decisions recorded; the local commit. Check the summary against the actual files, diff and test output — agent reports are claims, not proof.

Never push, merge, tag, publish or deploy as part of this command; offer it as a next step.
