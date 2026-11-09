---
status: testing
baseline: 4f2a9c1
branch: dev-team/streak-reminders
---
# Streak reminders

## Approved scope
<!-- Frozen after the owner approves. Only the owner changes this section. -->
- **Problem:** "I forget to log in the evening and lose my streak."
- **Who it's for:** daily users with a streak over 7 days, at the end of their day.
- **Premise check:** do nothing → streak loss is the top complaint in feedback; already exists → phone reminders work but don't know if you've logged; how users get it → a toggle on each habit.
- **Scope:** one optional reminder per habit at a chosen time, only if the habit isn't logged yet today.
- **Non-goals:** email/SMS, smart timing, reminders for other people, a reminder history screen.
- **Done-checks:** (1) toggle on → notification at the chosen time if not logged; (2) logged before that time → no notification; (3) toggle off → no notification; (4) permission denied → clear inline message, no crash.
- **Likely ways a user breaks it:** denies notification permission; changes timezone; sets the time to one minute from now.
- **Teams needed:** designer (toggle + time picker), frontend (UI + scheduling), qa, review. No backend, no money involved.
- **Risks and open questions:** browsers may throttle timers in background tabs — accepted for v1.

## Plan
- Contract: `habit.reminder = { enabled: boolean, time: "HH:MM" } | null` in local storage.
- T1 designer → `design/streak-reminders-spec.md`.
- T2 frontend → `src/lib/reminders.ts`, `src/lib/ui/HabitRow.svelte`; done-checks 1–4; bug fixes start with a failing test.
- T3 qa → done-checks + break list. T4 review → diff since 4f2a9c1. T5 designer critique.

## Progress log
- 2026-11-08 · status building · manager
- 2026-11-08 · T1 spec written · designer · verified by reading
- 2026-11-09 · T2 built, 6 unit tests + 2 e2e pass · frontend · ran it
- 2026-11-09 · status testing · manager
