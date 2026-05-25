export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  rotation: number;
  scale: number;
  direction: "left" | "right";
  isClicked: boolean;
  isShooting: boolean;
}

export interface KeyboardState {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
  KeyW: boolean;
  KeyS: boolean;
  KeyA: boolean;
  KeyD: boolean;
  KeyQ: boolean;
  KeyE: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color?: string;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  direction: "left" | "right";
  angle: number;
  speed: number;
  size: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  type: "small" | "medium" | "large";
}

export interface ExplosionParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface Explosion {
  id: number;
  particles: ExplosionParticle[];
}
