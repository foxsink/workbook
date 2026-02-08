<script setup lang="ts">
import { formatSeconds } from '~/shared/lib/formatTime'

const props = defineProps<{
  getCurrentTime: () => number
}>()

const emit = defineEmits<{
  insert: [seconds: number, formatted: string]
}>()

function handleInsert() {
  const seconds = props.getCurrentTime()
  const formatted = formatSeconds(seconds)
  emit('insert', seconds, formatted)
}
</script>

<template>
  <UTooltip text="Вставить таймкод (Ctrl+Shift+~)">
    <UButton
      icon="i-heroicons-clock"
      variant="ghost"
      size="xs"
      @click="handleInsert"
    />
  </UTooltip>
</template>
