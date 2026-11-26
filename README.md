# GROUND ZERO

GROUND ZERO is a browser-based, first-person survival maze built with Three.js. It is designed to run on desktop browsers, mobile browsers and Telegram Mini Apps.

## Current gameplay

- First-person camera inside a dark, grid-based facility.
- Procedurally placed corridor lighting, fog and a camera-mounted flashlight.
- Fictional enemies that navigate the maze corridors instead of moving through walls.
- Keyboard and touch movement, desktop mouse aiming and mobile look controls.
- Fictional service-pistol game mechanic with ammunition, reload and hit feedback.
- Health, pause, restart and session-end HUD.

## Controls

### Desktop
- **W / A / S / D** or arrow keys: move.
- **Mouse**: aim (pointer lock is requested when the game starts).
- **Right mouse drag**: aim when pointer lock is unavailable.
- **Left mouse** or **Space**: fire.
- **R**: reload.
- **F**: toggle flashlight.
- **Esc**: pause / resume.

### Mobile
- Left virtual stick: move.
- Right side of the screen: look around.
- FIRE: shoot.
- ↻: reload.
- ◉: flashlight.

## Project structure

- `index.html`: game shell and HUD.
- `styles.css`: responsive desktop/mobile interface.
- `src/main.js`: Three.js renderer, game loop, input and session state.
- `src/maze.js`: 3D environment geometry and lighting.
- `src/maze-grid.js`: normalized maze data, collision checks, BFS pathfinding and enemy spawn selection.
- `src/player.js`: camera-mounted equipment and weapon animation.
- `src/monster.js`: enemy model and corridor-following movement.
- `src/audio.js`: optional Web Audio effects.
- `tests/`: Node.js tests for the maze grid and legacy game-state module.

## Validation

Requires Node.js 22 or newer:

```bash
npm run check
npm test
```

The Three.js runtime module is loaded from the pinned jsDelivr URL, so the game needs an internet connection. No backend or multiplayer server is implemented yet.

## GitHub Pages

The Pages workflow runs syntax checks and unit tests on pushes to `main` and `rebuild-fps-foundation`, and on pull requests targeting `main`. The deploy job is restricted to pushes on `main`, so testing a feature branch does not replace the public site.

The project Pages URL is:

https://vitaliiprudnikov771-png.github.io/my-project/

## Telegram Mini App

The page initializes the Telegram Web App SDK when it is available and otherwise runs as a regular browser game. Telegram identity data is not used for authentication; there is no server-side identity or multiplayer implementation.
