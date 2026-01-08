# Skill Grep

Filter candidates with natural language instead of clicking through 47 dropdown menus.

Connect your ATS, describe what you're looking for ("senior backend eng, 5+ years, ideally ex-FAANG, must know Go"), and get a ranked list of candidates. That's it.

## Quick Start

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000

## How it works

1. **Connect ATS** — OAuth with Google/Slack, then API key for your ATS
2. **Pick a job** — Choose which roles to evaluate, configure which pipeline stages to sync
3. **Describe your ideal candidate** — Chat interface, type naturally. "Looking for someone with distributed systems experience, bonus if they've led a team"
4. **Get results** — Candidates scored 0-100, filterable by match quality

## Project layout

```
src/
├── app/
│   ├── jobs/[id]/chat/     # criteria builder
│   ├── jobs/[id]/results/  # candidate rankings
│   └── onboarding/         # auth flow
├── components/
│   ├── chat/               # conversational UI
│   ├── jobs/               # job list & config
│   └── results/            # candidate cards
└── lib/
    ├── types.ts            # core types
    ├── mock-data.ts        # fake data for dev
    └── utils.ts            # prompt generation, etc
```

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## What's missing

This is a prototype. No real ATS integrations yet, no actual LLM scoring. The candidate data is mocked.
