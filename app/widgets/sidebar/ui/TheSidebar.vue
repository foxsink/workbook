<script setup lang="ts">
import { FolderTree, useFolders } from '~/features/manage-folders'

const emit = defineEmits<{
  selectFolder: [folderId: string | null]
  createMaterial: []
}>()

const activeFolderId = ref<string | null>(null)
const newFolderName = ref('')
const showNewFolder = ref(false)

const { folders, isLoading, fetchFolders, createFolder } = useFolders()

onMounted(() => fetchFolders())

function handleSelectFolder(folderId: string | null) {
  activeFolderId.value = folderId
  emit('selectFolder', folderId)
}

async function handleCreateFolder() {
  if (!newFolderName.value.trim()) return
  await createFolder(newFolderName.value.trim())
  newFolderName.value = ''
  showNewFolder.value = false
}
</script>

<template>
  <aside class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-800">
      <h1 class="text-lg font-bold">Workbook</h1>
    </div>

    <!-- Create material button -->
    <div class="p-3">
      <UButton
        icon="i-heroicons-plus"
        block
        @click="emit('createMaterial')"
      >
        Новый материал
      </UButton>
    </div>

    <!-- Folder tree -->
    <div class="flex-1 overflow-y-auto px-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Папки</span>
        <UButton
          icon="i-heroicons-folder-plus"
          variant="ghost"
          size="xs"
          @click="showNewFolder = !showNewFolder"
        />
      </div>

      <!-- New folder form -->
      <div v-if="showNewFolder" class="mb-2">
        <form class="flex gap-1" @submit.prevent="handleCreateFolder">
          <UInput
            v-model="newFolderName"
            placeholder="Имя папки"
            size="xs"
            autofocus
            class="flex-1"
          />
          <UButton type="submit" size="xs" icon="i-heroicons-check" />
        </form>
      </div>

      <div v-if="isLoading" class="text-center py-4">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
      </div>

      <FolderTree
        v-else
        :folders="folders"
        :active-folder-id="activeFolderId"
        @select="handleSelectFolder"
      />
    </div>
  </aside>
</template>
