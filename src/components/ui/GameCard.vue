<template>
  <div class="game-card glass-card p-6 transition-all duration-300 hover:shadow-2xl">
    <div v-if="title" class="mb-4">
      <h2 class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
        {{ title }}
      </h2>
      <div v-if="subtitle" class="text-sm text-gray-400 mt-1">{{ subtitle }}</div>
    </div>
    
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

defineProps<Props>()
</script>

<style scoped>
.game-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.game-card:hover {
  transform: translateY(-2px);
}
</style>