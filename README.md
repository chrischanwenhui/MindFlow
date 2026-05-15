# Mindflow by Eirene Stack

Mindflow is a **mobile-first self-discovery assessment web app**.

It combines:
- personality preference signals (MBTI-style dimensions)
- Big Five/OCEAN-style traits
- RIASEC-style career interests
- enneagram-inspired motivation patterns
- cognitive-style reasoning prompts (pattern, verbal, numerical, spatial)

> This app is for personal insight only and is **non-diagnostic**.
> It is **not a clinical, diagnostic, or official IQ assessment**.

## MVP included in this repo

- Landing page
- Assessment start page
- Question flow with progress indicator
- Results summary page
- Report preview page
- Deterministic local scoring engine
- Local persistence with `localStorage`

## Tech stack

- React + TypeScript
- Vite
- Vitest

## Scripts

- `npm install`
- `npm run dev` – start local server
- `npm run build` – production build
- `npm run lint` – type-check
- `npm run test` – run tests

## Project structure

- `src/App.tsx` – screen flow and UI
- `src/data/questions.ts` – data-driven question bank
- `src/engine/scoring.ts` – deterministic scoring/profile generation
- `src/engine/scoring.test.ts` – basic scoring tests
- `src/styles.css` – mobile-first styling

## Notes

This MVP intentionally uses local state/localStorage and keeps architecture simple so Supabase-backed accounts and report storage can be added in a future PR.
