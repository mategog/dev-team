# Contributing

Thanks for helping. This plugin stays small on purpose, so the bar for adding things is "does a solo builder clearly need this?"

## Ground rules
- **Markdown only.** No hooks, scripts, installers, telemetry or code of its own that makes network calls. If an idea needs code, propose it as a separate optional plugin.
- **Keep agents short.** Every line is paid for in tokens on every run. Prefer one sharp rule over a paragraph.
- **Say what's enforced.** If you add a rule that Claude Code can't enforce, it's an instruction — the plugin README's "What is enforced" section must stay true.
- **No invented facts.** Any number or claim about another tool needs a source and a date.
- **Copied text stays in sync.** The Project root paragraph (every agent), the Clean code and Output hygiene blocks (frontend and backend) and the six risk triggers (product and manager) exist in more than one file. Change every copy; CI fails if they drift.

## Claims about behaviour need a run
A change to what agents are told is merged as "unmeasured" unless the PR shows a paired run: the same task and model, once on `main` and once on your branch, at least 6 runs each. Include one task the change could break as well as one it should help: a new rule often fights an old one. Without that, the CHANGELOG says "not yet measured", not "better".

## Making a change
1. Edit the agent or skill in `plugins/outfit/` (or the mod in `mods/outfit-view/`).
2. Try it: install from your local folder (`/plugin marketplace add /path/to/outfit`, then `/plugin install outfit@outfit`) and run the flow it affects in a scratch project.
3. Add a line to `CHANGELOG.md` and bump the version in **both** `plugins/outfit/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` — installed copies only update when the version changes.
4. Open a PR describing what you ran and what happened (including what didn't work).

## Reporting a problem
Open an issue with: the command or agent, what you expected, what happened, and the relevant part of the brief or report. Remove anything private from your `company/` files first.
