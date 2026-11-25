---
name: setup
description: Set up the dev-team for this project — interview the owner and write company/profile.md, which every dev-team agent reads first.
disable-model-invocation: true
---

# /dev-team:setup

0. Work only in the current project's root (the folder this command was run in). Never edit a parent project's `company/`.
1. If `company/profile.md` exists, show it and ask what to change instead of starting over.
2. Look around first so you only ask what you can't find: README, CLAUDE.md, package.json / Cargo.toml / pyproject, existing design tokens or design-system skills, brand files.
3. Ask the owner (AskUserQuestion, at most 4 questions per round, two rounds max) only what's still unknown:
   - What's the product, and who is it for?
   - Brand: name as shown to users, voice, words or claims to avoid.
   - Values or hard rules (e.g. budget limits, no paid tools, privacy rules).
   - Which design-system skill or tokens file is the source of truth, if any.
   - Should the owner approve each design before code is written? (Default yes.)
   - When should the team stop for the owner's review: after every slice, only on risky briefs, or never until the end? (Default: every slice.)
   - Optional: a spend limit per brief, and any model the owner wants for a role (builders, slice reviews, qa, final review). Skip both unless they say so.
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

## Design system
Skill name to load (e.g. `my-app-design`) or tokens file path. Fonts, colours, components to reuse.

## Gates
- Owner approves designs before code: yes
- Owner reviews each slice: yes   <!-- yes | risky only | no -->

## Budget
<!-- Optional. Delete this section if there is no limit. -->
- stop above $5 per brief

## Models
<!-- Optional. Delete lines you don't need. Roles: builders, slice reviews, qa, final review. -->
- builders: sonnet

## Teams in use
Which dev-team agents this project uses and any project-specific notes for them.
```

5. Create an empty `company/decisions.md` with a header line (`# Decisions — date · decision · why`) and an empty `company/briefs/` folder.
6. Show the owner the profile in a few lines and the file path.
