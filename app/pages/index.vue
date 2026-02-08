<script setup lang="ts">
import { MaterialsList } from '~/widgets/materials-list'

const activeFolderId = inject<Ref<string | null>>('activeFolderId', ref(null))
</script>

<template>
  <div class="p-3 sm:p-6">
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <h2 class="text-xl sm:text-2xl font-bold">
        {{ activeFolderId ? 'Материалы в папке' : 'Все материалы' }}
      </h2>
    </div>

    <MaterialsList :folder-id="activeFolderId" />
  </div>
</template>
