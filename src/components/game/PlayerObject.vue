<template>
  <div
    class="player absolute cursor-pointer"
    :class="{ 'shooting-effect': gameStore.player.isShooting }"
    :style="playerStyle"
    @click.stop="handleClick"
  >
    <div class="relative w-full h-full">
      <!-- SVG Pesawat -->
      <svg 
        viewBox="0 0 600 400" 
        class="w-full h-full drop-shadow-xl"
        :style="{
          transform: `scaleX(${gameStore.player.direction === 'left' ? 1 : -1})`
        }"
      >
        <defs>
          <pattern id="camoPattern" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
            <rect width="150" height="150" fill="#5E6B58" />
            <path d="M30,20 Q50,5 75,35 T130,20 T110,80 T60,60 Z" fill="#3B4537" opacity="0.85" />
            <path d="M10,100 Q40,85 65,110 T130,95 T90,140 Z" fill="#3B4537" opacity="0.85" />
            <path d="M0,50 Q25,30 45,60 T95,50 T60,90 Z" fill="#C6C291" opacity="0.9" />
            <path d="M80,110 Q110,90 125,120 T150,140 Z" fill="#C6C291" opacity="0.9" />
            <path d="M50,10 Q80,30 100,5 T120,40 T70,30 Z" fill="#78876E" opacity="0.8" />
          </pattern>
          
          <linearGradient id="cockpitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#555555" />
            <stop offset="60%" style="stop-color:#2D2D2D" />
            <stop offset="100%" style="stop-color:#151515" />
          </linearGradient>

          <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ef4444" />
            <stop offset="50%" style="stop-color:#f59e0b" />
            <stop offset="100%" style="stop-color:#fef08a" />
          </linearGradient>
        </defs>
        
        <!-- Afterburner flame (api belakang) -->
        <g v-if="gameStore.player.isShooting" transform="translate(535, 195)">
          <path d="M 0,-8 L 55,-15 L 40,0 L 55,15 L 0,8 Z" fill="url(#flameGrad)">
            <animate attributeName="opacity" values="0.95;0.4;0.95" dur="0.08s" repeatCount="indefinite"/>
          </path>
        </g>

        <!-- Gambar pesawat (sama seperti sebelumnya) -->
        <polygon points="215,185 275,20 335,20 375,185" fill="url(#camoPattern)" stroke="#3B4537" stroke-width="1" />
        <path d="M 265,20 L 345,20 L 335,12 L 275,12 Z" fill="#4A5446" />
        <polygon points="380,180 470,95 510,95 485,180" fill="#4B5647" />
        <polygon points="460,200 565,260 580,260 490,200" fill="#3B4537" />
        <path d="M 15,205 Q 50,185 200,185 L 490,190 Q 525,192 535,200 L 535,210 Q 525,218 490,215 L 200,220 Q 50,220 15,205 Z" fill="url(#camoPattern)" stroke="#3B4537" stroke-width="1.5" />
        <polygon points="405,195 525,185 515,202 435,205" fill="url(#camoPattern)" stroke="#3B4537" stroke-width="1" />
        <path d="M 95,201 Q 145,170 215,182 Q 240,192 240,203 Q 180,213 95,201 Z" fill="url(#cockpitGrad)" stroke="#1A1A1A" stroke-width="2" />
        <path d="M 148,187 Q 153,198 150,207" stroke="#3A3A3A" stroke-width="2" fill="none" />
        <path d="M 198,183 Q 202,195 198,207" stroke="#3A3A3A" stroke-width="1.5" fill="none" />
        <polygon points="395,185 455,95 495,95 470,185" fill="#5E6B58" stroke="#3B4537" stroke-width="1" />
        <polygon points="235,210 365,365 435,365 390,210" fill="url(#camoPattern)" stroke="#3B4537" stroke-width="1.5" />
        <path d="M 355,365 L 445,365 L 435,373 L 375,373 Z" fill="#4A5446" />
        <polygon points="465,212 550,305 575,305 500,212" fill="url(#camoPattern)" stroke="#3B4537" stroke-width="1.2" />
      </svg>

      <!-- MUZZLE FLASH - ditempatkan di luar SVG, namun tetap dalam elemen player yang sudah di-rotasi -->
      <div 
        v-if="gameStore.player.isShooting"
        class="muzzle-flash"
        :style="muzzleFlashStyle"
      >
        <div class="flash-core"></div>
        <div class="flash-rays"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useGameStore } from '../../stores/game'
import { useShootSound } from '../../composables/useShootSound'

const gameStore = useGameStore()
const { play: playShootSound } = useShootSound()

watch(() => gameStore.player.isShooting, (shooting) => {
  if (shooting) playShootSound()
})

// Gaya utama player: posisi, ukuran, rotasi
const playerStyle = computed(() => {
  const size = 90 * gameStore.player.scale
  return {
    left: `${gameStore.player.x}px`,
    top: `${gameStore.player.y}px`,
    width: `${size}px`,
    height: `${size}px`,
    transform: `rotate(${gameStore.player.rotation}deg)`,
    transition: 'all 0.1s linear'
  }
})

// Koordinat ujung moncong dalam viewBox (sisi kiri)
const NOSE_X_LEFT = 15
const NOSE_Y = 205

const muzzleFlashStyle = computed(() => {
  const isLeft = gameStore.player.direction === 'left'
  
  // Posisi moncong dalam viewBox (setelah flip horizontal karena direction)
  const noseLocalX = isLeft ? NOSE_X_LEFT : 600 - NOSE_X_LEFT
  const noseLocalY = NOSE_Y

  // Ukuran player saat ini (dalam pixel)
  const playerWidth = 90 * gameStore.player.scale
  const playerHeight = 90 * gameStore.player.scale

  // Konversi koordinat viewBox ke koordinat lokal elemen player (0..playerWidth, 0..playerHeight)
  const localX = (noseLocalX / 600) * playerWidth
  const localY = (noseLocalY / 400) * playerHeight

  // Karena elemen player sudah di-rotate oleh parent, kita tidak perlu rotasi tambahan.
  // Yang perlu dilakukan: hitung posisi absolut dalam koordinat elemen player.
  // Tidak ada offset pusat karena posisi muzzle flash didefinisikan relatif terhadap pojok kiri atas elemen.
  // Namun kita ingin flash berada tepat di titik hidung. Maka left/top adalah localX, localY.
  // Tapi agar flash-center berada di titik hidung, kita perlu menggeser setengah lebar flash.
  // Karena flash memiliki width/height 50px, kita atur transform translate(-50%, -50%) untuk center.
  // Jadi cukup set left = localX, top = localY.
  
  return {
    left: `${localX}px`,
    top: `${localY}px`,
    // Tidak ada rotate tambahan karena parent sudah memutar seluruh player termasuk flash
    transform: `translate(-50%, -50%)`
  }
})

const handleClick = (e: Event) => {
  e.stopPropagation()
  gameStore.triggerClickEffect()
}
</script>

<style scoped>
.muzzle-flash {
  position: absolute;
  pointer-events: none;
  z-index: 10;
  width: 50px;
  height: 50px;
}

.flash-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 20px 8px #fef08a;
  animation: flashPulse 0.1s ease-out infinite;
}

.flash-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, #fef08a, #ef444400);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  animation: flashExpand 0.1s ease-out infinite;
}

@keyframes flashPulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
}

@keyframes flashExpand {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

.shooting-effect {
  animation: shootShake 0.15s ease-out;
}

@keyframes shootShake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(2px, -1px); }
  50% { transform: translate(-2px, 1px); }
  75% { transform: translate(1px, -2px); }
}
</style>