---
status: done
baseline: d72da88e2cc4adb2009218077271044a371b7e98
branch: dev-team/habit-streak
---
# Habit streak in the list (Tally)

## Approved scope
<!-- Frozen after the owner approves. Only the owner changes this section. -->
- **Problem:** Owner's request, word for word: "Show each habit's current streak (how many days in a row it has been done, ending today or yesterday) next to its name in the list." In a user's words: "I tick my habits every day but I can't see how long I've kept each one going."
- **Who it's for:** Someone using Tally daily, at the moment they open the list and tick today's boxes. Nothing on screen shows how long a habit has been kept up.
- **Premise check:**
  - *Do nothing:* the list stays a row of checkboxes with no history. Nothing breaks; the app just gives less reason to come back.
  - *What exists:* nothing in Tally. Streaks are standard in habit trackers, so the idea is proven. The `done` day list per habit already holds everything needed, so no new storage.
  - *How users find it:* they don't have to. It shows in the list they already use, with no new screen, setting or click.
  - *Verdict:* worth building; it is already the smallest version.
- **Scope:**
  - Each habit row shows its current streak next to the name, e.g. "3 days" ("1 day" in the singular). Calm, plain text, short.
  - Current streak = consecutive days the habit was done, counting back from today if today is done, otherwise from yesterday. If neither is done, the streak is 0 and nothing is shown.
  - A streak ending yesterday is still shown. Today not yet ticked is not treated as a miss. Ticking or unticking today updates the number immediately.
  - Calculated from the existing `done` dates. The stored localStorage data does not change. Logic is a pure function in `src/habits.js`, UI in `src/app.js`, using existing `:root` tokens and the existing row layout. No new dependencies, no server.
- **Non-goals:** longest/best streak; streak freezes or grace days; weekly or non-daily habits; calendar or history view; badges, confetti, animation or milestones; "streak lost", "don't break it" or any other guilt or urgency message; reminders or notifications; sorting or filtering by streak; editing past days; changing the stored data shape; sharing or export; any server or account.
- **Done-checks:**
  1. A habit done today, yesterday and the day before shows "3 days".
  2. A habit done yesterday and the day before, but not yet today, still shows "2 days"; ticking today makes it "3 days".
  3. A habit last done two or more days ago shows no streak, and no message about the lapse appears.
  4. A gap breaks the count: done today and yesterday, skip, then three earlier days shows "2 days", not 5.
  5. Unticking today's box lowers the number at once, without a reload; a reload shows the same numbers.
  6. A new habit with nothing ticked shows no streak; one day shows "1 day".
  7. The streak text is part of the row for screen readers (not colour or icon only). Existing checkbox, add and empty-list behaviour is unchanged, and the streak uses existing tokens and the existing row layout.
  8. Stored data format is unchanged (an existing saved list loads and shows streaks), `package.json` gains no dependencies, and `npm test` passes with new tests for the streak rules.
- **Likely ways a user breaks it:**
  - Ticks and unticks today repeatedly, or ticks around midnight so "today" changes while the page is open.
  - `done` dates out of order or duplicated (stored in tick order, not sorted).
  - A future-dated entry (device clock changed) or a very long history.
  - Daylight-saving days: "yesterday" must be the previous calendar day, not 24 hours ago.
- **Teams needed:** frontend (row rendering) and backend (pure streak logic and tests in `src/habits.js`); both small, one coding agent can do both. Designer: a light pass on how the streak sits next to the name, no new screen. No marketing or finance (none in use for Tally, no price).
- **Risks and open questions:**
  1. Zero streak: show nothing (assumed) or "0 days"? Assumption: nothing, which also avoids a guilt signal.
  2. Wording: plain "3 days" (assumed) vs "3-day streak" or an icon. Assumption: plain text, no icon, in line with the calm voice.
  3. Midnight rollover: the list only refreshes on interaction. Assumption: not fixed here; the number is right whenever the list re-renders. Say if you want it live at midnight.
  4. Future-dated entries: assumed ignored for the streak.

