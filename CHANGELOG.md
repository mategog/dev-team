# Changelog

All notable changes. Versions follow semver; bump both `plugins/dev-team/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` together.

## 0.10.0 — 2026-11-25
Measured against a plain session, and the findings acted on.
- **A benchmark** ([benchmark/](benchmark/README.md)): 5 medium and 2 large backend features, 3 to 4 arms, hidden acceptance checks and a blind code-quality judge. Result: every arm got every check right, so on specified backend work the team's main gain is review, not correctness, at 3.5 to 4.5x the cost. The plugin README now has a "When to use it, and when not to" section built on it.
- **Risk is a checklist, not a feeling.** The product and manager agents use the same six triggers (secrets, permissions, money or stored value, personal data, deleting or migrating data, acting outside the app) and the manager logs which one fired. On four briefs x three runs the old wording was right 8 times in 12 and the list 11 times in 12.
- **Reviewers always get the brief,** and mark each done-check and breakage case as met or missing. With the brief 3 of 3 slice reviews caught a requirement we had removed; with only a one-line goal, 1 of 3.
- **Clean-code rules are in the builders and the reviewer** instead of depending on the optional ponytail skill: blind-judged quality rose from 3.7 to 4.1 on the medium features but fell from 3.7 to 3.5 on the large ones (4 to 5 runs each), so treat it as unproven.
- **Budget estimate:** rates refitted on 94 runs (Sonnet $6, Haiku $0.40, Opus $9 per million reported tokens); no formula from a token count does better, so figures for one agent can be off by half, and the text says so.
- **dev-team-view** README now says plainly what it adds over the Desktop tasks pane and Claude Flightdeck: the message line between agents and the failed and stopped states. It still hasn't been watched live on a real build.
- Tested and not shipped: an automatic "direct path" for small specified work. Six of six trials went direct and passed, but a money-related brief did too, and the corrected version was not retested.
### Repo layout
- Repo layout: the plugin now lives in `plugins/dev-team/` and the mod in `mods/dev-team-view/`, side by side; the marketplace file stays at the root and points at both. The root README is a short introduction to both, with the detail in each folder's README. No agent or skill text changed.

