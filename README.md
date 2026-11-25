# dev-team

**Nine markdown subagents for the whole product loop: brief, design, build, QA, review, local commit.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![validate](https://github.com/mategog/dev-team/actions/workflows/validate.yml/badge.svg)](https://github.com/mategog/dev-team/actions/workflows/validate.yml)
[![Changelog](https://img.shields.io/badge/changelog-read-informational.svg)](CHANGELOG.md)

Markdown-only plugin: no hooks, no scripts, no telemetry. Agents never push; every commit stays on your machine. CI fails the build if the plugin ever gains a non-markdown file.

Most coding agents start at "write the code". dev-team starts one step earlier and ends one step later: you give it an idea, a **product owner** turns it into a one-page brief you approve, a **designer** specs the screen you approve, **frontend and backend** build it, **QA** tries to break it, **review** reads the diff, and the **manager** hands you a reviewed local commit. It is built for solo developers and small teams who have no product manager, designer or QA engineer on staff.

![Tally habit list with day streaks next to each habit, built by dev-team](examples/demo-run/screens/desktop.png)

*A real run, not a mock-up: "Show each habit's current streak next to its name" on a small habit tracker. About 15 minutes from command to commit (4 of them waiting for the owner's approval), 13/13 tests, QA pass, review approve. One run, on dev-team 0.4.0, and it found four bugs in the plugin itself. The brief, design spec, diff and unedited log are in [examples/demo-run](examples/demo-run/).*

## Try it in two minutes

```
/plugin marketplace add mategog/dev-team
/plugin install dev-team@dev-team
```

Start a new Claude Code session, then in your project:

```
/dev-team:setup                 # once: writes company/profile.md, which every agent reads
/dev-team:build <your idea>     # approve the brief, approve the design, let the team work
```

**Check the result:** open the brief in `company/briefs/`, read the diff, and run `git log` on the `dev-team/<feature>` branch. That is all it changed. Stop there; `/dev-team:status` shows what is in progress or waiting for you.

Already installed? Third-party marketplaces don't auto-update by default: run `/plugin marketplace update dev-team`, then `claude plugin update dev-team@dev-team`, and start a new session.

## Why use it

- **You stay the owner, and it can show where.** Nothing is built until you approve the brief, and UI isn't coded until you approve the design. The approved scope is frozen: agents are told never to edit it to match what they built. (These gates are instructions the agents follow, not hard blocks; the [plugin reference](plugins/dev-team/README.md#what-is-enforced-and-what-isnt) spells out exactly what Claude Code enforces.)
- **It covers the jobs you don't have a person for.** A designer who writes a spec and then critiques the built screen at three widths. A QA tester who uses the product like a user. A reviewer who flags deleted tests, loosened assertions and swallowed errors. Pricing and launch-copy agents when a brief touches money.
- **Your repo is safe from it.** It works on a local `dev-team/<feature>` branch, or a git worktree beside your repo if you have uncommitted work. It is told never to push, merge, tag or deploy. You decide what leaves your machine.
- **You can read all of it.** Twelve markdown files. No installer, no background process, no network calls from the plugin itself (the product, marketing and finance agents use web search for research). The bar for adding anything is "does a solo builder clearly need this?" ([CONTRIBUTING](CONTRIBUTING.md)).
- **It tells you what it costs and what it did not prove.** In the [benchmark](benchmark/README.md), a plain session, Anthropic's feature-dev plugin and dev-team all passed every hidden acceptance check on well-specified backend features, so dev-team does not claim better correctness. It cost about three times as much ($0.75 against $0.22 per medium feature) and took longer. What the extra spend bought was the review: on the hard features it flagged "changes needed" in 3 of 8 runs, with defects no acceptance check covered (whether a plain session shares them was not checked). Backend only, four to ten runs per cell. Model choices elsewhere were tested the same way, with sample sizes printed in the [CHANGELOG](CHANGELOG.md), and you can override any role or set a budget in `company/profile.md`.
- **It resumes where it stopped.** Each brief records its status, next step and each repo's branch and baseline commit, so a crash or a new day doesn't lose the build.

**Not for you if** you want one-line scripts (a plain prompt is faster), a push-to-production autopilot, or a guarantee of better code. dev-team does not claim better code or faster delivery than a good prompt (it was slower and dearer in its own benchmark); it gives the work a brief, a design, a test run and a second pair of eyes. If the task is already fully specified and backend-only, a plain session may be all you need.

## How a build runs

```
idea → brief → you approve → plan → design → you approve → build → QA → review → local commit
```

Small briefs (one builder team, no new screen, no money, no new dependency) skip the plan and the designer. The full flow chart, the agent roster and every rule are in the [plugin reference](plugins/dev-team/README.md).

## The team

| Agent | Job |
|---|---|
| `product` | Turns your idea into a one-page brief: problem, scope, non-goals, done-checks |
| `manager` | Plans the work, runs the other agents, tracks progress, commits locally |
| `designer` | Writes the spec before any new screen; critiques the built UI afterwards |
| `frontend` | Builds the UI to the spec and checks it in a browser |
| `backend` | Logic, APIs, data, scripts and tests |
| `qa` | Uses the product like a user and tries to break it |
| `review` | Reads the diff for bugs, security holes, cheated tests, needless code |
| `marketing` | Competitor matrix, launch and store copy, customer research |
| `finance` | Pricing, fee comparisons, break-even and scenario spreadsheets (not tax advice) |

You can also call any one directly: "use dev-team:finance to compare Paddle and Stripe at €29".

## Two parts, one repo

| | **[Plugin](plugins/dev-team/)** | **[Mod: Team pane](mods/dev-team-view/)** |
|---|---|---|
| What it is | The nine agents and the `/dev-team:build`, `:setup` and `:status` commands | A live pane next to the chat: who is working, who failed, who is talking to whom |
| Contains | Markdown only | A small TypeScript module (about 550 lines, with tests) |
| Required? | Yes, it is the product | No. dev-team works the same without it, and the pane works with any subagents |
| Install | `/plugin install dev-team@dev-team` | `/plugin install dev-team-view@dev-team` |
| Needs | Claude Code | Claude Code 2.1.287+ (desktop 2.1.286+) |
| Trust | Reads and writes files, runs commands, only inside the tool limits each agent lists | Mods run inside Claude Code with your permissions, unsandboxed. It makes no network calls and touches no files. Read the source first |
| Read more | [Plugin reference](plugins/dev-team/README.md) | [Mod README](mods/dev-team-view/README.md) |

The mod is early: its tests and validation pass, but it hasn't yet been watched live with a real build.

![Team pane: a manager desk above six agent desks with status badges](mods/dev-team-view/docs/team-wide.png)

*A render of the mod's own drawing code with sample data, not a screenshot of a live build.*

## Go deeper

| Read | For |
|---|---|
| [Plugin reference](plugins/dev-team/README.md) | Every agent and model, the full rules, what is enforced and what isn't, the profile options, FAQ, how it compares with superpowers, BMAD and gstack |
| [Mod README](mods/dev-team-view/README.md) | What the Team pane shows, what it reads, how to install and turn it off |
| [Benchmark](benchmark/README.md) | The team against a plain session and feature-dev: what it matched, what it cost, what its review caught |
| [Demo run](examples/demo-run/) | A real build end to end: brief, design spec, diff, log, screenshots |
| [Example project files](examples/) | What dev-team writes into your repo (`company/`, `design/`) |
| [CHANGELOG](CHANGELOG.md) | Every release, with what was measured and how large the sample was |
| [CONTRIBUTING](CONTRIBUTING.md) | How to change an agent or the mod |

## Repo layout

```
.claude-plugin/marketplace.json   lists both parts for /plugin install
plugins/dev-team/                 the plugin: agents/, skills/, README.md
mods/dev-team-view/               the mod: hooks/, types/, docs/, README.md
benchmark/                        the team against a plain session, with limits
examples/                         a real demo run and sample project files
```

## License

[MIT](LICENSE) © [Máté Góg](https://github.com/mategog). Questions, bugs and ideas are welcome in [GitHub Issues](https://github.com/mategog/dev-team/issues).
