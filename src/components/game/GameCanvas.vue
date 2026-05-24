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
    <div class="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      <!-- Grid Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="w-full h-full" :style="gridStyle"></div>
      </div>
      
      <!-- Player -->
      <PlayerObject />
      
      <!-- Bullets -->
      <div v-for="bullet in gameStore.bullets" :key="bullet.id" class="bullet">
        <div 
          class="bg-gradient-to-r from-yellow-400 to-red-500 rounded-full shadow-lg"
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
      
      <!-- Particles -->
      <div v-for="particle in gameStore.particles" :key="particle.id" class="particle">
        <div 
          class="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
          :style="{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            position: 'absolute',
            boxShadow: '0 0 10px cyan'
          }"
        ></div>
      </div>
      
      <!-- Idle Animation Indicator -->
      <div 
        v-if="!isMoving"
        class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-cyan-400 text-sm animate-pulse"
      >
        ✨ Jet Fighter Ready ✨
      </div>
      
      <!-- Shooting Cooldown Indicator -->
      <div 
        v-if="gameStore.shootCooldown"
        class="absolute top-4 right-4 text-red-400 text-xs animate-pulse"
      >
        🔫 RELOADING...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useGameStore } from '../../stores/game'
import PlayerObject from './PlayerObject.vue'

const width = 800
const height = 500

const gameStore = useGameStore()
const canvasRef = ref<HTMLElement | null>(null)
let animationFrameId: number | null = null
let lastMoveTime = Date.now()
let isMoving = ref(false)

const gridStyle = computed(() => ({
  backgroundImage: 'radial-gradient(circle, cyan 1px, transparent 1px)',
  backgroundSize: '30px 30px'
}))

const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.code
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

.bullet {
  animation: bulletTrail 0.1s linear;
}

@keyframes bulletTrail {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.7;
  }
}
</style>