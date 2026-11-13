# Plan — streak reminders

- Contract: `habit.reminder = { enabled: boolean, time: "HH:MM" } | null` in local storage.
- T1 designer → `design/streak-reminders-spec.md`. Owner approves the design before T2.
- T2 frontend → `src/lib/reminders.ts`, `src/lib/ui/HabitRow.svelte`; done-checks 1–4; bug fixes start with a failing test.
- T3 qa → done-checks + break list. T4 review → diff since 4f2a9c1. T5 designer critique.
