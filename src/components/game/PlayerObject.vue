<template>
  <div
    class="player absolute cursor-pointer"
    :class="{ 
      'glow-effect': gameStore.player.isClicked,
      'shooting-effect': gameStore.player.isShooting
    }"
    :style="playerStyle"
    @click.stop="handleClick"
  >
    <div class="relative w-full h-full">
      <!-- Fighter Jet Container -->
      <div 
        class="fighter-jet relative"
        :style="{
          transform: `scaleX(${transform.scaleX})`,
        }"
      >
        <!-- Main Fuselage (Badan Pesawat) -->
        <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-xl">
          <defs>
            <!-- Gradients for jet parts -->
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4A5568;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#2D3748;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1A202C;stop-opacity:1" />
            </linearGradient>
            
            <linearGradient id="cockpitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#63B3ED;stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:#2B6CB0;stop-opacity:0.9" />
            </linearGradient>
            
            <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#718096;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#2D3748;stop-opacity:1" />
            </linearGradient>
            
            <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#FEF08A;stop-opacity:1" />
              <stop offset="30%" style="stop-color:#F59E0B;stop-opacity:1" />
              <stop offset="70%" style="stop-color:#EF4444;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#7F1D1D;stop-opacity:0" />
            </linearGradient>
            
            <linearGradient id="noseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#FBBF24;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#D97706;stop-opacity:1" />
            </linearGradient>
            
            <!-- Glow filter -->
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="muzzleFlash" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <!-- Main Fuselage (Badan Utama) -->
          <path d="M 60 60 
                   L 140 60 
                   L 160 100 
                   L 140 140 
                   L 60 140 
                   L 30 100 Z" 
                fill="url(#bodyGrad)" 
                stroke="#4A5568" 
                stroke-width="2"/>
          
          <!-- Nose Cone (Hidung Pesawat) -->
          <path d="M 140 60 
                   L 180 100 
                   L 140 140 Z" 
                fill="url(#noseGrad)" 
                stroke="#D97706" 
                stroke-width="2"/>
          
          <!-- Top Fuselage Extension -->
          <path d="M 60 60 
                   L 80 40 
                   L 120 40 
                   L 140 60 Z" 
                fill="#4A5568" 
                stroke="#718096" 
                stroke-width="1.5"/>
          
          <!-- Cockpit (Kokpit) -->
          <ellipse cx="120" cy="70" rx="15" ry="8" fill="url(#cockpitGrad)" stroke="#63B3ED" stroke-width="1.5"/>
          <ellipse cx="120" cy="70" rx="10" ry="5" fill="#90CDF4" opacity="0.5"/>
          
          <!-- Cockpit Frame -->
          <path d="M 115 62 L 125 62" stroke="#E2E8F0" stroke-width="2" fill="none"/>
          
          <!-- Left Wing (Sayap Kiri) -->
          <path d="M 60 80 
                   L 10 60 
                   L 30 100 
                   L 60 100 Z" 
                fill="url(#wingGrad)" 
                stroke="#4A5568" 
                stroke-width="2"/>
          
          <!-- Right Wing (Sayap Kanan) -->
          <path d="M 140 80 
                   L 190 60 
                   L 170 100 
                   L 140 100 Z" 
                fill="url(#wingGrad)" 
                stroke="#4A5568" 
                stroke-width="2"/>
          
          <!-- Wing Tip Missiles (Left) -->
          <rect x="5" y="55" width="8" height="15" rx="2" fill="#CBD5E0" stroke="#A0AEC0" stroke-width="1"/>
          <circle cx="9" cy="57" r="2" fill="#EF4444"/>
          
          <!-- Wing Tip Missiles (Right) -->
          <rect x="187" y="55" width="8" height="15" rx="2" fill="#CBD5E0" stroke="#A0AEC0" stroke-width="1"/>
          <circle cx="191" cy="57" r="2" fill="#EF4444"/>
          
          <!-- Tail Wings (Vertical Stabilizer) -->
          <path d="M 80 40 
                   L 100 15 
                   L 120 40 Z" 
                fill="#4A5568" 
                stroke="#718096" 
                stroke-width="1.5"/>
          
          <!-- Tail Wings (Horizontal Stabilizer Left) -->
          <path d="M 50 100 
                   L 20 120 
                   L 50 130 Z" 
                fill="#4A5568" 
                stroke="#718096" 
                stroke-width="1.5"/>
          
          <!-- Tail Wings (Horizontal Stabilizer Right) -->
          <path d="M 150 100 
                   L 180 120 
                   L 150 130 Z" 
                fill="#4A5568" 
                stroke="#718096" 
                stroke-width="1.5"/>
          
          <!-- Engine Exhaust (Mesin Belakang) -->
          <ellipse cx="45" cy="100" rx="10" ry="15" fill="#1A202C" stroke="#4A5568" stroke-width="1.5"/>
          <ellipse cx="45" cy="100" rx="5" ry="10" fill="#EF4444" opacity="0.8"/>
          
          <!-- Engine Nozzle Details -->
          <circle cx="45" cy="95" r="2" fill="#F59E0B" opacity="0.6"/>
          <circle cx="45" cy="100" r="2" fill="#F59E0B" opacity="0.6"/>
          <circle cx="45" cy="105" r="2" fill="#F59E0B" opacity="0.6"/>
          
          <!-- Afterburner Flame (Api saat menembak) -->
          <g v-if="gameStore.player.isShooting" filter="url(#glow)">
            <path d="M 35 90 
                     L 15 85 
                     L 20 100 
                     L 15 115 
                     L 35 110 Z" 
                  fill="url(#flameGrad)" 
                  opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.1s" repeatCount="indefinite"/>
            </path>
            <path d="M 35 95 
                     L 10 92 
                     L 18 100 
                     L 10 108 
                     L 35 105 Z" 
                  fill="#FEF08A" 
                  opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="0.08s" repeatCount="indefinite"/>
            </path>
          </g>
          
          <!-- Muzzle Flash (Kilatan Tembak) -->
          <g v-if="gameStore.player.isShooting" filter="url(#muzzleFlash)">
            <circle cx="185" cy="100" r="12" fill="#FEF08A" opacity="0.8">
              <animate attributeName="r" values="12;18;12" dur="0.1s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.1s" repeatCount="indefinite"/>
            </circle>
            <circle cx="185" cy="100" r="6" fill="#FFFFFF" opacity="0.9">
              <animate attributeName="r" values="6;10;6" dur="0.08s" repeatCount="indefinite"/>
            </circle>
          </g>
          
          <!-- Gun Ports (Lubang Senjata) -->
          <circle cx="160" cy="90" r="2" fill="#4A5568" stroke="#718096" stroke-width="0.5"/>
          <circle cx="160" cy="95" r="2" fill="#4A5568" stroke="#718096" stroke-width="0.5"/>
          <circle cx="160" cy="100" r="2" fill="#4A5568" stroke="#718096" stroke-width="0.5"/>
          <circle cx="160" cy="105" r="2" fill="#4A5568" stroke="#718096" stroke-width="0.5"/>
          <circle cx="160" cy="110" r="2" fill="#4A5568" stroke="#718096" stroke-width="0.5"/>
          
          <!-- Panel Lines (Detail) -->
          <path d="M 100 40 L 100 60" stroke="#718096" stroke-width="0.5" fill="none"/>
          <path d="M 80 60 L 80 140" stroke="#718096" stroke-width="0.5" fill="none"/>
          <path d="M 120 60 L 120 140" stroke="#718096" stroke-width="0.5" fill="none"/>
          
          <!-- Roundel (Lambang) -->
          <circle cx="90" cy="100" r="8" fill="#EF4444" opacity="0.6"/>
          <circle cx="90" cy="100" r="5" fill="#FFFFFF" opacity="0.6"/>
          <circle cx="90" cy="100" r="2" fill="#EF4444" opacity="0.6"/>
          
          <!-- Landing Gear Indicator -->
          <circle cx="70" cy="145" r="1.5" fill="#10B981" opacity="0.5"/>
          <circle cx="130" cy="145" r="1.5" fill="#10B981" opacity="0.5"/>
          
          <!-- Air Intake (Left) -->
          <path d="M 70 85 Q 60 85 60 100 Q 60 115 70 115" fill="#1A202C" stroke="#4A5568" stroke-width="1"/>
          
          <!-- Air Intake (Right) -->
          <path d="M 130 85 Q 140 85 140 100 Q 140 115 130 115" fill="#1A202C" stroke="#4A5568" stroke-width="1"/>
          
          <!-- Canopy Frame Details -->
          <path d="M 110 65 Q 120 60 130 65" stroke="#E2E8F0" stroke-width="1" fill="none"/>
        </svg>
        
        <!-- Click/Particle Effect Overlay -->
        <div 
          v-if="gameStore.player.isClicked"
          class="absolute inset-0 rounded-lg animate-pulse"
          style="background: radial-gradient(circle, rgba(255,100,0,0.4) 0%, transparent 70%)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/game'

