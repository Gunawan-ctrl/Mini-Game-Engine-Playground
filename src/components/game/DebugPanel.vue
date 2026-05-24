<template>
  <div class="glass-card p-4 space-y-3 min-w-50">
    <h3 class="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Debug Panel</h3>
    
    <div class="space-y-2">
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-400">Position X:</span>
        <span class="text-white font-mono">{{ Math.round(gameStore.player.x) }}</span>
      </div>
      
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-400">Position Y:</span>
        <span class="text-white font-mono">{{ Math.round(gameStore.player.y) }}</span>
      </div>
      
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-400">Rotation:</span>
        <span class="text-white font-mono">{{ Math.round(gameStore.player.rotation) }}°</span>
      </div>
      
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-400">Scale:</span>
        <span class="text-white font-mono">{{ gameStore.player.scale.toFixed(2) }}</span>
      </div>
      
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-400">Direction:</span>
        <span class="text-white font-mono capitalize">{{ gameStore.player.direction }}</span>
      </div>
      
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-400">Speed:</span>
        <span class="text-white font-mono">{{ gameStore.player.speed }}</span>
      </div>
      
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-400">FPS:</span>
        <span class="text-green-400 font-mono">{{ gameStore.fps }}</span>
      </div>
    </div>
    
    <div class="pt-2 border-t border-white/10">
      <button
        @click="handleSave"
        class="w-full mb-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm rounded-lg transition-all duration-200"
      >
        💾 Save Position
      </button>
      
      <button
        @click="handleReset"
        class="w-full px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-all duration-200"
      >
        🔄 Reset Position
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../../stores/game'

const gameStore = useGameStore()

const handleSave = () => {
  gameStore.savePosition()
}

const handleReset = () => {
  gameStore.resetPosition()
}
</script>