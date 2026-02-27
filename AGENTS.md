# AGENTS.md

## Cursor Cloud specific instructions

This is a **Create React App** project (ChurchConnect Event Manager) — a purely client-side React PWA with no backend. All data is stored in browser `localStorage`.

### Running the app

- `npm start` — starts the dev server on port 3000. See `package.json` `scripts` for all available commands.
- `npm test` — runs Jest tests (57 tests across 4 suites).
- `npx eslint src/` — runs ESLint.
- `npm run build` — production build.

### Project structure

- `src/App.js` — main component (~1900 lines), state management and layout
- `src/views/` — tab view components (EventsView, GivingView, PrayerView, CommunicationsView, SettingsView, FamiliesView, MinistriesView, WorkflowsView, BookingsView)
- `src/components/modals/` — 10 modal components extracted from App.js
- `src/components/` — shared components (ErrorBoundary, CalendarExport, OfflineIndicator)
- `src/utils/` — pure utility functions (storage, validation, filters, calendarExport)
- `src/services/emailService.js` — EmailJS integration with fallback
- `src/services/workflowService.js` — workflow automation engine (localStorage-backed)
- `src/services/stripeService.js` — Stripe integration (simulated in demo mode when `REACT_APP_STRIPE_PUBLISHABLE_KEY` is not set)
- `.github/workflows/ci.yml` — CI pipeline (lint, test, build)

### Gotchas

- **ESLint warnings (not errors):** The codebase has lint warnings (unused variables, missing hook dependencies). These are all `warn` level and do not block builds.
- **No backend required:** `env.example` references `REACT_APP_API_BASE_URL` and `REACT_APP_REDIS_URL`, but these are placeholders for future features. The app runs fully client-side.
- **Windows-oriented scripts:** `clean`, `reinstall`, and related npm scripts use Windows `rmdir` syntax and won't work on Linux. Use `rm -rf node_modules && npm install` instead.
- **Dev server restart:** After significant file changes, the webpack dev server may serve stale bundles. Kill and restart with `npm start` if you see blank pages.
