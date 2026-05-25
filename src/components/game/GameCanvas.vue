<template>
  <div 
    ref="canvasRef"
    class="game-container relative"
    :style="{
      width: `${width}px`,
      height: `${height}px`
    }"
    tabindex="0"
    @keydown="handleKeyDown"
    @keyup="handleKeyUp"
    @wheel="handleWheel"
    @click="handleCanvasClick"
  >
    <!-- Game Area -->
    <div class="relative w-full h-full bg-linear-to-br from-gray-900 to-gray-800 overflow-hidden">
      <!-- Star fields: 3 depths scrolling left at different speeds -->
      <div class="absolute inset-0 stars-deep"></div>
      <div class="absolute inset-0 stars-mid"></div>
      <div class="absolute inset-0 stars-near"></div>

      <!-- Clouds drifting left -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          v-for="cloud in clouds"
          :key="cloud.id"
          class="cloud"
          :style="cloud.style"
        ></div>
      </div>
      
      <!-- Player — hidden after death so the explosion takes focus -->
      <PlayerObject v-if="!gameStore.isGameOver" />
      
      <!-- Bullets -->
      <div v-for="bullet in gameStore.bullets" :key="bullet.id" class="bullet">
        <div 
          class="bg-linear-to-r from-yellow-400 to-red-500 rounded-full shadow-lg"
          :style="{
            width: `${bullet.size}px`,
            height: `${bullet.size / 2}px`,
            left: `${bullet.x}px`,
            top: `${bullet.y}px`,
            position: 'absolute',
            transform: `rotate(${bullet.angle * (180 / Math.PI)}deg)`,
            boxShadow: '0 0 10px orange'
          }"
        >
          <div class="absolute inset-0 bg-white rounded-full opacity-50"></div>
        </div>
      </div>
      
      <!-- Asteroids -->
      <div
        v-for="obstacle in gameStore.obstacles"
        :key="obstacle.id"
        class="absolute pointer-events-none"
        :style="{
          left:   `${obstacle.x}px`,
          top:    `${obstacle.y}px`,
          width:  `${obstacle.size}px`,
          height: `${obstacle.size}px`,
        }"
      >
        <svg
          viewBox="0 0 100 100"
          class="w-full h-full"
          :class="asteroidSpinClass(obstacle.id)"
        >
          <!-- Irregular rock body -->
          <polygon
            :points="asteroidShape(obstacle.id)"
            :fill="asteroidColor(obstacle.type, obstacle.id)"
            stroke="rgba(0,0,0,0.3)"
            stroke-width="1.5"
          />
          <!-- Surface highlight (light from top-left) -->
          <ellipse cx="30" cy="28" rx="16" ry="10"
                   fill="rgba(255,255,255,0.09)"
                   transform="rotate(-20 30 28)"/>
          <!-- Craters -->
          <ellipse cx="38" cy="44" rx="9"   ry="6"   fill="rgba(0,0,0,0.18)"/>
          <ellipse cx="64" cy="66" rx="7"   ry="5"   fill="rgba(0,0,0,0.15)"/>
          <ellipse cx="58" cy="30" rx="5"   ry="3.5" fill="rgba(0,0,0,0.18)"/>
        </svg>
      </div>

      <!-- Explosion particles -->
      <template v-for="explosion in gameStore.explosions" :key="explosion.id">
        <div
          v-for="(p, pi) in explosion.particles"
          :key="pi"
          class="absolute rounded-full pointer-events-none"
          :style="{
            left:      `${p.x}px`,
            top:       `${p.y}px`,
            width:     `${p.size}px`,
            height:    `${p.size}px`,
            background: p.color,
            opacity:    p.alpha,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${Math.round(p.size * 1.5)}px ${p.color}`,
          }"
        />
      </template>

      <!-- Particles -->
      <!-- <div v-for="particle in gameStore.particles" :key="particle.id" class="particle">
        <div 
          class="bg-linear-to-r from-cyan-400 to-blue-500 rounded-full"
          :style="{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            position: 'absolute',
            boxShadow: '0 0 10px cyan'
          }"
        ></div>
      </div> -->
      
      <!-- Idle Animation Indicator -->
      <div
        v-if="!isMoving && !gameStore.isGameOver"
        class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-cyan-400 text-sm animate-pulse"
      >
        ✨ Jet Fighter Ready ✨
      </div>

      <!-- Shooting Cooldown Indicator -->
      <div
        v-if="gameStore.shootCooldown && !gameStore.isGameOver"
        class="absolute top-4 right-4 text-red-400 text-xs animate-pulse"
      >
        🔫 RELOADING...
      </div>

      <!-- Game Over overlay -->
      <Transition name="gameover">
        <div v-if="gameStore.isGameOver" class="game-over-overlay">
          <div class="game-over-content">
            <h1 class="game-over-title">GAME OVER</h1>
            <p class="game-over-sub">Your ship was destroyed</p>
            <button class="restart-btn" @click="restartGame">PLAY AGAIN</button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../../stores/game'
import PlayerObject from './PlayerObject.vue'
import { useExplosionSound } from '../../composables/useExplosionSound'

const width = 800
const height = 500

const gameStore = useGameStore()
const canvasRef = ref<HTMLElement | null>(null)

const { play: playExplosionSound } = useExplosionSound()

watch(() => gameStore.isGameOver, (over) => {
  if (over) playExplosionSound()
})

const restartGame = () => {
  gameStore.resetGame()
  canvasRef.value?.focus()
}

const ASTEROID_SHAPES = [
  "50,4 78,12 94,40 90,70 68,93 33,95 8,72 4,40 18,14",
  "45,3 73,9 93,33 95,64 78,90 48,97 20,86 4,56 7,26 25,7",
  "55,5 80,22 96,52 80,86 50,97 18,84 3,54 12,24 36,4",
  "48,6 76,15 92,46 86,76 58,94 26,92 6,66 5,32 22,10",
  "52,3 80,16 96,45 90,76 62,97 30,96 8,68 5,36 22,8",
]
function asteroidShape(id: number): string {
  return ASTEROID_SHAPES[id % ASTEROID_SHAPES.length]
}
function asteroidColor(type: 'small' | 'medium' | 'large', id: number): string {
  const p = {
    small:  ['#9ca3af', '#a8a29e', '#94a3b8'],
    medium: ['#6b7280', '#78716c', '#64748b'],
    large:  ['#4b5563', '#57534e', '#475569'],
  }
  return p[type][id % 3]
}
function asteroidSpinClass(id: number): string {
  return ['asteroid-slow', 'asteroid-med', 'asteroid-fast'][id % 3]
}

// Builds a multi-puff cloud via box-shadow offsets relative to the main oval.
// The three extra shadows create bumps above/beside the base shape; filter:blur
// on .cloud merges them all into one fluffy silhouette.
function mkCloud(id: number, top: string, w: number, dur: number, delay: number, opacity: number) {
  const h  = Math.round(w * 0.38)
  const p1 = Math.round(w * 0.28);  const py1 = Math.round(h * 0.55); const s1 = Math.round(w * 0.12)
  const p2 = Math.round(w * 0.20);  const py2 = Math.round(h * 0.38)
  const p3 = Math.round(w * 0.50);  const py3 = Math.round(h * 0.15); const s3 = Math.round(w * 0.08)
  const puffShadow = [
    `${p1}px -${py1}px 0 ${s1}px rgba(255,255,255,0.92)`,
    `-${p2}px -${py2}px 0 0 rgba(255,255,255,0.88)`,
    `${p3}px -${py3}px 0 -${s3}px rgba(255,255,255,0.85)`,
  ].join(', ')
  return {
    id,
    style: {
      top,
      width:             `${w}px`,
      height:            `${h}px`,
      animationDuration: `${dur}s`,
      animationDelay:    `${delay}s`,
      opacity:           `${opacity}`,
      '--puff-shadow':   puffShadow,
    },
  }
}

const clouds = [
  // ── Far layer: 10 clouds, 75–130 px wide, 14 s cycle ──
  mkCloud( 1, '4%',  85,  14,   0,    0.40),
  mkCloud( 2, '14%', 95,  14,  -1.4,  0.38),
  mkCloud( 3, '25%', 110, 14,  -2.8,  0.42),
  mkCloud( 4, '35%', 80,  14,  -4.2,  0.38),
  mkCloud( 5, '45%', 120, 14,  -5.6,  0.43),
  mkCloud( 6, '56%', 75,  14,  -7.0,  0.37),
  mkCloud( 7, '67%', 100, 14,  -8.4,  0.41),
  mkCloud( 8, '77%', 130, 14,  -9.8,  0.42),
  mkCloud( 9, '87%', 90,  14, -11.2,  0.38),
  mkCloud(10, '95%', 85,  14, -12.6,  0.40),

  // ── Mid layer: 9 clouds, 150–220 px wide, 8 s cycle ──
  mkCloud(11, '7%',  160,  8,   0,    0.55),
  mkCloud(12, '18%', 185,  8,  -0.9,  0.58),
  mkCloud(13, '29%', 155,  8,  -1.8,  0.53),
  mkCloud(14, '40%', 205,  8,  -2.7,  0.60),
  mkCloud(15, '51%', 175,  8,  -3.6,  0.55),
  mkCloud(16, '62%', 195,  8,  -4.4,  0.58),
  mkCloud(17, '73%', 160,  8,  -5.3,  0.53),
  mkCloud(18, '83%', 220,  8,  -6.2,  0.60),
  mkCloud(19, '93%', 168,  8,  -7.1,  0.55),

  // ── Near layer: 7 clouds, 250–380 px wide, 4 s cycle ──
  mkCloud(20, '10%', 280,  4,   0,    0.70),
  mkCloud(21, '23%', 350,  4,  -0.6,  0.72),
  mkCloud(22, '37%', 250,  4,  -1.1,  0.68),
  mkCloud(23, '51%', 380,  4,  -1.7,  0.74),
  mkCloud(24, '64%', 290,  4,  -2.3,  0.70),
  mkCloud(25, '77%', 330,  4,  -2.9,  0.72),
  mkCloud(26, '90%', 260,  4,  -3.4,  0.68),
]
let animationFrameId: number | null = null
let lastMoveTime = Date.now()
let isMoving = ref(false)

const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.code

  if (key === 'Space') {
    e.preventDefault()
    gameStore.triggerShootEffect()
    return
  }

  if (key in gameStore.keyboard) {
    e.preventDefault()
    gameStore.setKeyState(key, true)

    // Track movement for idle animation
    if (key === 'KeyW' || key === 'KeyS' || key === 'KeyA' || key === 'KeyD' ||
        key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      isMoving.value = true
      lastMoveTime = Date.now()
      setTimeout(() => {
        if (Date.now() - lastMoveTime > 500) {
          isMoving.value = false
        }
      }, 500)
    }
  }
}

const handleKeyUp = (e: KeyboardEvent) => {
  const key = e.code
  if (key in gameStore.keyboard) {
    e.preventDefault()
    gameStore.setKeyState(key, false)
    
    // Update idle status
    setTimeout(() => {
      let moving = false
      const movementKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      for (const moveKey of movementKeys) {
        if ((gameStore.keyboard as any)[moveKey]) {
          moving = true
          break
        }
      }
      isMoving.value = moving
      if (moving) lastMoveTime = Date.now()
    }, 50)
  }
}

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -1 : 1
  gameStore.handleScale(delta)
}

const handleCanvasClick = () => {
  // Only trigger if clicking on canvas background
  // Player click is handled separately
}

const gameLoop = (currentTime: number) => {
  gameStore.gameLoop(currentTime)
  animationFrameId = requestAnimationFrame(gameLoop)
}

onMounted(() => {
  if (canvasRef.value) {
    canvasRef.value.focus()
  }
  
  // Load saved position
  gameStore.loadPosition()
  
  // Start game loop
  animationFrameId = requestAnimationFrame(gameLoop)
  
  // Add event listeners for window blur to reset keys
  window.addEventListener('blur', () => {
    const movementKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyE']
    movementKeys.forEach(key => {
      gameStore.setKeyState(key, false)
    })
    isMoving.value = false
  })
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('blur', () => {})
})
</script>

<style scoped>
.game-container:focus {
  outline: none;
}

/* ── Star fields ────────────────────────────────── */
.stars-deep {
  --tile-w: 120px;
  background-image: radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px);
  background-size: var(--tile-w) 80px;
  background-position-y: 15px;
  animation: flyLeft 8s linear infinite;
}

.stars-mid {
  --tile-w: 70px;
  background-image: radial-gradient(circle, rgba(200,230,255,0.4) 1px, transparent 1px);
  background-size: var(--tile-w) 55px;
  background-position-y: 28px;
  animation: flyLeft 4s linear infinite;
}

.stars-near {
  --tile-w: 45px;
  background-image: radial-gradient(circle, rgba(180,220,255,0.25) 1.5px, transparent 1.5px);
  background-size: var(--tile-w) 40px;
  animation: flyLeft 2s linear infinite;
}

@keyframes flyLeft {
  from { background-position-x: 0; }
  to   { background-position-x: calc(-1 * var(--tile-w)); }
}

/* ── Clouds ─────────────────────────────────────── */
.cloud {
  position: absolute;
  left: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  /* Puff bumps computed per-cloud via inline CSS custom property */
  box-shadow: var(--puff-shadow);
  /* Blur merges the oval + shadows into one fluffy shape */
  filter: blur(10px);
  animation: cloudDrift linear infinite;
  will-change: transform;
}

@keyframes cloudDrift {
  from { transform: translateX(850px); }
  /* -430px clears the widest near cloud (380px) off the left edge */
  to   { transform: translateX(-430px); }
}

.bullet {
  animation: bulletTrail 0.1s linear;
}

@keyframes bulletTrail {
  from { opacity: 1;   }
  to   { opacity: 0.7; }
}

/* ── Asteroid rotation ───────────────────────────── */
.asteroid-slow { animation: asteroidSpin 22s linear infinite; }
.asteroid-med  { animation: asteroidSpin 14s linear infinite; }
.asteroid-fast { animation: asteroidSpin  9s linear infinite; }

@keyframes asteroidSpin {
  from { transform: rotate(0deg);   }
  to   { transform: rotate(360deg); }
}

/* ── Game Over overlay ───────────────────────────── */
.game-over-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.82);
  z-index: 100;
}

.game-over-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.game-over-title {
  font-size: 4rem;
  font-weight: 900;
  color: #ef4444;
  letter-spacing: 0.25em;
  animation: gameOverPulse 1.6s ease-in-out infinite;
}

@keyframes gameOverPulse {
  0%, 100% { text-shadow: 0 0 30px #ef4444, 0 0 60px rgba(239,68,68,0.4); }
     50%   { text-shadow: 0 0 60px #ef4444, 0 0 120px rgba(239,68,68,0.7), 0 0 200px rgba(239,68,68,0.2); }
}

.game-over-sub {
  color: #9ca3af;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.restart-btn {
  padding: 0.7rem 2.5rem;
  background: #0e7490;
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}
.restart-btn:hover {
  background: #0891b2;
  box-shadow: 0 0 32px rgba(0, 255, 255, 0.55);
}

/* Game Over fade-in transition */
.gameover-enter-active { transition: opacity 0.75s ease; }
.gameover-leave-active { transition: opacity 0.25s ease; }
.gameover-enter-from,
.gameover-leave-to     { opacity: 0; }
</style>
