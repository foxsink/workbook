<script setup lang="ts">
import type { Tag } from '../model/types'

const props = defineProps<{
  tag: Tag
  removable?: boolean
}>()

const emit = defineEmits<{
  remove: [tagId: string]
}>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
    :style="{
      backgroundColor: tag.color + '20',
      color: tag.color,
      border: `1px solid ${tag.color}40`,
    }"
  >
    {{ tag.name }}
    <button
      v-if="removable"
      class="ml-0.5 hover:opacity-70 transition-opacity"
      @click.stop="emit('remove', tag.id)"
    >
      <UIcon name="i-heroicons-x-mark" class="text-[10px]" />
    </button>
  </span>
</template>
