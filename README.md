# Mindflow by Eirene Stack

Mindflow is a mobile-first self-discovery assessment web app focused on calm UX and deterministic local scoring.

> This app is for personal insight only and is **non-diagnostic**.  
> It is **not a clinical, diagnostic, or official IQ assessment**.

## Local setup

The tracked `package-lock.json` supports deterministic installation with `npm ci`.
CI specifies Node.js 20. The locked Vite/Vitest versions declare Node.js
`^18.0.0 || >=20.0.0` in their `engines` metadata; this is not a claim that
every matching version has been tested. The project does not pin a Node or npm
version in `package.json` or a version file. Use an npm version that supports
lockfile version 2. This validation task passed with Node.js 24.19.0 and
npm 11.9.0; it did not test Node.js 20 or other versions.

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Start the local dev server:
   ```bash
   npm run dev
   ```
3. Open the URL shown by Vite (usually `http://localhost:5173`).

## NPM commands

- `npm run dev` – start Vite in development mode.
- `npm run lint` – run the configured TypeScript check (`tsc --noEmit`).
  The root config only references the app project; `npm run build` runs
  `tsc -b` to check that project before bundling.
- `npm run test` – run Vitest test suite.
- `npm run build` – generate production build in `dist/`.
- `npm run preview` – preview production build locally.

## CI

GitHub Actions runs on every `push` and `pull_request` via `.github/workflows/ci.yml`.

The CI pipeline uses Node 20 and currently runs:

1. `npm install`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

The lockfile is tracked. CI still uses `npm install`; `npm ci` is the
recommended command for reproducible local or clean-environment setup.

## Environment variables

No environment variables or cloud-service secrets are required to develop, test,
or build the app. It uses local state and localStorage, without a backend.
`.env.example` contains `VITE_APP_NAME=Mindflow` as an optional example; the
application currently does not read it, so copying it to `.env` is unnecessary.
Do not put secrets in `VITE_*` variables: Vite exposes them to browser code.

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
