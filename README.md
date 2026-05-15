# Mindflow by Eirene Stack

Mindflow is a mobile-first self-discovery assessment web app focused on calm UX and deterministic local scoring.

> This app is for personal insight only and is **non-diagnostic**.  
> It is **not a clinical, diagnostic, or official IQ assessment**.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local dev server:
   ```bash
   npm run dev
   ```
3. Open the URL shown by Vite (usually `http://localhost:5173`).

## NPM commands

- `npm run dev` – start Vite in development mode.
- `npm run lint` – TypeScript type-check (`tsc --noEmit`).
- `npm run test` – run Vitest test suite.
- `npm run build` – generate production build in `dist/`.
- `npm run preview` – preview production build locally.

## CI

GitHub Actions runs on every `push` and `pull_request` via `.github/workflows/ci.yml`.

The CI pipeline uses Node 20 and runs:

1. `npm ci`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

This ensures dependency reproducibility and release readiness before merge.

## Deploying to Vercel

Use these settings when creating the Vercel project:

- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

After connecting the repository, Vercel will build and deploy automatically on pushes to your selected branch.

## Project structure

- `src/App.tsx` – screen flow and UI logic
- `src/data/questions.ts` – data-driven question bank
- `src/engine/scoring.ts` – deterministic scoring/profile generation
- `src/engine/scoring.test.ts` – scoring tests
- `src/styles.css` – mobile-first styling

## Current scope and limitations

- Uses local state and localStorage only (no accounts/cloud sync yet).
- No backend, auth, or external profile storage in this PR.
- Assessment remains intentionally lightweight and MVP-oriented.
