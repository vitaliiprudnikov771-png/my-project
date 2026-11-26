# GROUND ZERO

A mobile-first Three.js arena-trials game designed for Telegram Mini Apps and browsers.

## Gameplay

- Third-person camera in a muted industrial training arena.
- Scan and mark hovering training drones. There are no guns or real-world weapon mechanics.
- Avoid drone contact, collect energy cells, keep your shield charged.
- Increasing waves, score, personal best saved in localStorage.
- Touch joystick, swipe-to-look, scan and dash controls; WASD, right-mouse drag, F and Shift on desktop.
- Pause/resume, restart, sound toggle and graphics quality setting.

## Structure

- `src/main.js`: renderer, scene lifecycle, HUD, wave orchestration and Telegram SDK.
- `src/world.js`: arena geometry, player avatar, drones, energy pickups and scan effects.
- `src/input.js`: touch, mouse and keyboard input.
- `src/game-state.js`: pure game-state rules and cooldowns.
- `tests/game-state.test.js`: node:test coverage for session, waves, shield, scanner and dash.
- `emoji-style.json`: validated Telegram Premium emoji role map from the supplied catalogue.

## Run tests locally

Requires Node.js 22 or newer:

```bash
npm test
npm run check
```

The Three.js module is loaded from jsDelivr at runtime, so the page needs an internet connection.

## GitHub Pages

1. In repository Settings → Pages, set **Build and deployment → Source** to **GitHub Actions**.
2. Push to `main`; `.github/workflows/pages.yml` runs tests and publishes the static site.
3. The project URL is `https://vitaliiprudnikov771-png.github.io/my-project/`.

## Telegram Mini App

Telebot Creator opens the deployed HTTPS URL with a `web_app` inline-keyboard button. Telegram WebApp SDK calls `ready()` and `expand()`; the first name from `initDataUnsafe` is used for the greeting only and is not trusted for authentication.

Premium custom emoji are Telegram message markup, not browser UI. The validated IDs in `emoji-style.json` are used in bot messages with `parse_mode="HTML"`; the browser game uses its own interface glyphs.