# Changelog

All notable changes. Versions follow semver; bump both `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` together.

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
