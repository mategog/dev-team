# Changelog

All notable changes. Versions follow semver; bump both `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` together.

## 0.7.2 — 2026-11-25
The other three agents get tool lists too.
- `frontend`, `qa` and `designer` list their tools, including the browser servers they test with: Claude's built-in browser, the Chrome extension and Playwright (`mcp__Claude_Browser__*`, `mcp__claude-in-chrome__*`, `mcp__playwright__*`). Checked in the desktop app: the listed agents see and can call the browser tools. Starting size on the machine measured: `qa` about 39k tokens (was 92k), `frontend` about 55k (was 110k), `designer` about 68k (was 105k). If you test with another browser server, add its name to `tools:` in those three files.
- `frontend` no longer spawns copies of itself: it never did in 11 measured runs. Now only the manager spawns agents.
- `designer` no longer has the `Artifact` tool. Its instructions never asked for mockups, it used the tool in 5 of 20 measured runs, and it costs about 18k tokens on every designer spawn. If you want published mockups back, add `Artifact` to `tools:` in `agents/designer.md`.

## 0.7.1 — 2026-11-25
Cuts tokens, from measuring 149 real agent runs and testing each change.
- `review`, `backend` and `product` list only the tools they use (`tools:`) instead of inheriting every tool. An agent that inherits everything starts with every installed tool and MCP server in its context: about 95k tokens for `review` on the machine measured, against about 22k with a list. On a test with six seeded defects the reviewer with the list found all of them in 3 of 3 runs, at about half the cost. If your backend work needs another tool (a database or simulator MCP server, say), add its name to `tools:` in `agents/backend.md`.
- `review` and `backend` no longer spawn copies of themselves. In 62 measured runs neither ever did, and slices keep reviews small.
- `backend` and `frontend` get an **Output hygiene** section: quiet test output, line-range reads, no re-reads, batched tool calls. About 10% cheaper on the same task in a 3-runs-per-arm test, with every done-check passing.
- `product` greps the titles and statuses of existing briefs instead of reading every brief in full.
- Fix loop: the manager spawns a fresh agent with the full brief plus the findings instead of waking the one that built it, whose cache has expired by then.
- Mechanical helper tasks (searches, renames, running tests) run on Haiku instead of Sonnet.
- `review` reruns the tests under a second timezone when a change touches dates or times.

## 0.7.0 — 2026-11-24
The optional team view mod, plus the slice flow and token savings from 0.6.x, in one release.
- Optional companion mod `dev-team-view` in `mods/dev-team-view`, listed in the marketplace: a live Team pane showing which agents are working and the messages between them. The plugin itself is unchanged.
- `dev-team-view` 0.1.1: after you close the Team pane, a **Team ▸** button above the prompt reopens it, and `/team` says so when the pane can't be shown instead of always claiming it opened.
- `dev-team-view` 0.1.2: the drawing was stuck in Desktop's default 150px-tall frame, so it came out tiny. It now sets the frame to the pane's width and the content's height, at a fixed size (1.5 px per drawing unit) so cards and text are readable on any monitor: wider panes fit more cards per row, narrower ones stack them.

## 0.6.1 — 2026-11-24
Cuts tokens.
- The whole-diff review after the last slice is skipped when the brief had one slice (it was the same diff reviewed twice).
- `review` and `designer` default to Sonnet instead of inheriting the session model. This saves tokens only when your session runs a pricier model; set `model: inherit` in their agent files for a stricter reviewer or designer.
- The manager asks frontend, backend, marketing and finance to keep their final report under 200 words, with long output saved to a file under `company/briefs/<slug>/`. `review` and `qa` still report in full, since they can't write files and their findings must not be cut.

## 0.6.0 — 2026-11-24
Review-sized builds: no more one huge diff at the end.
- The manager plans **slices**: one user-visible behaviour each, at most about 500 changed lines (tests, lockfiles and generated files not counted), each with a done-check the owner can run in a minute. Oversized slices are split before building.
- Each slice is reviewed, committed on its own (`slice N/M: …`) and followed by a slice report with a **review map** from `dev-team:review` (where the logic is, what the tests prove, what to skip). The build then waits for the owner. Turn the pause off with `Owner reviews each slice: no` under `## Gates`. `small` briefs are one slice and don't pause.
- Review also runs once over the whole diff after the last slice.

