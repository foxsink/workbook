<script setup lang="ts">
import type { Material } from '../model/types'
import { TagBadge } from '~/entities/tag'

const props = defineProps<{
  material: Material
}>()

const typeIcons: Record<string, string> = {
  VIDEO: 'i-heroicons-play-circle',
  ARTICLE: 'i-heroicons-document-text',
  PDF: 'i-heroicons-document',
  OTHER: 'i-heroicons-folder-open',
}

const typeColors: Record<string, string> = {
  VIDEO: 'error',
  ARTICLE: 'primary',
  PDF: 'warning',
  OTHER: 'neutral',
}
</script>

<template>
  <UCard
    class="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
  >
    <div class="flex items-start gap-3">
      <UIcon
        :name="typeIcons[material.type] || typeIcons.OTHER"
        class="text-xl mt-0.5 shrink-0"
      />
      <div class="min-w-0 flex-1">
        <h3 class="font-semibold text-sm truncate">{{ material.title }}</h3>
        <p v-if="material.description" class="text-xs text-gray-500 mt-1 line-clamp-2">
          {{ material.description }}
        </p>

        <!-- Tags -->
        <div v-if="material.tags?.length" class="flex flex-wrap gap-1 mt-2">
          <TagBadge
            v-for="tag in material.tags"
            :key="tag.id"
            :tag="tag"
          />
        </div>

        <div class="flex items-center gap-2 mt-2">
          <UBadge :color="typeColors[material.type] || 'neutral'" variant="subtle" size="xs">
            {{ material.type }}
          </UBadge>
          <span v-if="material._count" class="text-xs text-gray-400">
            {{ material._count.notes }} {{ material._count.notes === 1 ? 'заметка' : 'заметок' }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>
