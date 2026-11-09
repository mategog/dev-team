# Contributing

Thanks for helping. This plugin stays small on purpose, so the bar for adding things is "does a solo builder clearly need this?"

## Ground rules
- **Markdown only.** No hooks, scripts, installers, network calls or telemetry in the plugin itself. If an idea needs code, propose it as a separate optional plugin.
- **Keep agents short.** Every line is paid for in tokens on every run. Prefer one sharp rule over a paragraph.
- **Say what's enforced.** If you add a rule that Claude Code can't enforce, it's an instruction — the README's "What is enforced" section must stay true.
- **No invented facts.** Any number or claim about another tool needs a source and a date.

## Making a change
1. Edit the agent or skill.
2. Try it: install from your local folder (`/plugin marketplace add /path/to/dev-team`, then `/plugin install dev-team@dev-team`) and run the flow it affects in a scratch project.
3. Add a line to `CHANGELOG.md` and bump the version in **both** `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` — installed copies only update when the version changes.
4. Open a PR describing what you ran and what happened (including what didn't work).

## Reporting a problem
Open an issue with: the command or agent, what you expected, what happened, and the relevant part of the brief or report. Remove anything private from your `company/` files first.
