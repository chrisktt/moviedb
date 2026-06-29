# MovieDB — Agent Guide

## Project Overview

MovieDB is a local-first, offline-capable movie tracker implemented as a **Progressive Web App** (PWA). It uses **Yjs CRDT** for data modeling and **WebRTC (y-webrtc)** for peer-to-peer sync between devices — no backend server required. Data is persisted to IndexedDB via `y-indexeddb`.

**Tech stack:** Vanilla JavaScript (ESM), Vite, Yjs, y-webrtc, y-indexeddb, vite-plugin-pwa (workbox).

---

## Commands

```bash
pnpm dev          # Start Vite dev server with HMR (http://localhost:5173)
pnpm build        # Production build → dist/
pnpm preview      # Preview production build locally
```

There is currently **no test framework, no linter, and no type checker** configured. When adding one:

- **Lint:** Use ESLint with `@eslint/js` + `eslint-config-prettier`. Run with `pnpm lint`.
- **Tests:** Use Vitest (builds on Vite, native ESM support). Run single tests with:
  ```bash
  pnpm vitest run path/to/file.test.js        # specific file
  pnpm vitest run -t "test name pattern"       # filter by name
  ```
- **Type checking:** Not applicable (vanilla JS). If migrating to TypeScript, add `tsc --noEmit`.

---

## Code Style

### Module System

- **ESM only** (`"type": "module"` in package.json).
- Use `import` / `export` exclusively. No `require()`, no CommonJS.
- Import extensions are required for relative paths: `import { ydoc } from "./db.js"`.
- `import * as Y from "yjs"` is the standard Yjs import convention.

### File Organization

```
src/
  main.js          # Entry point — DOM shell creation, boot sequence
  app.js           # Application wiring — connects data layer to UI
  db.js            # Yjs Y.Doc, Y.Map, CRUD operations, IndexedDB persistence
  sync.js          # WebRTC P2P provider, connection lifecycle
  style.css        # All styles (dark theme, CSS custom properties)
  components/      # UI components — one file per component
```

### Naming Conventions

- **Files:** kebab-case (`movie-list.js`, `connection-status.js`).
- **Functions:** camelCase (`getAllMovies`, `renderMovieList`, `escAttr`).
- **Exported functions:** camelCase verbs (`addMovie`, `updateMovie`, `deleteMovie`, `connect`, `disconnect`).
- **Global state variables:** camelCase in module scope (`formRoot`, `editingId`, `webrtcProvider`).
- **DOM element IDs:** kebab-case (`movie-list-section`, `mf-title`, `cs-dot`).
- **CSS classes:** kebab-case, BEM-lite (`movie-card`, `movie-info`, `.status-dot.online`, `.btn-primary`).
- **CSS custom properties:** `--kebab-case` in `:root` (`--bg`, `--surface`, `--accent`, `--text`, `--radius`).

### Component Pattern

Components follow a **render-function + module-scope state** pattern (no framework):

```js
let moduleScopedState = null;

export function renderThing(root, ...args) {
  // 1. Store root reference
  // 2. Set innerHTML from data
  // 3. Attach event listeners with querySelector
  // 4. Return cleanup function (if needed)
}
```

Key conventions:
- Components accept DOM element roots passed from the parent (never query `document` for selectors outside their root).
- Re-renders overwrite `innerHTML` and re-attach events.
- Unsubscription callbacks are returned for cleanup (`onChange` return value, `onPeersChange` return value).
- Each component's JS file has its own private helper functions for presentation logic.

### Data Layer (`db.js`)

- The single `Y.Doc` instance (`ydoc`) is the source of truth. It is exported and shared with `sync.js`.
- Movies are stored in a `Y.Map` keyed by UUID (`crypto.randomUUID()`).
- Each movie value is a **JSON-stringified object** in the Y.Map (Yjs does not natively store arbitrary objects).
- Movie object shape:
  ```js
  {
    title: string,          // required
    year?: number,          // 1888–2100
    director?: string,
    watchedAt?: string,     // ISO date string ("2026-06-28") — presence = watched
    rating?: number,        // 1–10
    notes?: string,
    addedAt: number,        // Date.now() — set once on creation
    updatedAt: number       // Date.now() — set on every mutation
  }
  ```
- CRUD functions return the new/updated object (with `id` attached) or `undefined` on failure.
- `onChange(callback)` observes the Y.Map and passes the full sorted movie array to the callback. Returns an unsubscribe function.
- `whenReady()` resolves when IndexedDB persistence has loaded. **Must be awaited before reading data.**

### Sync Layer (`sync.js`)

- `connect(roomName)` is idempotent — returns existing provider if already connected.
- Signaling uses `wss://signaling.yjs.dev` (public relay, no data passes through it).
- `getPeers()` returns the awareness state count (includes self, so 1 = no peers).
- Event cleanups use the `() => {}` no-op pattern for edge cases where the provider is null.

### DOM & HTML

- HTML generation uses template literals with manual escaping — **no HTML templating library**.
- Two escaping functions are duplicated across component files:
  - `esc(str)` — escapes for `innerHTML` text content (creates a div, sets `textContent`, reads `innerHTML`).
  - `escAttr(str)` — escapes for HTML attribute values (replaces `&`, `"`, `<`, `>`).
- Only use `esc` for text content insertion; `escAttr` for attribute values.
- Event handlers use `querySelector` + `addEventListener` on the component's root element.
- Form data is read from individual `document.getElementById()` calls at submit time, not stored in state.

### CSS

- Dark theme only; all colors defined as custom properties in `:root`.
- Color tokens: `--bg` (page), `--surface` / `--surface2` (cards/inputs), `--accent` (buttons/focus), `--text` / `--text-muted`.
- Max width: `640px` centered; mobile-first layout with `flex` + `gap` for spacing.
- Form inputs use `:focus` with `border-color: var(--accent)`.
- No CSS preprocessor.

### Build & PWA

- Vite config uses `vite-plugin-pwa` with `registerType: "autoUpdate"` — the service worker auto-registers and updates.
- Workbox pre-caches all assets matching `**/*.{js,css,html,ico,png,svg,woff2}`.
- PWA manifest is generated by the plugin (name: "MovieDB", short_name: "MovieDB").
- Icons are referenced as `icon-192.png` and `icon-512.png` — placeholder file names (no actual icons committed yet).

---

## Caveats

- **No test infrastructure yet.** When adding tests, create `vitest.config.js` and add `"test": "vitest"` to scripts.
- **No linting.** Do not add comments unless truly necessary — keep the codebase comment-free.
- The `y-webrtc` signaling server is a **public** service. For production, run your own signaling server or switch to y-websocket.
- Both devices must be online simultaneously for P2P sync to occur. There is no relay server holding data.
- Movie data is stored as JSON strings inside Yjs. For large datasets (1000+ movies), evaluate switching to `Y.Array` with subdocuments for better incremental sync performance.
