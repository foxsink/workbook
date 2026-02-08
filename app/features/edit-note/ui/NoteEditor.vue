<script setup lang="ts">
import { useEditNote } from '../model/useEditNote'
import { noteApi } from '~/entities/note'

const props = defineProps<{
  noteId: string
  /** Заголовок из материала — источник истины для табов, синхронизируем при переименовании в списке */
  titleFromParent?: string
}>()

const emit = defineEmits<{
  'update:title': [noteId: string, title: string]
}>()

const noteIdRef = computed(() => props.noteId)
const { note, isLoading, isSaving, isPendingSave, lastSaved, debouncedSave } = useEditNote(noteIdRef)

// Синхронизация заголовка при переименовании в табах (только заголовок, не трогаем content)
watch(() => props.titleFromParent, (newTitle) => {
  if (newTitle && note.value && newTitle !== note.value.title) {
    note.value.title = newTitle
  }
}, { immediate: true })

import MilkdownEditorWrapper from './MilkdownEditorWrapper.vue'

const editorWrapperRef = ref<any>(null)
const isRenamingTitle = ref(false)
const titleInput = ref('')

function startRenameTitle() {
  if (!note.value) return
  titleInput.value = note.value.title
  isRenamingTitle.value = true
  nextTick(() => {
    const el = document.querySelector<HTMLInputElement>('[data-note-title-input]')
    el?.focus()
    el?.select()
  })
}

async function confirmRenameTitle() {
  const newTitle = titleInput.value.trim()
  isRenamingTitle.value = false
  if (!newTitle || !note.value || newTitle === note.value.title) return

  await noteApi.update(note.value.id, { title: newTitle })
  note.value = { ...note.value, title: newTitle }
  emit('update:title', note.value.id, newTitle)
}

function handleContentUpdate(content: string) {
  if (note.value) {
    note.value.content = content
    debouncedSave(content)
  }
}

// Listen for timestamp insert events from MaterialWorkspace (Ctrl+Shift+~ / button)
function handleInsertTimestamp(e: Event) {
  const detail = (e as CustomEvent).detail
  if (!detail?.text) return

  // Try inserting at cursor position via Milkdown API
  if (editorWrapperRef.value?.insertAtCursor) {
    editorWrapperRef.value.insertAtCursor(detail.text)
  } else if (note.value) {
    // Fallback (редактор ещё не готов после refresh): вставляем в конец последней строки, не на новую
    const existing = (note.value.content || '').replace(/\n+$/, '')
    const newContent = existing ? `${existing}${detail.text}` : detail.text
    handleContentUpdate(newContent)
    note.value = { ...note.value, content: newContent }
  }
}

// Listen for timestamp click events -> seek video to that time
const seekTo = inject<(seconds: number) => void>('videoPlayerSeekTo', () => {})

function handleTimestampClick(e: Event) {
  const target = e.target as HTMLElement
  const timestampEl = target.closest('[data-timestamp]')
  if (timestampEl) {
    e.preventDefault()
    e.stopPropagation()
    const seconds = parseInt(timestampEl.getAttribute('data-timestamp') || '0')
    seekTo(seconds)
    return
  }
  // Клик по пустой области редактора — фокус и курсор в конец
  if (target instanceof HTMLElement && (target.hasAttribute('data-editor-area') || target.classList.contains('milkdown'))) {
    editorWrapperRef.value?.focusAtEnd()
  }
}

const saveStatusText = computed(() => {
  if (isSaving.value) return 'Сохранение...'
  if (isPendingSave.value) return 'Сохраню...'
  if (lastSaved.value) {
    const seconds = Math.floor((Date.now() - lastSaved.value.getTime()) / 1000)
    if (seconds < 5) return 'Сохранено'
    return `Сохранено ${seconds}с назад`
  }
  return ''
})

const showSaveLoader = computed(() => isSaving.value || isPendingSave.value)

const tick = ref(0)
let interval: ReturnType<typeof setInterval>
onMounted(() => {
  interval = setInterval(() => tick.value++, 5000)
  window.addEventListener('insert-timestamp', handleInsertTimestamp)
})
onUnmounted(() => {
  clearInterval(interval)
  window.removeEventListener('insert-timestamp', handleInsertTimestamp)
})
</script>

<template>
  <div class="flex flex-col h-full p-2 sm:p-4">
    <div class="flex flex-col flex-1 min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-950 shadow-sm">
      <!-- Header -->
      <div class="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0">
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <UIcon name="i-heroicons-document-text" class="text-gray-400 shrink-0" />
          <!-- Editable title -->
          <template v-if="isRenamingTitle">
            <input
              v-model="titleInput"
              data-note-title-input
              class="text-sm font-medium bg-transparent border-b border-primary-500 outline-none min-w-0 flex-1 py-0"
              @keydown.enter.prevent="confirmRenameTitle"
              @keydown.escape.prevent="isRenamingTitle = false"
            />
            <button
              class="shrink-0 text-green-500 hover:text-green-600 transition-colors"
              title="Сохранить"
              @click="confirmRenameTitle"
            >
              <UIcon name="i-heroicons-check" />
            </button>
            <button
              class="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
              title="Отмена"
              @click="isRenamingTitle = false"
            >
              <UIcon name="i-heroicons-x-mark" />
            </button>
          </template>
          <button
            v-else-if="note"
            class="text-sm font-medium truncate text-left hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-text"
            title="Нажмите для переименования"
            @click="startRenameTitle"
          >
            {{ note.title }}
          </button>
        </div>
        <div v-if="saveStatusText" class="flex items-center gap-1.5 shrink-0 ml-2" :key="tick">
          <UIcon
            v-if="showSaveLoader"
            name="i-heroicons-arrow-path"
            class="text-xs text-primary-500 animate-spin"
          />
          <span class="text-xs text-gray-400">{{ saveStatusText }}</span>
        </div>
      </div>

      <!-- Editor -->
      <div v-if="isLoading" class="flex items-center justify-center flex-1">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl" />
      </div>

      <div
        v-else-if="note"
        data-editor-area
        class="flex-1 overflow-y-auto cursor-text min-h-0"
        @click="handleTimestampClick"
      >
        <ClientOnly>
          <MilkdownEditorWrapper
            ref="editorWrapperRef"
            :key="noteId"
            :model-value="note.content"
            @update:model-value="handleContentUpdate"
          />
          <template #fallback>
            <div class="p-4 text-gray-400">Загрузка редактора...</div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>
