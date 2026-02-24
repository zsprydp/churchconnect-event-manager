# AGENTS.md

## Cursor Cloud specific instructions

This is a **Create React App** project (ChurchConnect Event Manager) — a purely client-side React PWA with no backend. All data is stored in browser `localStorage`.

### Running the app

- `npm start` — starts the dev server on port 3000. See `package.json` `scripts` for all available commands.

### Gotchas

- **ESLint warnings (not errors):** The codebase has ~27 lint warnings (unused variables, missing hook dependencies). These are all `warn` level and do not block builds.
- **No backend required:** `env.example` references `REACT_APP_API_BASE_URL` and `REACT_APP_REDIS_URL`, but these are placeholders for future features. The app runs fully client-side.
- **Windows-oriented scripts:** `clean`, `reinstall`, and related npm scripts use Windows `rmdir` syntax and won't work on Linux. Use `rm -rf node_modules && npm install` instead.
