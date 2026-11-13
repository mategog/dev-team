---
status: testing
size: normal
next: qa and review of T2, then design critique
repos:
  - path: .
    branch: dev-team/streak-reminders
    baseline: 4f2a9c1
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

## Owner checks
<!-- Checks only the owner can run. Wording frozen with the scope; tick with the date when the owner reports the result. -->
- [ ] A reminder arrives on the owner's own phone (installed PWA, screen locked).
