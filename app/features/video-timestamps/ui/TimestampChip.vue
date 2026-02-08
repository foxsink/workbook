<script setup lang="ts">
import { formatSeconds } from '~/shared/lib/formatTime'

const props = defineProps<{
  seconds: number
  label?: string
}>()

const emit = defineEmits<{
  seek: [seconds: number]
}>()
</script>

<template>
  <button
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-mono hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors cursor-pointer"
    @click="emit('seek', seconds)"
  >
    <UIcon name="i-heroicons-play" class="text-[10px]" />
    {{ formatSeconds(seconds) }}
  </button>
</template>