## Plan
<!-- Written by the manager after approval. -->
All paths are relative to the Tally project root `<parent project>/builds/07-dev-team-demo`. Baseline d72da88, branch `dev-team/habit-streak`.

**Contract (backend -> frontend)**
- `src/habits.js` exports `currentStreak(done, today)`: `done` is the habit's existing array of local "YYYY-MM-DD" strings (any order, may contain duplicates or future dates); `today` is a "YYYY-MM-DD" string (the app passes `todayKey()`). Returns an integer >= 0.
- Rule: if `today` is in `done`, count back from today; else if yesterday is, count back from yesterday; else 0. Each step back is the previous *calendar* day (DST-safe, no 24h arithmetic). Dates after `today` are ignored. Pure, no I/O.
- Copy strings: `1` -> "1 day", `n>1` -> "n days", `0` -> nothing rendered (no element, no message).
- No change to the stored data shape or the localStorage key.

**Tasks**
| # | Owner | Files owned | Input | Done-check |
|---|---|---|---|---|
| T1 | dev-team:designer | `company/briefs/tally-habit-streak-design.md` (new) | brief, `src/styles.css`, `src/app.js` | Spec says where the streak text sits in the row, its token/size, the exact strings, and screen-reader text. Existing tokens only, no new screen. |
| T2 | dev-team:backend | `src/habits.js`, `test/habits.test.js` | contract above | `currentStreak` exported; tests cover done-checks 1-4 and 6 plus out-of-order, duplicates, future dates, DST and month/year boundaries; `npm test` passes; no deps added. |
| T3 | dev-team:frontend | `src/app.js`, `src/styles.css` | contract, T1 spec | Each row shows the streak per spec; ticking/unticking updates at once; 0 shows nothing; checked in a browser at http://localhost:5173. |
| T4 | dev-team:qa | none (read-only) | brief done-checks 1-8, `npm test`, `npm run dev` | pass/fail per done-check with evidence |
| T5 | dev-team:review | none (read-only) | diff since d72da88 | approve / findings |
| T6 | dev-team:designer | `demo-captures/*.png` (not committed) | running app URL | looks right / findings |

**Order:** T1 and T2 in parallel -> T3 (needs both) -> T4 and T5 in parallel -> T6 -> fix loop (max 3 rounds) -> commit.

## Progress log
<!-- Append-only. One dated line per step, verdict or decision. -->
- 2026-11-09 · product · brief drafted, status draft, waiting for owner approval
- 2026-11-09 · product · revised against Tally's own company/profile.md (voice, no guilt messages, localStorage only, no new dependencies); first draft had used the parent project profile by mistake
- 2026-11-09 · owner · approved as written; open-question assumptions accepted (nothing at 0, plain "3 days", no live midnight update, future dates ignored)
- 2026-11-09 · manager · plan written (contract, T1-T6), status building
- 2026-11-09 · T1 designer · spec written (company/briefs/tally-habit-streak-design.md), right-aligned span.streak, ink@0.7 14px · done
- 2026-11-09 · T2 backend · currentStreak + 10 tests in src/habits.js / test/habits.test.js; npm test 13/13 (manager re-ran) · done
- 2026-11-09 · T3 frontend · streak span in src/app.js + .name/.streak in src/styles.css; browser-checked strings, tick/untick, reload at 375px · done
- 2026-11-09 · manager · status testing
- 2026-11-09 · T4 qa · pass, done-checks 1-8 live in browser, npm test 13/13 (+7 TZs); 2 pre-existing baseline issues (midnight tick, checkbox label/focus) · pass
- 2026-11-09 · T5 review · approve; nit: prev() could loop forever on a skipped calendar day (Pacific/Apia 2011-12-30), graded nit by manager, not fixed · approve
- 2026-11-09 · T6 designer · looks right (1440/768/375, tick/untick, no layout shift); could not save PNGs to demo-captures/ (no shell, Write is text-only) · looks right
- 2026-11-09 · manager · not fixed: Apia skipped-day loop (nit, needs 2011 Samoa data), midnight tick saves previous day and checkbox label/focus (pre-existing in baseline, outside approved scope) · status done
