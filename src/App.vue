<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Interactive Object Playground
        </h1>
        <p class="text-gray-400 mt-2">WASD / Arrow Keys • Q/E Rotate • Scroll Scale • Click Me!</p>
      </div>
      
      <!-- Main Game Area -->
      <div class="flex gap-6 flex-wrap justify-center">
        <GameCard title="Game Arena">
          <GameCanvas />
        </GameCard>
        
        <!-- Controls Info -->
        <div class="space-y-6">
          <GameCard title="Controls">
            <div class="space-y-3 text-sm">
              <div class="grid grid-cols-2 gap-2">
                <div class="text-gray-400">Movement:</div>
                <div class="text-white">WASD / Arrow Keys</div>
                
                <div class="text-gray-400">Rotate Left:</div>
                <div class="text-white">Q</div>
                
                <div class="text-gray-400">Rotate Right:</div>
                <div class="text-white">E</div>
                
                <div class="text-gray-400">Scale:</div>
                <div class="text-white">Mouse Wheel</div>
                
                <div class="text-gray-400">Click:</div>
                <div class="text-white">Particle Effect</div>
              </div>
            </div>
          </GameCard>
          
          <!-- Debug Panel -->
          <DebugPanel />
        </div>
      </div>
      
      <!-- Footer -->
      <div class="text-center text-gray-500 text-sm">
        <p>✨ Drag & Drop coming soon! ✨</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameCanvas from './components/game/GameCanvas.vue'
import DebugPanel from './components/game/DebugPanel.vue'
import GameCard from './components/ui/GameCard.vue'
</script>