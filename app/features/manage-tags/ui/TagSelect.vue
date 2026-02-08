<script setup lang="ts">
import { TagBadge, tagApi } from '~/entities/tag'
import type { Tag } from '~/entities/tag'

const props = defineProps<{
  modelValue: string[]
  availableTags: Tag[]
}>()

const emit = defineEmits<{
  'update:modelValue': [ids: string[]]
  'tag-created': [tag: Tag]
}>()

const searchQuery = ref('')
const showDropdown = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const isCreating = ref(false)

const selectedTags = computed(() =>
  props.availableTags.filter(t => props.modelValue.includes(t.id)),
)

const filteredTags = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  return props.availableTags.filter(t =>
    !props.modelValue.includes(t.id)
    && (!query || t.name.toLowerCase().includes(query)),
  )
})

const canCreateNew = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return false
  return !props.availableTags.some(t => t.name.toLowerCase() === query.toLowerCase())
})

function toggleTag(tagId: string) {
  const ids = [...props.modelValue]
  const idx = ids.indexOf(tagId)
  if (idx >= 0) {
    ids.splice(idx, 1)
  }
  else {
    ids.push(tagId)
  }
  emit('update:modelValue', ids)
  searchQuery.value = ''
}

function removeTag(tagId: string) {
  emit('update:modelValue', props.modelValue.filter(id => id !== tagId))
}

// Preset tag colors for new tags
const tagColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
]

function getRandomColor(): string {
  return tagColors[Math.floor(Math.random() * tagColors.length)]
}

async function createNewTag() {
  const name = searchQuery.value.trim()
  if (!name || isCreating.value) return

  isCreating.value = true
  try {
    const tag = await tagApi.create({ name, color: getRandomColor() })
    emit('tag-created', tag)
    emit('update:modelValue', [...props.modelValue, tag.id])
    searchQuery.value = ''
  }
  finally {
    isCreating.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && canCreateNew.value) {
    e.preventDefault()
    createNewTag()
  }
  if (e.key === 'Backspace' && !searchQuery.value && props.modelValue.length > 0) {
    // Remove last tag on backspace
    removeTag(props.modelValue[props.modelValue.length - 1])
  }
}

function handleFocus() {
  showDropdown.value = true
}

function handleBlur() {
  // Delay to allow click on dropdown items
  setTimeout(() => { showDropdown.value = false }, 200)
}
</script>

<template>
  <div class="relative">
    <!-- Selected tags + input -->
    <div
      class="flex flex-wrap gap-1.5 items-center min-h-[38px] px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-colors"
      @click="inputRef?.focus()"
    >
      <TagBadge
        v-for="tag in selectedTags"
        :key="tag.id"
        :tag="tag"
        removable
        @remove="removeTag"
      />
      <input
        ref="inputRef"
        v-model="searchQuery"
        class="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
        placeholder="Введите тег..."
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
    </div>

    <!-- Dropdown -->
    <div
      v-if="showDropdown && (filteredTags.length > 0 || canCreateNew)"
      class="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto"
    >
      <!-- Existing tags -->
      <button
        v-for="tag in filteredTags"
        :key="tag.id"
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
        @mousedown.prevent="toggleTag(tag.id)"
      >
        <span
          class="w-3 h-3 rounded-full shrink-0"
          :style="{ backgroundColor: tag.color }"
        />
        <span class="truncate">{{ tag.name }}</span>
        <span v-if="tag._count" class="ml-auto text-xs text-gray-400">
          {{ tag._count.materials }}
        </span>
      </button>

      <!-- Create new tag -->
      <button
        v-if="canCreateNew"
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-primary-600 dark:text-primary-400 border-t border-gray-100 dark:border-gray-800 transition-colors"
        :disabled="isCreating"
        @mousedown.prevent="createNewTag"
      >
        <UIcon name="i-heroicons-plus-circle" class="shrink-0" />
        <span>Создать "{{ searchQuery.trim() }}"</span>
      </button>
    </div>
  </div>
</template>
