# Mini Game Engine Playground

A browser-based 2D side-scrolling shooter built as a mini game engine playground. Control a jet fighter, dodge incoming asteroids, and blast them out of the sky — all rendered in pure HTML/CSS/SVG with no canvas API.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript |
| State | Pinia |
| Styling | Tailwind CSS v4 |
| Build | Vite |

## Features

- **Jet fighter** rendered in SVG with animated afterburner and muzzle flash
- **Three movement modes** — keyboard, drag-and-drop, click-to-move — with priority ordering
- **Shooting** with spread bullets, cooldown, and muzzle particles
- **Asteroids** that spawn from the right with escalating difficulty over time
- **Collision detection** between bullets, asteroids, and the player
- **Explosion particles** on asteroid destruction and player death
- **Parallax star field** (3 depth layers) and animated cloud layers
- **Game loop** via `requestAnimationFrame` at ~60 fps

## Controls

### Movement

| Input | Action |
|---|---|
| `W` / `↑` | Move up |
| `S` / `↓` | Move down |
| `A` / `←` | Move left |
| `D` / `→` | Move right |
| Click & drag on plane | Drag the plane anywhere |
| Click on arena background | Plane moves smoothly to that position |

> **Priority:** drag > keyboard > click-to-move. Pressing a keyboard key cancels any active click-to-move target. Starting a drag also cancels it.

### Other

| Input | Action |
|---|---|
| `Space` | Shoot (spread burst, 250 ms cooldown) |
| `Q` | Rotate counter-clockwise |
| `E` | Rotate clockwise |
| `Scroll wheel` | Scale plane up / down |
| Click on plane | Trigger click effect + shoot |

## Game Mechanics

- **Difficulty** scales from 1× at game start up to 3× after 120 seconds — asteroids spawn faster and move quicker.
- **Asteroid types:** small, medium, large — each with different sizes and speed ranges.
- **Game over** triggers when an asteroid reaches the left edge or collides with the player.
- **Boundary clamping** keeps the plane fully inside the 800 × 500 arena at all times.

## Project Structure

```
src/
├── components/
│   ├── game/
│   │   ├── GameCanvas.vue      # Main game container, input handling, game loop
│   │   ├── PlayerObject.vue    # Jet fighter SVG, muzzle flash, shoot animation
│   │   └── DebugPanel.vue      # FPS / state debug overlay
│   └── ui/
│       └── GameCard.vue        # Wrapper card component
├── stores/
│   └── game.ts                 # Pinia store — all game state & actions
├── composables/
│   ├── useShootSound.ts        # Web Audio API shoot SFX
│   └── useExplosionSound.ts    # Web Audio API explosion SFX
├── utils/
│   ├── movement.ts             # Keyboard movement calculation
│   ├── boundary.ts             # Canvas boundary clamping
│   └── transform.ts            # Rotation & scale helpers
└── types/
    └── player.ts               # TypeScript interfaces (Player, Bullet, Obstacle, …)
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type-check and build for production
npm run build

# Preview production build
npm run preview
```

## Architecture Notes

The game runs a single `requestAnimationFrame` loop in `GameCanvas.vue` that calls `gameStore.gameLoop()` each tick. Inside the loop, in order:

1. `updateMovement()` — applies drag / keyboard / click-to-move with boundary clamp
2. `handleRotation()` — Q/E rotation
3. `updateParticles()` — muzzle flash particles
4. `updateBullets()` — move bullets, cull off-screen
5. `updateObstacles()` — spawn & move asteroids, check escaped
6. `checkCollisions()` — bullet × asteroid hit detection
7. `checkPlayerCollisions()` — asteroid × player hit detection
8. `updateExplosions()` — fade explosion particles
9. `updateFPS()` — rolling FPS counter

All mutable game state lives in the Pinia store; components are purely presentational.
