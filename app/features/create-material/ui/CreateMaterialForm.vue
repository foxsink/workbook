<script setup lang="ts">
import { useCreateMaterial } from '../model/useCreateMaterial'
import { useTags, TagSelect } from '~/features/manage-tags'
import type { Tag } from '~/entities/tag'

const emit = defineEmits<{
  created: []
}>()

const { form, typeOptions, isLoading, error, submit } = useCreateMaterial(() => {
  emit('created')
})

const { tags: availableTags, fetchTags } = useTags()
onMounted(() => fetchTags())

function handleTagCreated(tag: Tag) {
  // Add newly created tag to the available list
  if (!availableTags.value.find(t => t.id === tag.id)) {
    availableTags.value.push(tag)
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <UFormField label="Название" required>
      <UInput v-model="form.title" placeholder="Введите название материала" autofocus />
    </UFormField>

    <UFormField label="Тип">
      <USelect v-model="form.type" :items="typeOptions" />
    </UFormField>

    <UFormField label="Ссылка">
      <UInput v-model="form.url" placeholder="https://..." />
    </UFormField>

    <UFormField label="Описание">
      <UTextarea v-model="form.description" placeholder="Краткое описание..." :rows="3" />
    </UFormField>

    <UFormField label="Теги">
      <TagSelect
        :model-value="form.tagIds ?? []"
        :available-tags="availableTags"
        @update:model-value="form.tagIds = $event"
        @tag-created="handleTagCreated"
      />
    </UFormField>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <div class="flex justify-end gap-2">
      <UButton type="submit" :loading="isLoading">
        Создать
      </UButton>
    </div>
  </form>
</template>
