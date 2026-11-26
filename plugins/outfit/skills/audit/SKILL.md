---
name: audit
description: Audit an existing codebase (or one folder or package) with the team's reviewers and report what to fix first — numbered plain-English findings, a verdict, and lines that could go. Report only: changes no code, writes no brief, commits nothing.
argument-hint: "[folder or package]"
disable-model-invocation: true
---

# /outfit:audit

You (the main session) run this audit and talk to the owner; `outfit:review` agents do the reading. Target: **$ARGUMENTS** (empty = whole repo).

**Project root:** the folder this command was run in. Pass its absolute path to every agent.

## Hard rules
- Report only: never edit, create, delete or commit files, never write a `company/briefs/` entry, never start a build. Copy this rule into every agent's brief.
- Agents may read and run the existing tests; nothing else that changes state.

## 1. Map first
Read, within the target: README, `company/profile.md` `## Codebase` (and its `Expected load:` and `Shared code to reuse:` lines), build and deploy config, the dependency list, entry points (main, routes, handlers, jobs, CLI) and tests. Trace the main data flows: where input comes in, where data is written, what leaves the app. Load = the profile's `Expected load:`, else infer it from the code and say it was inferred.

## 2. Split and review
Split the target into at most 3 areas, by where a mistake costs most: money, auth, data writes and user input first. Name every trigger from `${CLAUDE_PLUGIN_ROOT}/agents/manager.md` (Verify, "Risky brief") that each area touches, or "no trigger". Honour `## Models` (`final review` = the strongest-model review) and spawn one `outfit:review` per area, in parallel: on the strongest model (the profile's `final review` model, else the strongest you have) for an area with a trigger, else the default model.

Audit brief for each reviewer:
- This is an audit, not a diff review: there is no baseline. Review the area's files as a whole; every problem in them is in scope, however old.
- The goal is the map: what the repo does, the data flows through this area, and the load (stated or inferred). Area path, project root, the triggers it touches.
- Checks: correctness, security, scale against the load, missing tests on risky logic, needless code (dead code, duplicate helpers, a helper that `Shared code to reuse:` already provides, a dependency the standard library covers, an abstraction with one implementation).
- A `shortcut: <the limit>, <when to upgrade>` comment is a decision, not a finding, unless the load already crosses its limit.
- Read-only: you may run the existing tests; never change files.
- Return each finding in this format, plain English, explaining a technical term the first time:
  `N. **title** (path:lines)`
  - **What this is:** what the code does here.
  - **Problem:** concrete input or situation → wrong result.
  - **Fix:** the smallest fix; prefer deleting code.
  - **If we skip it:** what happens.

## 3. Grade
Re-read each finding against the code and grade it yourself, not the reviewer's grade. Drop any without a concrete case; merge duplicates. Group as **Must fix / Should fix / Nice to have**, numbered across groups (1, 2, 3 … not restarting), at most 20; say how many smaller ones were left out.

## 4. Report
- `What this repo does:` 2–3 sentences, and the load assumed (stated or inferred).
- The findings from step 3.
- `Verdict:` healthy when no finding is Must fix; otherwise what to fix first.
- `Lean: -N lines possible` when there are needless-code findings.
- `Not checked:` parts not read, tests not run, and why.

Then say: "Say which numbers to fix and I'll turn them into briefs with /outfit:build". Never start a build without the owner's words.