## 0.9.0 — 2026-11-25
Tune the team from the profile. Each item was checked with the maintainer's headless runs before shipping; the run logs are not in this repo, and every sample is small.
- **`## Models` in `company/profile.md`**: pick the model per role (`builders`, `slice reviews`, `qa`, `final review`). Survives plugin updates, unlike editing agent files. In two runs the manager spawned the builder on Haiku and the slice review on Sonnet as the profile said, the opposite of the agent defaults.
- **`## Budget`**: `stop above $5 per brief`. The manager keeps a running estimate from agent token counts and stops to ask before the next agent once it's over. It stopped as asked in the one run that set a limit. The estimate uses blended per-token rates measured on one machine, not list prices (Sonnet and Haiku measured, Opus from two runs, Fable a guess): right within 2% on an 11-agent build and six QA runs, but about twice too high on a small two-agent run, so it errs toward stopping early.
- **Cost line** at the end of the manager's report: each agent run with model and tokens, and the estimated total, labelled an estimate.
- **`risk: low | normal | high` in each brief**, set by the product agent. On six ideas of known risk it matched five (a CSV export of the user's own tasks was rated high, with a stated reason) and rated no high-risk idea low. The manager can raise a brief's risk, never lower it. In the gift-cards test two runs judged the same brief differently (one raised it to high), so the call is not stable.
- **`Owner reviews each slice: risky only`** as a gate (`/dev-team:setup` now asks when to stop for you). One run judged the brief risky and stopped after slice 1; the other judged it not risky and went on. A brief with no `risk:` field falls back to the topic test (security, money, user data); that case was not run.
- **`company/preferences.md`**: ways you want things done, read first by the manager. Both runs followed a test preference. The manager offers to add a line after you correct the same thing twice and writes only after your yes; that path was not exercised, and whether it helps is unproven.

## 0.8.0 — 2026-11-25
Three review and QA changes, each tested before shipping (numbers below).
- **QA on Haiku for briefs with no screen.** Six QA runs against a copy of a real tool with planted faults: Haiku caught both detectable faults in both runs for about $0.15 a run, against $0.46–0.55 for Sonnet, and reported more real bugs (3 of 5 against 1–2). A Sonnet run capped at a tool-call budget cost $0.26–0.33 and found less. A small sample (two runs per variant, one CLI task); UI work and other kinds of backend work are untested, so a brief with a screen keeps the default model.
- **Two Haiku slice reviews for a one-slice brief that isn't risky,** instead of one Sonnet review. Four runs per model on each of two real slices: two Haiku reviews together reported about 3.2 and 5.3 of the known issues against about 1.8 and 3.3 for one Sonnet review, at about $0.10 against $0.26. The worst bug was found by Sonnet in 4 of 4 runs and by Haiku in 2 of 4, so slices judged hard and risky briefs keep the default model.
- **The final whole-diff review verifies the last fix round** instead of a separate re-check, when a whole-diff review follows. On a tree with a fix removed it said NOT FIXED in 2 of 2 runs, with a reproduction; on the fixed tree it raised no false alarm in 2 of 2 (one fix, two runs per case: a signal, not a rate). A NOT FIXED verdict starts another round with a normal re-check, and earlier slices keep theirs.
- Tested and rejected, not shipped: a one-hour cache for agents (net -$22 over 190 real spawns, because most spawns are one-offs) and dropping the Skill tool from agents (real runs use it: 18 of 53 review runs load the security skill).

## 0.7.5 — 2026-11-25
- The manager's list of mechanical tasks for Haiku now names generating test data from a clear recipe (large fixture sets, sample files, fake records). Small fixtures stay inside the builder's own run, where a separate spawn would cost more than it saves. The tests that prove the done-checks are still written by the builder.

## 0.7.4 — 2026-11-25
Riskier briefs get a stronger final review.
- When a brief touches security, money or user data (auth, tokens, secrets, payments, permissions, personal data), the whole-diff review always runs, even for a one-slice brief, on the strongest model you have (e.g. Opus), plus a second review on the default model (for a one-slice brief, its slice review); the manager merges their findings. Tested on a module with 10 planted security bugs (OAuth state bypass, token in logs and in a world-readable file, timing-unsafe HMAC check, path traversal, shell and SQL injection, open redirect, pickle from `/tmp`), two runs per model: Opus and Sonnet each found all 10 in both runs. Opus also reproduced every finding with a working exploit and found real issues beyond the planted ones (a draft-export traversal that reads the saved tokens; a token saved without `expires_at`, so the app never stays signed in). Sonnet found them by reading. Cost per review: Opus $0.49–0.72, Sonnet $0.17. On the real code of an earlier build, separate review runs caught different bugs, which is why the second review is there.

## 0.7.3 — 2026-11-25
Builders default to Sonnet; slice reviews run on Haiku.
- `frontend` and `backend` default to Sonnet instead of inheriting the session model. The two builders were 53% of agent cost in 149 measured runs. On three build tasks with hidden acceptance checks (one of them with the edge cases left out of the brief), Sonnet passed every check Opus did in every delivered run, at a third to a half of the cost. All three test tasks were backend work: `frontend` moves on the same reasoning, with the designer's critique and QA still checking what it builds. Set `model: inherit` in their agent files for the old behaviour.
- The manager names a stronger model, if you have one, for a builder task it judges hard or for a fix that already failed a round. A report that says blocked or unverified is rerun, not passed.
- Per-slice reviews run on Haiku when a brief has more than one slice; the review of the whole diff at the end stays on Sonnet, and so does the only review of a one-slice brief, any slice the manager judges hard (security-critical code, money, user data, a migration), and the re-check after a fix. On two independently written fixtures (16 seeded defects, 7 runs per model) Haiku found 56 of 58 and Sonnet 56 of 58, at roughly a seventh of the cost; a Haiku review plus a Sonnet review together caught every defect.
- Builders create and change files with Edit and Write, never with shell heredocs. In the tests 7 of 14 Sonnet runs tried to write files through heredocs, which the shell's safety check can refuse, and 4 of them delivered nothing. With this line in the agent file, all 3 Sonnet runs on the task that stalled most delivered and passed every check.

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
