# dev-team

**A small product company for Claude Code.** Nine role agents take an idea from a one-page brief you approve, through design, build, QA and code review, to a local commit — and they also cover what most coding plugins skip: product decisions, UI design, marketing copy and pricing.

Markdown only. No hooks, no scripts, no telemetry, and no network calls from the plugin itself (the product, marketing and finance agents use web search for research). Every file is readable in a few minutes.

```
/plugin marketplace add mategog/dev-team
/plugin install dev-team@dev-team
```

Start a new session, then run `/dev-team:setup` once in your project.

---

## How a build runs

```mermaid
flowchart LR
  A[Your idea] --> P[product: one-page brief]
  P --> G{You approve?}
  G -- change --> P
  G -- yes --> B[git branch + baseline commit]
  B --> M[manager: plan]
  M --> F[finance + marketing<br/>if money is involved]
  M --> D[designer: spec<br/>if UI changes]
  D --> FE[frontend]
  M --> BE[backend]
  FE --> Q[qa: use it, break it]
  BE --> Q
  Q --> R[review: diff since baseline]
  R --> C[designer: critique the built UI]
  C --> X{All pass?}
  X -- no, max 3 rounds --> FE
  X -- yes --> K[local commit + summary]
```

## The team

| Agent | Job | Edits code? | Default model |
|---|---|---|---|
| `product` | Turns your idea into a one-page brief: problem, premise check, scope, non-goals, done-checks | No | sonnet |
| `manager` | Plans the work, runs the teams, logs progress in the brief, grades findings, commits locally at the end | Integration fixes only | inherit |
| `designer` | Writes a spec before any new screen; critiques the built UI at 1440 / 768 / 375 px | No — writes `design/` docs only | inherit |
| `frontend` | Builds UI to the spec, verifies in the browser | Yes | inherit |
| `backend` | Logic, APIs, data, scripts, tests | Yes | inherit |
| `qa` | Uses the product like a user and tries to break it | No | sonnet |
| `review` | Reviews the diff: correctness, cheated tests, security, needless code — reports only findings it's 80%+ sure of | No | inherit |
| `marketing` | Competitor feature matrix, launch and store copy, customer research | No code | sonnet |
| `finance` | Pricing, fee comparisons, break-even and scenario spreadsheets. Not tax advice. | No code | sonnet |

`inherit` uses your session's model; `sonnet` keeps cheaper roles cheap. Change `model:` in any agent file to suit your plan.

## Commands

| Command | What it does |
|---|---|
| `/dev-team:setup` | Asks a few questions and writes `company/profile.md`: product, brand, values, stack, design system. Every agent reads it first. |
| `/dev-team:build <idea>` | The whole pipeline above. Resumes an unfinished build if there is one. |
| `/dev-team:status` | What's in progress, done, stopped, and waiting on you. |

You can also call any agent directly, e.g. "use dev-team:finance to compare Paddle and Stripe at €29".

## What it keeps in your repo

```
company/
  profile.md            who you are and how you build (read by every agent)
  decisions.md          one line per decision: date · decision · why
  briefs/<feature>.md   frozen approved scope + plan + progress log + status
  marketing/            competitor profiles and feature matrix
  finance/<topic>.xlsx  models with Inputs / Scenarios / Sensitivity / Checks sheets
design/
  <feature>-spec.md     designer → frontend handoff
  <feature>-critique.md designer's review of the built UI
```

Because state lives in the brief (`status:`, `baseline:`, `branch:`, Plan, Progress log), a build interrupted by a crash, a compaction or a new day picks up where it stopped.

## Rules the agents follow

- **You approve the brief before anything is built.** Its scope is then frozen; agents are told never to edit it to match what they built.
- **Git safety.** Stops and asks if your tree is dirty. Works on a local `dev-team/<feature>` branch. Builders never run `git checkout --`, `restore`, `reset --hard`, `clean` or `stash` (they share one folder). Only the manager commits, locally. **Nothing is ever pushed, merged, tagged or deployed** without you.
- **No cheating to green.** Review flags deleted or skipped tests, loosened assertions, regenerated snapshots, swallowed errors, placeholder code, and specs edited to match the build. A run with zero tests is not a pass.
- **Bug fixes start with a failing test.** A check that couldn't have failed proves nothing.
- **Fix loops stop after 3 rounds** and hand the open findings to you.
- **Every claim says what it rests on:** ran it / read it / not verified.
- **No invented numbers** in marketing or finance: every figure is verified (source + date), an estimate, or a labelled assumption.

