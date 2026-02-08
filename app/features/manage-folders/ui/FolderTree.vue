<script setup lang="ts">
import type { Folder } from '~/entities/folder'

defineProps<{
  folders: Folder[]
  activeFolderId?: string | null
}>()

const emit = defineEmits<{
  select: [folderId: string | null]
}>()
</script>

<template>
  <div class="space-y-0.5">
    <button
      class="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      :class="{ 'bg-primary-50 dark:bg-primary-950 text-primary-600': !activeFolderId }"
      @click="emit('select', null)"
    >
      <UIcon name="i-heroicons-inbox" class="text-base" />
      <span>Все материалы</span>
    </button>

    <div v-for="folder in folders" :key="folder.id">
      <button
        class="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        :class="{ 'bg-primary-50 dark:bg-primary-950 text-primary-600': activeFolderId === folder.id }"
        @click="emit('select', folder.id)"
      >
        <UIcon name="i-heroicons-folder" class="text-base" />
        <span class="truncate">{{ folder.name }}</span>
        <span v-if="folder._count?.materials" class="ml-auto text-xs text-gray-400">
          {{ folder._count.materials }}
        </span>
      </button>

      <div v-if="folder.children?.length" class="ml-4">
        <FolderTree
          :folders="folder.children"
          :active-folder-id="activeFolderId"
          @select="emit('select', $event)"
        />
      </div>
    </div>
  </div>
</template>
