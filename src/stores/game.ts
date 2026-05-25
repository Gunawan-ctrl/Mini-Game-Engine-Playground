import { defineStore } from "pinia";
import type { Player, KeyboardState, Particle, Bullet, Obstacle, Explosion, ExplosionParticle } from "../types/player";
import { handleBoundary } from "../utils/boundary";
import { handleMovement } from "../utils/movement";
import {
  rotateLeft,
  rotateRight,
  scaleUp,
  scaleDown,
} from "../utils/transform";

interface GameState {
  player: Player;
  keyboard: KeyboardState;
  particles: Particle[];
  bullets: Bullet[];
  obstacles: Obstacle[];
  explosions: Explosion[];
  nextParticleId: number;
  nextBulletId: number;
  nextObstacleId: number;
  nextExplosionId: number;
  nextSpawnAt: number;
  gameStartTime: number;
  isDragging: boolean;
  dragOffsetX: number;
  dragOffsetY: number;
  targetX: number | null;
  targetY: number | null;
  isGameOver: boolean;
  fps: number;
  lastFrameTime: number;
  frameCount: number;
  savedPosition: { x: number; y: number } | null;
  shootCooldown: boolean;
}

export const useGameStore = defineStore("game", {
  state: (): GameState => ({
    player: {
      x: 355, // tengah horizontal: (800 - 90)/2
      y: 205, // tengah vertikal: (500 - 90)/2
      width: 90, // konsisten dengan PlayerObject.vue
      height: 90,
      speed: 5,
      rotation: 0,
      scale: 1, // mulai dari scale 1 (bukan 0.8)
      direction: "right",
      isClicked: false,
      isShooting: false,
    },
    keyboard: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      KeyQ: false,
      KeyE: false,
    },
    particles: [],
    bullets: [],
    obstacles: [],
    explosions: [],
    nextParticleId: 0,
    nextBulletId: 0,
    nextObstacleId: 0,
    nextExplosionId: 0,
    nextSpawnAt: 0,
    gameStartTime: 0,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    targetX: null,
    targetY: null,
    isGameOver: false,
    fps: 0,
    lastFrameTime: 0,
    frameCount: 0,
    savedPosition: null,
    shootCooldown: false,
  }),

  actions: {
    updateMovement() {
      if (this.isDragging) {
        const bounded = handleBoundary(
          this.player.x, this.player.y,
          this.player.width, this.player.height, this.player.scale,
        );
        this.player.x = bounded.x;
        this.player.y = bounded.y;
        return;
      }

      const kb = this.keyboard;
      const anyKey = kb.ArrowUp || kb.ArrowDown || kb.ArrowLeft || kb.ArrowRight ||
                     kb.KeyW   || kb.KeyS        || kb.KeyA      || kb.KeyD;

      if (anyKey) {
        const { x: kbX, y: kbY } = handleMovement(this.player, this.keyboard);
        this.player.x = kbX;
        this.player.y = kbY;
        this.targetX = null;
        this.targetY = null;
      } else if (this.targetX !== null && this.targetY !== null) {
        const dx   = this.targetX - this.player.x;
        const dy   = this.targetY - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const spd  = this.player.speed;

        if (dist <= spd) {
          this.player.x = this.targetX;
          this.player.y = this.targetY;
          this.targetX  = null;
          this.targetY  = null;
        } else {
          this.player.x += (dx / dist) * spd;
          this.player.y += (dy / dist) * spd;
          if (Math.abs(dx) > 1) {
            this.player.direction = dx > 0 ? "right" : "left";
          }
        }
      }

      const bounded = handleBoundary(
        this.player.x, this.player.y,
        this.player.width, this.player.height, this.player.scale,
      );
      this.player.x = bounded.x;
      this.player.y = bounded.y;
    },

    setMoveTarget(mouseX: number, mouseY: number) {
      const size = 90 * this.player.scale;
      const raw  = handleBoundary(
        mouseX - size / 2, mouseY - size / 2,
        this.player.width, this.player.height, this.player.scale,
      );
      this.targetX = raw.x;
      this.targetY = raw.y;
    },

    startDrag(offsetX: number, offsetY: number) {
      this.isDragging  = true;
      this.dragOffsetX = offsetX;
      this.dragOffsetY = offsetY;
      this.targetX     = null;
      this.targetY     = null;
    },

    stopDrag() {
      this.isDragging = false;
    },

    setDragPosition(mouseX: number, mouseY: number) {
      if (!this.isDragging) return;
      const newX = mouseX - this.dragOffsetX;
      const dx   = newX - this.player.x;
      if (Math.abs(dx) > 2) {
        this.player.direction = dx > 0 ? "right" : "left";
      }
      this.player.x = newX;
      this.player.y = mouseY - this.dragOffsetY;
    },

    handleRotation() {
      if (this.keyboard.KeyQ)
        this.player.rotation = rotateLeft(this.player.rotation);
      if (this.keyboard.KeyE)
        this.player.rotation = rotateRight(this.player.rotation);
    },

    handleScale(delta: number) {
      if (delta > 0) this.player.scale = scaleUp(this.player.scale);
      else if (delta < 0) this.player.scale = scaleDown(this.player.scale);
      // setelah scale berubah, pastikan posisi masih dalam batas
      const bounded = handleBoundary(
        this.player.x,
        this.player.y,
        this.player.width,
        this.player.height,
        this.player.scale,
      );
      this.player.x = bounded.x;
      this.player.y = bounded.y;
    },

    setKeyState(key: string, isPressed: boolean) {
      if (key in this.keyboard) (this.keyboard as any)[key] = isPressed;
    },

    triggerClickEffect() {
      this.player.isClicked = true;
      this.triggerShootEffect();
      this.createClickParticles();
      setTimeout(() => {
        this.player.isClicked = false;
      }, 300);
    },

    triggerShootEffect() {
      if (this.shootCooldown) return;
      this.player.isShooting = true;
      this.createBullets();
      this.createMuzzleFlash();
      this.shootCooldown = true;
      setTimeout(() => {
        this.shootCooldown = false;
      }, 250);
      setTimeout(() => {
        this.player.isShooting = false;
      }, 200);
    },

    _getNoseWorldPosition() {
      // SVG viewBox is 600x400. Nose tip is at viewBox (15, 205) when facing left.
      // When facing right the SVG is flipped (scaleX=-1), so nose appears at (585, 205).
      const size = 90 * this.player.scale;
      const isLeft = this.player.direction === "left";
      const noseLocalX = isLeft
        ? (15 / 600) * size
        : (585 / 600) * size;
      const noseLocalY = (205 / 400) * size;

      // Player center in canvas space
      const centerX = this.player.x + size / 2;
      const centerY = this.player.y + size / 2;

      // Offset of nose from player center, then rotate by player rotation
      const dx = noseLocalX - size / 2;
      const dy = noseLocalY - size / 2;
      const rad = this.player.rotation * (Math.PI / 180);
      // Base travel angle: right=0, left=π. Rotation tilts from that base.
      const baseAngle = this.player.direction === "right" ? 0 : Math.PI;
      const travelAngle = baseAngle + rad;
      return {
        x: centerX + dx * Math.cos(rad) - dy * Math.sin(rad),
        y: centerY + dx * Math.sin(rad) + dy * Math.cos(rad),
        travelAngle,
      };
    },

    createBullets() {
      const { x: noseX, y: noseY, travelAngle } = this._getNoseWorldPosition();
      const spreadAngles = [-0.1, 0.1];
      for (const spread of spreadAngles) {
        this.bullets.push({
          id: this.nextBulletId++,
          x: noseX,
          y: noseY,
          direction: this.player.direction,
          angle: travelAngle + spread,
          speed: 12,
          size: 6,
        });
      }
    },

    createMuzzleFlash() {
      const { x: muzzleX, y: muzzleY, travelAngle } = this._getNoseWorldPosition();
      for (let i = 0; i < 15; i++) {
        const particleAngle = travelAngle + (Math.random() - 0.5) * 0.8;
        this.particles.push({
          id: this.nextParticleId++,
          x: muzzleX,
          y: muzzleY,
          angle: particleAngle,
          speed: 4 + Math.random() * 5,
          size: 3 + Math.random() * 4,
          color: `hsl(${30 + Math.random() * 30}, 100%, 50%)`,
        });
      }
    },

    createClickParticles() {
      const centerX = this.player.x + this.player.width / 2;
      const centerY = this.player.y + this.player.height / 2;
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        this.particles.push({
          id: this.nextParticleId++,
          x: centerX,
          y: centerY,
          angle: angle,
          speed: 2 + Math.random() * 4,
          size: 4 + Math.random() * 5,
          color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`,
        });
      }
      setTimeout(() => {
        this.particles = this.particles.filter(
          (p) => p.id >= this.nextParticleId - 20,
        );
      }, 800);
    },

    updateParticles() {
      this.particles = this.particles
        .map((p) => ({
          ...p,
          x: p.x + Math.cos(p.angle) * p.speed,
          y: p.y + Math.sin(p.angle) * p.speed,
          speed: p.speed * 0.98,
        }))
        .filter((p) => p.x > -50 && p.x < 850 && p.y > -50 && p.y < 550);
    },

    updateBullets() {
      this.bullets = this.bullets
        .map((b) => ({
          ...b,
          x: b.x + Math.cos(b.angle) * b.speed,
          y: b.y + Math.sin(b.angle) * b.speed,
        }))
        .filter((b) => b.x > -100 && b.x < 900 && b.y > -100 && b.y < 600);
    },

    spawnObstacle(difficulty: number) {
      const presets: { type: Obstacle["type"]; size: number; sMin: number; sMax: number }[] = [
        { type: "small",  size: 28, sMin: 0.9, sMax: 1.8 },
        { type: "small",  size: 36, sMin: 0.8, sMax: 1.6 },
        { type: "medium", size: 50, sMin: 0.6, sMax: 1.3 },
        { type: "medium", size: 58, sMin: 0.5, sMax: 1.1 },
        { type: "large",  size: 75, sMin: 0.4, sMax: 0.9 },
      ];
      const cfg = presets[Math.floor(Math.random() * presets.length)];
      const margin = 24;
      const baseSpeed = cfg.sMin + Math.random() * (cfg.sMax - cfg.sMin);
      this.obstacles.push({
        id: this.nextObstacleId++,
        x: 820,
        y: margin + Math.random() * (500 - cfg.size - margin * 2),
        size: cfg.size,
        speed: baseSpeed * difficulty,
        type: cfg.type,
      });
    },

    updateObstacles(currentTime: number) {
      // Initialise start time on first call
      if (this.gameStartTime === 0) this.gameStartTime = currentTime;

      // difficulty: 1× at t=0, caps at 3× after 120 s (doubles every 60 s)
      const elapsed    = (currentTime - this.gameStartTime) / 1000;
      const difficulty = Math.min(3.0, 1.0 + elapsed / 60);

      // On-screen cap also grows with difficulty (more chaos at high levels)
      const maxOnScreen = Math.min(10, Math.floor(6 + difficulty));

      if (currentTime >= this.nextSpawnAt && this.obstacles.length < maxOnScreen) {
        this.spawnObstacle(difficulty);
        // Spawn interval shrinks as difficulty rises: 2500–5000 ms → ~830–1670 ms at 3×
        const baseInterval = 2500 + Math.random() * 2500;
        this.nextSpawnAt   = currentTime + baseInterval / difficulty;
      }
      const moved = this.obstacles.map((o) => ({ ...o, x: o.x - o.speed }));

      // If any asteroid fully crosses the left boundary → game over
      const escaped = moved.find((o) => o.x + o.size < 0);
      if (escaped) {
        this.triggerGameOver(
          Math.max(5, escaped.x + escaped.size / 2),
          escaped.y + escaped.size / 2,
        );
        return;
      }

      this.obstacles = moved.filter((o) => o.x > -150);
    },

    checkCollisions() {
      const deadBullets  = new Set<number>();
      const deadObstacles = new Set<number>();
      for (const bullet of this.bullets) {
        for (const obstacle of this.obstacles) {
          if (deadObstacles.has(obstacle.id)) continue;
          // Square asteroid — center is middle of the square hitbox
          const cx = obstacle.x + obstacle.size * 0.5;
          const cy = obstacle.y + obstacle.size * 0.5;
          const dx = bullet.x - cx;
          const dy = bullet.y - cy;
          const r  = obstacle.size * 0.5 + bullet.size * 0.5;
          if (dx * dx + dy * dy < r * r) {
            deadBullets.add(bullet.id);
            deadObstacles.add(obstacle.id);
            this.createExplosion(cx, cy, obstacle.size);
          }
        }
      }
      if (deadBullets.size || deadObstacles.size) {
        this.bullets   = this.bullets.filter((b) => !deadBullets.has(b.id));
        this.obstacles = this.obstacles.filter((o) => !deadObstacles.has(o.id));
      }
    },

    createExplosion(x: number, y: number, size: number) {
      const colors = ["#ef4444", "#f97316", "#fbbf24", "#fef08a", "#ffffff", "#ff6b35"];
      const count  = 18 + Math.floor(size * 0.4);
      const particles: ExplosionParticle[] = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const spd   = 1.5 + Math.random() * (size * 0.1);
        return {
          x, y,
          vx:    Math.cos(angle) * spd,
          vy:    Math.sin(angle) * spd,
          size:  2 + Math.random() * (size * 0.15),
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.025 + Math.random() * 0.025,
        };
      });
      this.explosions.push({ id: this.nextExplosionId++, particles });
    },

    updateExplosions() {
      this.explosions = this.explosions
        .map((exp) => ({
          ...exp,
          particles: exp.particles
            .map((p) => ({
              ...p,
              x:     p.x  + p.vx,
              y:     p.y  + p.vy,
              vx:    p.vx * 0.93,
              vy:    p.vy * 0.93,
              size:  p.size  * 0.96,
              alpha: p.alpha - p.decay,
            }))
            .filter((p) => p.alpha > 0.05),
        }))
        .filter((exp) => exp.particles.length > 0);
    },

    checkPlayerCollisions() {
      const size = 90 * this.player.scale;
      const pcx  = this.player.x + size / 2;
      const pcy  = this.player.y + size / 2;
      const pr   = size * 0.28; // aircraft body is narrower than the bounding square
      for (const obstacle of this.obstacles) {
        const ocx = obstacle.x + obstacle.size * 0.5;
        const ocy = obstacle.y + obstacle.size * 0.5;
        const dx  = pcx - ocx;
        const dy  = pcy - ocy;
        const r   = pr + obstacle.size * 0.4;
        if (dx * dx + dy * dy < r * r) {
          this.triggerGameOver(pcx, pcy);
          return;
        }
      }
    },

    triggerGameOver(cx: number, cy: number) {
      this.isGameOver       = true;
      this.player.isShooting = false;
      this.shootCooldown    = false;
      // Multi-burst explosion for dramatic effect
      this.createExplosion(cx,       cy,       130);
      this.createExplosion(cx - 22,  cy - 18,   70);
      this.createExplosion(cx + 18,  cy + 22,   70);
      this.bullets   = [];
      this.obstacles = [];
      this.particles = [];
    },

    resetGame() {
      this.player.x          = 355;
      this.player.y          = 205;
      this.player.rotation   = 0;
      this.player.scale      = 1;
      this.player.direction  = "right";
      this.player.isClicked  = false;
      this.player.isShooting = false;
      this.bullets           = [];
      this.particles         = [];
      this.obstacles         = [];
      this.explosions        = [];
      this.shootCooldown     = false;
      this.isDragging        = false;
      this.targetX           = null;
      this.targetY           = null;
      this.isGameOver        = false;
      this.gameStartTime     = 0; // reset to 0; re-initialised on first updateObstacles call
      // Brief grace period before first asteroid spawns
      this.nextSpawnAt       = performance.now() + 1500;
    },

    updateFPS(currentTime: number) {
      this.frameCount++;
      if (currentTime - this.lastFrameTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }
    },

    savePosition() {
      this.savedPosition = { x: this.player.x, y: this.player.y };
      localStorage.setItem(
        "playerPosition",
        JSON.stringify(this.savedPosition),
      );
    },

    loadPosition() {
      const saved = localStorage.getItem("playerPosition");
      if (saved) {
        try {
          const position = JSON.parse(saved);
          this.savedPosition = position;
          this.player.x = position.x;
          this.player.y = position.y;
        } catch (e) {
          console.error("Failed to load saved position");
        }
      }
    },

    resetPosition() {
      this.player.x = 355;
      this.player.y = 205;
      this.player.rotation = 0;
      this.player.scale = 1;
      this.player.direction = "right";
      this.bullets    = [];
      this.particles  = [];
      this.obstacles  = [];
      this.explosions = [];
    },

    gameLoop(currentTime: number) {
      if (this.isGameOver) {
        this.updateExplosions(); // let the death explosion finish playing
        return;
      }
      this.updateMovement();
      this.handleRotation();
      this.updateParticles();
      this.updateBullets();
      this.updateObstacles(currentTime);
      this.checkCollisions();
      this.checkPlayerCollisions();
      this.updateExplosions();
      this.updateFPS(currentTime);
    },
  },

  getters: {
    playerTransform: (state) => {
      const centerX = state.player.x + state.player.width / 2;
      const centerY = state.player.y + state.player.height / 2;
      return {
        transform: `translate(${centerX}px, ${centerY}px) 
                    rotate(${state.player.rotation}deg) 
                    scale(${state.player.scale}) 
                    translate(-${centerX}px, -${centerY}px)`,
        scaleX: state.player.direction === "left" ? -1 : 1,
      };
    },
    boundaryLimits: () => ({ minX: 0, maxX: 800, minY: 0, maxY: 500 }),
  },
});
