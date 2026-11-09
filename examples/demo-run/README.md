# Demo run: "show each habit's streak" in Tally

The first real end-to-end `/dev-team:build`, run on 2026-11-09 with dev-team 0.4.0 on a tiny habit-tracker app (plain HTML/JS, Node's test runner). Nothing here was edited after the run except removing local folder paths.

| File | What it is |
|---|---|
| [brief.md](brief.md) | The product brief: approved scope (frozen), the manager's plan, and the progress log with status `done` |
| [design-spec.md](design-spec.md) | The designer's spec that frontend built to |
| [code.diff](code.diff) | The code change: `currentStreak()` + 10 tests, the streak label in the list, two CSS rules |
| [run-log.md](run-log.md) | Step-by-step log with timings, plus every problem the run found in the plugin itself |
| [screens/](screens/) | The built UI on desktop and mobile |

**Result:** ~15 minutes from command to local commit (about 4 of them waiting for the owner's approval). 13/13 tests passing, QA `pass`, review `approve`, designer `looks right`. Nothing pushed.

**What it found in the plugin:** the product agent picked up a parent folder's profile, the designer couldn't save screenshots, the shared dev server wasn't covered, and review filed a reproduced bug "below the bar". All four are fixed in 0.4.1 — see the [CHANGELOG](../../CHANGELOG.md).
