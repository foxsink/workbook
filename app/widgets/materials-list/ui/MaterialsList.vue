<script setup lang="ts">
import { MaterialCard, materialApi } from '~/entities/material'
import type { Material } from '~/entities/material'
import { TagBadge } from '~/entities/tag'
import type { Tag } from '~/entities/tag'
import { useTags } from '~/features/manage-tags'

const props = defineProps<{
  folderId?: string | null
}>()

const materials = ref<Material[]>([])
const isLoading = ref(false)
const activeTagId = ref<string | null>(null)

const { tags, fetchTags } = useTags()
onMounted(() => fetchTags())

// Register refresh function with layout so modal can trigger list update
const refreshMaterials = inject<Ref<(() => void) | null>>('refreshMaterials', ref(null))
onMounted(() => {
  refreshMaterials.value = fetchMaterials
})
onUnmounted(() => {
  if (refreshMaterials.value === fetchMaterials) {
    refreshMaterials.value = null
  }
})

async function fetchMaterials() {
  isLoading.value = true
  try {
    materials.value = await materialApi.getAll(
      props.folderId || undefined,
      activeTagId.value || undefined,
    )
  }
  finally {
    isLoading.value = false
  }
}

function toggleTagFilter(tagId: string) {
  activeTagId.value = activeTagId.value === tagId ? null : tagId
  fetchMaterials()
}

watch(() => props.folderId, () => fetchMaterials())
onMounted(() => fetchMaterials())

defineExpose({ refresh: fetchMaterials })
</script>

<template>
  <div>
    <!-- Tag filter bar -->
    <div v-if="tags.length > 0" class="flex flex-wrap gap-1.5 mb-4">
      <button
        v-for="tag in tags"
        :key="tag.id"
        class="transition-all"
        :class="activeTagId === tag.id ? 'scale-110 ring-2 ring-offset-1 ring-primary-500 rounded-full' : 'opacity-80 hover:opacity-100'"
        @click="toggleTagFilter(tag.id)"
      >
        <TagBadge :tag="tag" />
      </button>
      <button
        v-if="activeTagId"
        class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-0.5"
        @click="activeTagId = null; fetchMaterials()"
      >
        Сбросить
      </button>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <div v-else-if="materials.length === 0" class="text-center py-12 px-4">
      <UIcon name="i-heroicons-document-plus" class="text-4xl text-gray-300 mb-3" />
      <p class="text-gray-500">{{ activeTagId ? 'Нет материалов с этим тегом' : 'Нет материалов' }}</p>
      <p class="text-sm text-gray-400">Создайте первый материал, чтобы начать</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      <NuxtLink
        v-for="material in materials"
        :key="material.id"
        :to="`/materials/${material.id}`"
      >
        <MaterialCard :material="material" />
      </NuxtLink>
    </div>
  </div>
</template>
