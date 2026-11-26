---
name: setup
description: Set up the outfit for this project — interview the owner and write company/profile.md, which every outfit agent reads first.
disable-model-invocation: true
---

# /outfit:setup

0. Work only in the current project's root (the folder this command was run in). Never edit a parent project's `company/`.
1. If `company/profile.md` exists, show it and ask what to change instead of starting over; never drop existing sections.
2. Look around so you only ask what you can't find: README, CLAUDE.md, package.json / Cargo.toml / pyproject, existing design tokens or design-system skills, brand files.
3. New profile only: ask (AskUserQuestion) whether the owner is the founder of this product or an engineer on an existing codebase. Founder: ask only what's still unknown (AskUserQuestion, at most 4 questions per round, two rounds max):
   - What's the product, and who is it for?
   - Brand: name as shown to users, voice, words or claims to avoid.
   - Values or hard rules (e.g. budget limits, no paid tools, privacy rules).
   - Which design-system skill or tokens file is the source of truth, if any.
   - Should the owner approve each design before code is written? (Default yes.)
   - When should the team stop for the owner's review: after every slice, only on risky briefs, or never until the end? (Default: every slice.)
   - Optional, one question, ask it only if the owner brings up cost or models: a spend limit per brief and any model they want for a role (builders, slice reviews, qa, final review).

   **3b. Engineer:** ask nothing about audience, brand or values; scan the repo for `## Codebase`: layout (main folders, entry points) and how to run, build and test; naming, error handling and test style; commit and branch style from `git log --oneline -30` and `git branch -a`; repo rules from CLAUDE.md, CONTRIBUTING and lint configs; fragile areas (no tests; `git log --name-only -50` shows files fixed again and again); `Expected load:` from README or deploy config; `Shared code to reuse:` from `git ls-files` plus a grep for top-level exports/defs (shared folders such as utils, lib, services, components, hooks first; skip tests, generated and vendored code). Mark guesses **[unconfirmed]**; empty repo: "none yet" per item, never invent. Ask only about the design system, and only if there is a UI. Gates: the defaults unless the owner raises them. Then continue at step 4 with the engineer changes noted there.
4. Write `company/profile.md` with these sections (leave out `## Budget` and `## Models` unless the owner gave values; never invent them), filling in what you found and heard, and marking guesses **[unconfirmed]**:

```markdown
# Company profile

## Product
What it is, who it's for, the problem it solves.

## Brand
Name as shown to users, byline, voice, words/claims to avoid.

## Values and hard rules
Rules every agent follows (budget, privacy, no hype, ...).

## Stack
Languages, frameworks, how to run, build and test, where the apps live (each repo's folder, relative to this root).

## Codebase
Written when the repo has code (same scan as step 3b), and always on the engineer path ("none yet" per item on an empty repo). Layout, conventions seen in the code, commit and branch style (describe patterns only, never author names or emails), repo rules, fragile areas.
Expected load: <who uses it and how many at once, e.g. "one person, local CLI" or "~200 users at once, web">
Shared code to reuse: <at most 15 lines `folder/: name, name, name` of existing helpers, components and services new code should reuse>

## Design system
Skill name to load (e.g. `my-app-design`) or tokens file path. Fonts, colours, components to reuse.

## Gates
- Owner approves designs before code: yes
- Owner reviews each slice: yes   <!-- yes | risky only | no -->

<!-- Optional sections, only if the owner asked for them; examples:
## Budget
- stop above $5 per brief
## Models (roles: builders, slice reviews, qa, final review)
- builders: sonnet
-->

## Teams in use
Notes on which outfit agents this project uses. Only a line starting `Only:` with team names restricts the pipeline (product, manager, qa, review always run).
```

Engineer profile (step 3b): no `## Brand`, no `## Values and hard rules` (repo rules go in `## Codebase`), a short `## Product` ("what this code is"), `## Design system` only if there is a UI, and `Only: product, manager, designer, frontend, backend, qa, review` under `## Teams in use`, dropping `designer` only when the repo clearly has no UI (keep it when unsure, e.g. an empty repo).

5. Create an empty `company/decisions.md` with a header line (`# Decisions — date · decision · why`) and an empty `company/briefs/` folder.
6. Show the owner the profile in a few lines and the file path.