## 0.5.1 — 2026-11-13
- `/dev-team:build` and `/dev-team:status` skip files in `company/briefs/` with no `status:` frontmatter (notes such as contracts or research), instead of flagging them as unknown briefs.

## 0.5.0 — 2026-11-13
Fixes from real multi-repo builds.
- `/dev-team:build` runs the manager's playbook in the main session instead of spawning the manager: a subagent's run could end before its builders reported back, leaving fix rounds unverified. `dev-team:manager` stays for direct multi-team tasks and now waits for every report, or logs what's still running.
- Owner design gate after the designer's spec, on by default; turn it off under `## Gates` in `company/profile.md`.
- Fixed brief statuses (`draft`, `approved`, `building`, `testing`, `waiting-owner`, `done`, `parked`, `stopped`, `superseded`) plus a one-line `next:`. Resume offers only unfinished briefs; unknown statuses are flagged.
- Briefs list **Owner checks** (real device, real accounts, payments) separately from agent done-checks; `/dev-team:status` and the summary show the open ones.
- `size: small` briefs skip the plan and the designer: one builder, review, and QA when users see the change.
- Plan and log move to `company/briefs/<slug>/plan.md` and `log.md`, one short line per step; older briefs keep their inline sections.
- `repos:` in the brief records path, branch and baseline per repo; a dirty or busy repo gets a git worktree beside it. Review diffs each repo. Agents use the project root they're given before the git root.

## 0.4.2 — 2026-11-09
- Frontend and backend name a model for every helper they spawn, like the manager already did: the agent's default, or `sonnet` for mechanical tasks (searches, renames, running tests). Helpers no longer inherit the most expensive model by default.

## 0.4.1 — 2026-11-09
Fixes found by the first real end-to-end run (Tally demo, see `examples/demo-run/`).
- Agents and commands resolve `company/` and `design/` against the current project root, never a parent project's (a nested project picked up its parent's profile).
- Manager starts one shared dev server, saves 1440/768/375 screenshots to `design/<feature>-screens/` for the designer (who can't save images), assigns an owner to every spec acceptance check, and keeps specs in `design/`.
- Review always reports failures it actually reproduced, whatever the confidence score.
- Product asks only product questions, not process questions.

## 0.4.0 — 2026-11-09
First public release.
- Briefs carry state (`status`, `baseline`, `branch`, Plan, Progress log) so an interrupted `/dev-team:build` resumes; the Approved scope is frozen after approval.
- Git discipline: dirty-tree check, local `dev-team/<feature>` branch, baseline commit, builder ban on `checkout --` / `restore` / `reset --hard` / `clean` / `stash`, one local commit by the manager, never push.
- Fix loop capped at 3 rounds, then hand back to the owner. Manager grades findings itself.
- Review: diff since baseline, gate-integrity checks (cheated tests, placeholders, spec edited to match), confidence ≥ 80 only, explicit "security review skipped" note.
- Bug fixes start with a failing test; zero-test runs aren't passes; every report states its evidence type.
- Product: premise check (do nothing? already exists? how will users get it?) and "likely ways a user breaks it".
- Explicit `model:` on every agent (cheap roles on sonnet).
- README with flow diagram, enforced-vs-not section, comparison, composition with superpowers; LICENSE, CONTRIBUTING, examples, CI validation.

## 0.3.0 — 2026-11-09
- Marketing preloads `competitor-profiling` and builds a sourced feature matrix; finance compares price per comparable feature set and adds a Competitors sheet.

## 0.2.0 — 2026-11-09
- New `finance` agent: pricing, fee comparisons, break-even and scenario spreadsheets, tagged numbers, tax questions routed to an advisor.

## 0.1.0 — 2026-11-08
- Eight agents (product, manager, designer, frontend, backend, qa, review, marketing) and `/dev-team:build`, `:status`, `:setup`.