## What is enforced, and what isn't

Claude Code enforces each agent's **tool list**, and that's all:
- `qa` and `review` can't use Write/Edit — but keep a terminal to run tests, so "never change files" is still an instruction for them.
- `designer` can't Edit or use a terminal, but can Write (for its `design/` docs) — staying in `design/` is an instruction.
- `product`, `marketing` and `finance` can write files (and finance has a terminal for spreadsheets); staying in `company/` is an instruction.

Everything else above — approval first, frozen scope, git rules, 3-round cap, no cheating — is an **instruction** the agents follow, not a hard gate. If you want hard blocks, add your own hooks (e.g. with Anthropic's `hookify` plugin).

## Recommended skills

Agents preload or load these when present. Install them in `~/.claude/skills/` (read each one first — they're third-party):

| Skill | Used by | Source |
|---|---|---|
| `ponytail` | manager, frontend, backend, review | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) — copy `skills/ponytail` only |
| `interface-design` | designer | [Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design) |
| `make-interfaces-feel-better` | designer | [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) |
| `emil-design-eng` | designer (motion) | [emilkowalski/skills](https://github.com/emilkowalski/skills) |
| `pricing`, `competitor-profiling`, `customer-research` | finance, marketing | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| `owasp-security` | review, backend (security checks) | an OWASP security-review skill of your choice (e.g. from the Claude plugin directory) |
| `frontend-design` | designer (new visual direction) | Anthropic's [frontend-design](https://github.com/anthropics/claude-plugins-official) plugin |
| `audit-xls` | finance | [anthropics/financial-services-plugins](https://github.com/anthropics/financial-services-plugins) — copy `audit-xls/SKILL.md` only |
| `xlsx` | finance | Anthropic's document skills (may appear as `anthropic-skills:xlsx`) |
| `design`, `marketing`, `data` plugins | designer, marketing, finance — optional | Anthropic's knowledge-work plugins |

Without them the agents still work; they just lose that guidance.

## Works with other plugins

- **superpowers** (obra/superpowers): `/dev-team:build` replaces its brainstorming and planning for that run — don't run both on the same feature. Builders may still use its `systematic-debugging` and `verification-before-completion`.
- **Anthropic's code-review / pr-review-toolkit**: fine as an extra review on the branch before you open a PR.

## How it compares

Checked 2026-11-09 by reading each project's files. Stars change; strengths don't much.

| | dev-team | [superpowers](https://github.com/obra/superpowers) | [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | [gstack](https://github.com/garrytan/gstack) | [feature-dev](https://github.com/anthropics/claude-plugins-official) |
|---|---|---|---|---|---|
| Product brief + owner approval | yes | design doc | PRD | yes | clarifying questions |
| UI design spec + critique of built UI | **yes** | — | UX role | design review | — |
| Marketing / pricing roles | **yes** | — | analyst | — | — |
| Resume after interruption | yes (brief state) | yes (progress log) | yes | yes | — |
| Test-first rule | bug fixes only | always (strict) | yes | bug fixes | — |
| Hard enforcement (hooks) | none | session-start hook | none | several | none |
| Deploy / release automation | no (by design) | finish branch | no | yes | no |
| Footprint | 12 agent/skill files, all markdown | large | very large, installer | very large, installer | small |
| Network / telemetry | web search by research agents only | version-reporting logo (can be turned off) | update checks | opt-in telemetry | none |

Pick dev-team if you're a solo builder or a small team who wants the whole product loop — brief, design, code, QA, review, pricing, copy — in a small plugin you can read end to end. Pick superpowers or gstack if you want stricter, hook-enforced engineering discipline and are fine with a bigger footprint.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Changes to agent behaviour need a line in [CHANGELOG.md](CHANGELOG.md) and a version bump in both `.claude-plugin/*.json` files — without the bump, installed copies don't update.

## License

[MIT](LICENSE) © Máté Góg
