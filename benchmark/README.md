# Benchmark: does the team beat a single session?

Run 2026-11-25 with headless `claude -p`, Claude Sonnet 5.5 as the session model, on a small Node library (shopkit: catalog, cart, discounts, orders, reports, CLI; integer cents; no dependencies). Plugins were loaded one at a time from a folder; `--setting-sources project` kept the user's own settings out. All numbers are list-price cost from the harness, per run.

## Arms
plain Claude Code (no plugin) · Anthropic's feature-dev plugin · dev-team 0.9.0 · dev-team candidate (clean-code rules in the builder and review files).
Every arm got the same repository copy and the same task text. dev-team was given the build command's instructions and told to take the owner's reply "approved" at every gate. In these headless runs dev-team spawned the backend and review agents (in three runs only review); it never spawned the product or QA agents, so what was measured is a reduced dev-team.

## Rounds
- **Medium:** five features (bundle promotions, partial refunds, stock reservations, product search, order cancellation), each handed over as a complete approved brief (60 to 150 lines of code). 16 hidden acceptance checks each, written by a separate agent from the brief only, confirmed failing on the starting code. Two runs per arm and feature.
- **Hard:** multi-currency across 11 modules (38 checks) and JSON persistence with versioned migration and corruption handling (35 checks). The builders got a 2 to 4 sentence idea and a `docs/` folder of project documents in which the rules were spread over several files. Two runs per arm and task.

## Results
| | plain | feature-dev | dev-team 0.9.0 | dev-team candidate |
|---|---|---|---|---|
| Medium: hidden checks passed | 160/160 | 160/160 | 160/160 | 80/80 (5 runs, not 10) |
| Medium: mean cost / time | $0.22 / 40 s | $0.25 / 46 s | $0.75 / 218 s | $0.74 / 322 s (5 runs) |
| Hard: hidden checks passed | 146/146 | 146/146 | 146/146 | 146/146 |
| Hard: mean cost / time | $0.54 / 140 s | $0.62 / 137 s | $2.43 / 497 s | $1.91 / 396 s |

## Code quality (blind judge)
An Opus judge saw each run's diff with the arm hidden and scored six things from 1 to 5 (readable, lean, no duplication, names, fits the project, one job per function), and ranked the diffs. A deliberately messy decoy diff scored 1.0 against about 3.9 for real ones, and two judgings of the same diffs agreed. Mean score: medium round, feature-dev 4.3, plain 3.9, dev-team 3.7, candidate 4.1; hard round, feature-dev 4.2, dev-team 3.7, candidate 3.5, plain 3.1.

## What the team's review found that the checks did not
In 3 of 8 hard-task runs the reviewer said "changes needed". Defects it reproduced that no acceptance check covered: a version 1 save file with `orders: null` loaded as an empty shop instead of being rejected as corrupt (2 runs), and a store with 130,000 orders could be saved but not loaded again (1 run). We did not check whether the plain and feature-dev solutions share them.

## Limits
Backend and library work only (headless runs have no browser). Four to ten runs per cell, one task family, one session model: only large gaps are visible, and "no difference in correctness" is the honest reading. The product step, UI work, QA and risky changes were not benchmarked. The acceptance checks and the judge's rubric were written before any run and are available on request.
