# Company profile

## Product
Tally — a small web app for tracking daily habits. For people who want a streak counter without a social feed or an account wall.

## Brand
Name: "Tally". Voice: calm, short sentences, no exclamation marks. Avoid: "gamify", "crush your goals", any health claims.

## Values and hard rules
- No dark patterns: no fake urgency, no guilt notifications.
- Data stays in the browser unless the user turns on sync. [unconfirmed]
- Budget: free tiers only until 100 paying users.

## Stack
SvelteKit + TypeScript, Vitest for unit tests, Playwright for e2e. `npm run dev`, `npm test`, `npm run test:e2e`. Deployed by hand to Cloudflare Pages.

## Design system
Tokens in `src/lib/tokens.css`. Fonts: Inter for UI, IBM Plex Mono for numbers. Reuse `Button`, `Card`, `Toggle` from `src/lib/ui/`.

## Gates
- Owner approves designs before code: yes

## Teams in use
All nine. Finance: EU seller (Germany), prices include VAT.
