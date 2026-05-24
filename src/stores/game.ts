import { defineStore } from "pinia";
import type { Player, KeyboardState, Particle, Bullet } from "../types/player";
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
  nextParticleId: number;
  nextBulletId: number;
  fps: number;
  lastFrameTime: number;
  frameCount: number;
  savedPosition: { x: number; y: number } | null;
  shootCooldown: boolean;
}

export const useGameStore = defineStore("game", {
  state: (): GameState => ({
    player: {
      x: 400,
      y: 250,
      width: 200, // Increased width for better jet visibility
      height: 200, // Increased height
      speed: 5,
      rotation: 0,
      scale: 0.8, // Slightly smaller scale initially
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
    nextParticleId: 0,
    nextBulletId: 0,
    fps: 0,
    lastFrameTime: 0,
    frameCount: 0,
    savedPosition: null,
    shootCooldown: false,
  }),

  actions: {
    updateMovement() {
      const { x, y } = handleMovement(this.player, this.keyboard);
      this.player.x = x;
      this.player.y = y;

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

    handleRotation() {
      if (this.keyboard.KeyQ) {
        this.player.rotation = rotateLeft(this.player.rotation);
      }
      if (this.keyboard.KeyE) {
        this.player.rotation = rotateRight(this.player.rotation);
      }
    },

    handleScale(delta: number) {
      if (delta > 0) {
        this.player.scale = scaleUp(this.player.scale);
      } else if (delta < 0) {
        this.player.scale = scaleDown(this.player.scale);
      }
    },

    updateDirection(x: number) {
      const oldDirection = this.player.direction;
      this.player.direction = x < 0 ? "left" : "right";

      if (oldDirection !== this.player.direction) {
        console.log(`Direction changed to: ${this.player.direction}`);
      }
    },

    setKeyState(key: string, isPressed: boolean) {
      if (key in this.keyboard) {
        (this.keyboard as any)[key] = isPressed;
      }
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

      // Create bullets from gun ports
      this.createBullets();

      // Create muzzle flash particles
      this.createMuzzleFlash();

      this.shootCooldown = true;
      setTimeout(() => {
        this.shootCooldown = false;
      }, 250); // Faster firing rate for jet

      setTimeout(() => {
        this.player.isShooting = false;
      }, 200);
    },

    createBullets() {
      const centerX = this.player.x + this.player.width / 2;
      const centerY = this.player.y + this.player.height / 2;

      // Calculate bullet direction based on player rotation
      const bulletAngle = this.player.rotation * (Math.PI / 180);

      // Create 5 bullets in a spread pattern (more guns!)
      const spreadAngles = [-0.3, -0.15, 0, 0.15, 0.3];

      for (let i = 0; i < spreadAngles.length; i++) {
        const spread = spreadAngles[i];
        const finalAngle = bulletAngle + spread;

        const bullet: Bullet = {
          id: this.nextBulletId++,
          x: centerX + Math.cos(bulletAngle) * 30,
          y: centerY + Math.sin(bulletAngle) * 30 + spread * 20,
          direction: this.player.direction,
          angle: finalAngle,
          speed: 12, // Faster bullets
          size: 6,
        };
        this.bullets.push(bullet);
      }
    },

    createMuzzleFlash() {
      const centerX = this.player.x + this.player.width / 2;
      const centerY = this.player.y + this.player.height / 2;
      const angle = this.player.rotation * (Math.PI / 180);

      const muzzleOffset = 50;
      const muzzleX = centerX + Math.cos(angle) * muzzleOffset;
      const muzzleY = centerY + Math.sin(angle) * muzzleOffset;

      // Create more particles for jet
      for (let i = 0; i < 15; i++) {
        const particleAngle = angle + (Math.random() - 0.5) * 0.8;
        const particle: Particle = {
          id: this.nextParticleId++,
          x: muzzleX,
          y: muzzleY,
          angle: particleAngle,
          speed: 4 + Math.random() * 5,
          size: 3 + Math.random() * 4,
          color: `hsl(${30 + Math.random() * 30}, 100%, 50%)`,
        };
        this.particles.push(particle);
      }
    },

    createClickParticles() {
      const centerX = this.player.x + this.player.width / 2;
      const centerY = this.player.y + this.player.height / 2;

      // More particles for jet click effect
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const particle: Particle = {
          id: this.nextParticleId++,
          x: centerX,
          y: centerY,
          angle: angle,
          speed: 2 + Math.random() * 4,
          size: 4 + Math.random() * 5,
          color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`,
        };
        this.particles.push(particle);
      }

      setTimeout(() => {
        this.particles = this.particles.filter(
          (p) => p.id >= this.nextParticleId - 20,
        );
      }, 800);
    },

    updateParticles() {
      this.particles = this.particles
        .map((particle) => ({
          ...particle,
          x: particle.x + Math.cos(particle.angle) * particle.speed,
          y: particle.y + Math.sin(particle.angle) * particle.speed,
          speed: particle.speed * 0.98, // Gradual slowdown
        }))
        .filter(
          (particle) =>
            particle.x > -50 &&
            particle.x < 850 &&
            particle.y > -50 &&
            particle.y < 550,
        );
    },

    updateBullets() {
      this.bullets = this.bullets
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + Math.cos(bullet.angle) * bullet.speed,
          y: bullet.y + Math.sin(bullet.angle) * bullet.speed,
        }))
        .filter(
          (bullet) =>
            bullet.x > -100 &&
            bullet.x < 900 &&
            bullet.y > -100 &&
            bullet.y < 600,
        );
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
      this.player.x = 400;
      this.player.y = 250;
      this.player.rotation = 0;
      this.player.scale = 0.8;
      this.player.direction = "right";
      this.bullets = [];
      this.particles = [];
    },

    gameLoop(currentTime: number) {
      this.updateMovement();
      this.handleRotation();
      this.updateParticles();
      this.updateBullets();
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

    boundaryLimits: () => ({
      minX: 0,
      maxX: 800,
      minY: 0,
      maxY: 500,
    }),
  },
});
