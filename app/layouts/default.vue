<script setup lang="ts">
import { TheSidebar } from '~/widgets/sidebar'
import { CreateMaterialForm } from '~/features/create-material'

const showCreateModal = ref(false)
const activeFolderId = ref<string | null>(null)
const sidebarOpen = ref(false)

// Shared refresh function -- MaterialsList sets this via inject
const refreshMaterials = ref<(() => void) | null>(null)

provide('activeFolderId', activeFolderId)
provide('refreshMaterials', refreshMaterials)

function handleMaterialCreated() {
  showCreateModal.value = false
  // Use the ref directly (not inject -- we're in the same component that provides it)
  refreshMaterials.value?.()
}
</script>

<template>
  <div class="flex h-screen overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
    <!-- Desktop sidebar -->
    <div class="hidden lg:flex w-72 border-r border-gray-200 dark:border-gray-800 shrink-0">
      <TheSidebar
        @select-folder="activeFolderId = $event"
        @create-material="showCreateModal = true"
      />
    </div>

    <!-- Mobile sidebar -->
    <USlideover v-model:open="sidebarOpen" side="left" class="lg:hidden">
      <TheSidebar
        @select-folder="(id: string | null) => { activeFolderId = id; sidebarOpen = false }"
        @create-material="showCreateModal = true; sidebarOpen = false"
      />
    </USlideover>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- Mobile header -->
      <header class="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <UButton
          icon="i-heroicons-bars-3"
          variant="ghost"
          size="sm"
          @click="sidebarOpen = true"
        />
        <h1 class="font-bold text-lg">Workbook</h1>
      </header>

      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Create material modal -->
    <UModal v-model:open="showCreateModal">
      <template #content>
        <div class="p-4 sm:p-6">
          <h2 class="text-lg font-semibold mb-4">Новый материал</h2>
          <CreateMaterialForm @created="handleMaterialCreated" />
        </div>
      </template>
    </UModal>
  </div>
</template>
