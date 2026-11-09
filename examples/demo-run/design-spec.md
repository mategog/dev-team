# Habit streak: design spec (T1)

**User goal:** see at a glance how many days in a row each habit has been kept, without leaving the list.

## Placement
- Row order stays `checkbox, name`, then a new third child: `<span class="streak">3 days</span>`. Append it after the name span inside the existing `li`; no wrapper, no new element in front.
- Right-aligned in the row (`margin-left: auto`), so every streak lines up in one column on the right edge of the 480px list. Why: numbers in one column scan like a tally sheet; inline after the name they would jump around with each name's length.
- Vertical alignment: the row's existing `align-items: center`. Existing `gap: 10px` and `padding: 10px 0` unchanged.

## Look (existing tokens only)
- `color: var(--ink); opacity: 0.7` (renders about #61615f on --paper #faf8f3, about 5.9:1 contrast; AA needs 4.5:1).
- `font-size: 14px` (body is 16px), weight 400, `font-variant-numeric: tabular-nums`, `white-space: nowrap`, `flex-shrink: 0`.
- Name gets the room: name span `flex: 1; min-width: 0; overflow-wrap: anywhere`.
- Not --accent: green would read as a reward signal; this is a quiet fact, not a prize. Do not reuse `.empty`'s #777 (fails AA on --paper).
- No icon, no background, no border, no bold, no transition or animation. Value changes appear on the next render.

## Copy (exact)
- streak 1: `1 day` · streak n > 1: `n days` (plain digits, no thousands separator: `1000 days`).
- streak 0: render no span at all. No "0 days", no placeholder, no empty element, no lapse message.
- Nothing else is added anywhere ("streak", "keep going", etc. are out).

## Screen reader
- The streak is a real text node in the row; no `aria-hidden`, no `aria-label`, no visually hidden extra text. Reading order: checkbox, name, streak, e.g. "checkbox, checked, Read, 3 days". At 0: "checkbox, not checked, Read".
- No `aria-live`: the number changes in direct response to the user's own tick, and a live announcement would be noise.

## Edge cases
- Long name, 375px wide (list is 343px): the name wraps onto several lines; the streak stays on one line, right edge, centred against the name block. No horizontal scroll, no truncation.
- One very long unbroken word: breaks anywhere instead of pushing the streak out.
- Many habits: nothing changes per row; the column just repeats.
- Mixed rows (some 0, some not): rows with 0 simply have no right-hand text; names do not shift.

## Acceptance checks
1. DOM per row: `li > input[type=checkbox] + span(name) + span.streak` only when streak >= 1.
2. Streak text contrast on --paper >= 4.5:1 (computed colour check).
3. At 375, 768 and 1440px: no horizontal scroll; streak never wraps ("12 days" on one line).
4. Ticking today's box changes the number in place with no animation and no layout shift of the name.
5. No new colours, fonts or tokens in `src/styles.css`; only `.streak` and the name span rules are added.

Out of scope, flagged: the checkbox has no accessible name today (the name span is not its label). Pre-existing; not changed by this feature.
