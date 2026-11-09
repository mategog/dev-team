# dev-team run log — Tally habit streak (2026-11-09)

Feature: "Show each habit's current streak (how many days in a row it has been done, ending today or yesterday) next to its name in the list."
Plugin: dev-team v0.4.0 (installed user-wide). Command: `/dev-team:build`. Result: local commit `cf4b938` on `dev-team/habit-streak` (baseline `d72da88`). Nothing pushed.
Times are local time; durations are from agent reports or tool timings, rounded.

## Steps

| # | Time | Agent | What it did | Verdict | Duration |
|---|---|---|---|---|---|
| 0 | 15:02 | main | Loaded `/dev-team:build`, checked `company/briefs/` for unfinished briefs (none) and `company/profile.md` (present) | — | <1 min |
| 1 | 15:02 | product | Wrote brief draft — **in the wrong folder** (parent project `company/briefs/`, using the parent project profile) | draft | 47 s |
| 1b | 15:03 | main | Caught it, moved the brief into Tally's `company/briefs/`, sent product back | — | <1 min |
| 1c | 15:03 | product | Revised brief against Tally's own profile (no-guilt copy, localStorage only, no deps); dropped the demo question | draft | 85 s |
| 2 | 15:05–15:09 | owner | Approval gate: approved as written, all four assumptions accepted | approved | ~4 min (human) |
| 3 | 15:09 | main | Created branch `dev-team/habit-streak`, wrote baseline/branch/status into the brief | — | <1 min |
| 4 | 15:10 | manager | Plan: contract `currentStreak(done, today)`, copy strings, tasks T1–T6 with file ownership | done | ~1 min |
| 5 | 15:11 | designer (T1) | Design spec `company/briefs/tally-habit-streak-design.md`: right-aligned `span.streak`, ink @0.7, 14px, nothing at 0 | done | 41 s (parallel with T2) |
| 6 | 15:11 | backend (T2) | `currentStreak` in `src/habits.js` (Set + calendar-day step back) + 10 tests | done, 13/13 | 32 s |
| 7 | 15:12 | frontend (T3) | Streak span in `src/app.js`, `.name`/`.streak` in `src/styles.css`; browser check at 375px | done | 49 s |
| 8 | 15:13 | qa (T4) | All 8 done-checks live in browser + break attempts (rapid toggling, dupes, future dates, 1000-day history, long name, HTML in name, 7 time zones) | **pass** (ran it) | 2 m 20 s |
| 9 | 15:13 | review (T5) | Diff vs d72da88, tests in 8 time zones, XSS check, spec/non-goals check | **approve** (read + ran tests) | 2 m 40 s (parallel with T4) |
| 10 | 15:16 | designer (T6) | Critique live at 1440/768/375, tick/untick, layout-shift check | **looks right** — but saved **no** screenshots | 59 s |
| 11 | 15:17 | manager | Status done, 3 lines to `company/decisions.md`, `npm test` 13/13, local commit `cf4b938` | committed | — |
| 12 | 15:17 | main | Verified: commit contents, diff, `npm test` (13/13) | matches report | <1 min |
| 13 | 15:17–15:18 | main | Captured `streak-list-desktop.png` / `streak-list-mobile.png` with headless Chrome + seeded localStorage (designer couldn't); confirmed no horizontal scroll at 375px in the in-app browser | — | ~2 min |

Total from command to commit: ~15 min wall clock, of which ~7 min agent delivery and ~4 min waiting on the owner.

## Problems and surprises with the plugin

1. **Product agent resolved `company/` to the wrong project (real bug).** It read `<parent project>/company/profile.md` and wrote the brief to `<parent project>/company/briefs/`, because the parent project CLAUDE.md (loaded into the session context) names `company/profile.md` etc., and the agent prompt gives bare relative paths. The task text did name the Tally project root. Fix: in every agent and the build command, resolve `company/` against the project root (cwd / git root), and say loudly if falling back elsewhere. The manager worked around it by repeating a path warning in every brief; no agent repeated the mistake after that.
2. **Designer can't produce image files.** No Bash; browser screenshots come back only as images in its context; `Write` is text-only. So "save the critique screenshots" was impossible, and a critique leaves no visual evidence on disk. The manager reported this honestly instead of working around it. Fix: give the designer a way to save screenshots, or make QA/frontend (which have a shell) save them.
3. **Shared browser/dev-server state between parallel agents isn't covered.** The manager had to tell QA and designer not to stop the server and to clear seeded localStorage. Nothing in the plugin covers this.
4. **Spec acceptance checks had no owner.** Frontend skipped the spec's 768/1440px, contrast and layout-shift checks (and said so); QA and the designer covered them by chance. The plan template should assign them.
5. **Review used its own "80+ confidence" bar** and put a reproduced infinite loop (Pacific/Apia skipped day) "below the bar". The manager's own grading step caught that and graded it as a nit. Without that step a real hang could be silently dropped.
6. **Subagent reports arrive as cross-session "messages" (SubagentHandback)**, not as the Agent tool result. Works, but noisy and confusing in the transcript.
7. **`/dev-team:*` commands weren't in the session's skill listing**, but `Skill("dev-team:build")` loaded fine. Discoverability issue (or a host listing quirk), not a blocker.
8. **Conflict with another plugin's hook:** the superpowers SessionStart hook insists on running `brainstorming` first; the build command explicitly says it replaces that. The command text won, as intended — worth keeping that sentence.
9. Product agent added a "should all steps run for the demo?" open question — reasonable but noise for the owner; it dropped it on revision.

## Product findings (not plugin bugs)

- **Midnight tick saves the wrong day** (pre-existing in baseline): with the tab left open past midnight, the first tick records yesterday. One-line fix (`todayKey()` inside the click handler). Follow-up brief candidate.
- **Checkboxes have no accessible name and lose focus after toggling** (pre-existing). Follow-up candidate.
- `prev()` would loop forever if a time zone skipped a whole calendar day (only Pacific/Apia 2011-12-30). Graded nit, not fixed.

## Captures in this folder

- `streak-list-desktop.png` — 1280×800 @2x.
- `streak-list-mobile.png` — 390px wide @2x (rendered in a 390px iframe because headless Chrome won't size a window below ~500px).
Both were taken by the main session, not the designer, with demo data seeded into localStorage (habits named "Read 20 pages", "Walk outside", "Stretch", "Drink water", "Evening journal"). First attempt had a mojibake en dash (seed page missing a charset) and a center-cropped mobile shot; both were redone.