const gameStore = useGameStore()

const transform = computed(() => gameStore.playerTransform)

const playerStyle = computed(() => {
  return {
    left: `${gameStore.player.x}px`,
    top: `${gameStore.player.y}px`,
    width: `${gameStore.player.width}px`,
    height: `${gameStore.player.height}px`,
    transform: `rotate(${gameStore.player.rotation}deg) scale(${gameStore.player.scale})`,
    transformOrigin: `${gameStore.player.width / 2}px ${gameStore.player.height / 2}px`,
    transition: 'transform 0.1s linear'
  }
})

const handleClick = (e: Event) => {
  e.stopPropagation()
  gameStore.triggerClickEffect()
}
</script>

<style scoped>
.fighter-jet {
  transition: all 0.1s ease;
}

.shooting-effect {
  animation: shootShake 0.15s ease-out;
}

@keyframes shootShake {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(3px, -1px);
  }
  50% {
    transform: translate(-2px, 1px);
  }
  75% {
    transform: translate(1px, -2px);
  }
  100% {
    transform: translate(0, 0);
  }
}

.glow-effect {
  animation: glowPulse 0.3s ease-out;
}

@keyframes glowPulse {
  0% {
    filter: drop-shadow(0 0 5px orange) brightness(1);
  }
  50% {
    filter: drop-shadow(0 0 25px #F59E0B) brightness(1.3);
  }
  100% {
    filter: drop-shadow(0 0 5px orange) brightness(1);
  }
}
</style>