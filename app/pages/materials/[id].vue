<script setup lang="ts">
definePageMeta({ ssr: false })

import { materialApi } from '~/entities/material'
import { noteApi } from '~/entities/note'
import { TagBadge } from '~/entities/tag'
import type { Tag } from '~/entities/tag'
import { MaterialWorkspace } from '~/widgets/material-workspace'
import { NoteEditor } from '~/features/edit-note'
import { useTags, TagSelect } from '~/features/manage-tags'
import type { Material } from '~/entities/material'
import type { Note } from '~/entities/note'

const route = useRoute()
const materialId = computed(() => route.params.id as string)

const { data: materialData, refresh } = await useAsyncData(
  `material-${materialId.value}`,
  () => materialApi.getById(materialId.value) as Promise<Material & { notes: Note[] }>,
)

// Локальный ref для мутабельного состояния (useAsyncData возвращает readonly)
const material = ref<(Material & { notes: Note[] }) | null>(
  materialData.value ? structuredClone(materialData.value) : null,
)
watch(materialData, (v) => {
  material.value = v ? structuredClone(v) : null
}, { immediate: true })

const activeNoteId = ref<string | null>(null)
const showTagEditor = ref(false)
const showNewNote = ref(false)
const newNoteTitle = ref('')

// Auto-select: последняя открытая заметка из localStorage, иначе первая (самая недавняя)
const STORAGE_KEY_LAST_NOTE = 'material-last-note'

function selectInitialNote() {
  if (!material.value || !materialId.value) return
  if (material.value.notes?.length) {
    const stored = typeof localStorage !== 'undefined'
      ? localStorage.getItem(`${STORAGE_KEY_LAST_NOTE}:${materialId.value}`)
      : null
    const lastNoteId = stored && material.value.notes.some(n => n.id === stored)
      ? stored
      : material.value.notes[0].id
    activeNoteId.value = lastNoteId
  } else {
    // Создаём первую заметку
    noteApi.create({ title: 'Заметка 1', materialId: materialId.value })
      .then(async (note) => {
        await refresh()
        activeNoteId.value = note.id
      })
  }
}

function ensureActiveNoteValid() {
  const notes = material.value?.notes
  if (!notes?.length) return
  const current = activeNoteId.value
  const isValid = current && notes.some(n => n.id === current)
  if (!isValid) {
    selectInitialNote()
  }
}

// Флаг: выбор заметки только после гидрации (localStorage доступен только на клиенте)
const isClientReady = ref(false)

// Выбор заметки — только после монтирования (избегаем hydration mismatch)
onMounted(() => {
  isClientReady.value = true
  nextTick(() => ensureActiveNoteValid())
})

// При изменении заметок (удаление и т.д.) — обновить активную (только после гидрации)
watch(() => material.value?.notes, (notes) => {
  if (isClientReady.value && notes?.length) {
    ensureActiveNoteValid()
  }
}, { immediate: true, deep: true })

// Сохранять последнюю открытую заметку
watch(activeNoteId, (id) => {
  if (typeof localStorage !== 'undefined' && materialId.value) {
    if (id) {
      localStorage.setItem(`${STORAGE_KEY_LAST_NOTE}:${materialId.value}`, id)
    } else {
      localStorage.removeItem(`${STORAGE_KEY_LAST_NOTE}:${materialId.value}`)
    }
  }
}, { immediate: true })

const isVideoMaterial = computed(() =>
  material.value?.type === 'VIDEO' && !!material.value?.url,
)

const activeNote = computed(() =>
  material.value?.notes?.find(n => n.id === activeNoteId.value),
)

// Tags
const { tags: availableTags, fetchTags } = useTags()
onMounted(() => fetchTags())

const selectedTagIds = computed({
  get: () => material.value?.tags?.map(t => t.id) || [],
  set: () => {},
})

async function updateTags(tagIds: string[]) {
  if (!material.value) return
  await materialApi.update(material.value.id, { tagIds })
  await refresh()
}

function handleTagCreated(tag: Tag) {
  if (!availableTags.value.find(t => t.id === tag.id)) {
    availableTags.value.push(tag)
  }
}

async function createNote() {
  if (!material.value) return
  const title = newNoteTitle.value.trim() || `Заметка ${(material.value.notes?.length || 0) + 1}`

  const note = await noteApi.create({
    title,
    materialId: materialId.value,
  })

  newNoteTitle.value = ''
  showNewNote.value = false
  await refresh()
  activeNoteId.value = note.id
}

async function deleteNote(noteId: string) {
  await noteApi.remove(noteId)
  if (activeNoteId.value === noteId) {
    const remaining = material.value?.notes?.filter(n => n.id !== noteId) ?? []
    activeNoteId.value = remaining.length > 0 ? remaining[0].id : null
  }
  await refresh()
}

// Inline rename
const renamingNoteId = ref<string | null>(null)
const renameValue = ref('')

function startRename(note: Note) {
  renamingNoteId.value = note.id
  renameValue.value = note.title
  nextTick(() => {
    const input = document.querySelector<HTMLInputElement>('[data-rename-input]')
    input?.focus()
    input?.select()
  })
}

async function confirmRename(noteId: string) {
  const newTitle = renameValue.value.trim()
  if (!newTitle) {
    renamingNoteId.value = null
    return
  }

  await noteApi.update(noteId, { title: newTitle })
  renamingNoteId.value = null
  // Оптимистичное обновление
  const idx = material.value?.notes?.findIndex(n => n.id === noteId)
  if (idx !== undefined && idx >= 0 && material.value) {
    material.value.notes[idx] = { ...material.value.notes[idx], title: newTitle }
  }
  await refresh()
}

function cancelRename() {
  renamingNoteId.value = null
}

function handleNoteTitleUpdate(noteId: string, title: string) {
  const idx = material.value?.notes?.findIndex(n => n.id === noteId)
  if (idx !== undefined && idx >= 0 && material.value) {
    material.value.notes[idx] = { ...material.value.notes[idx], title }
  }
}

const typeIcons: Record<string, string> = {
  VIDEO: 'i-heroicons-play-circle',
  ARTICLE: 'i-heroicons-document-text',
  PDF: 'i-heroicons-document',
  OTHER: 'i-heroicons-folder-open',
}

// Ctrl+Shift+~: вставка таймкода — MaterialWorkspace слушает request-insert-timestamp и сам подставляет время
function handleTimestampShortcut(e: KeyboardEvent) {
  if (e.ctrlKey && e.shiftKey && e.code === 'Backquote') {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('request-insert-timestamp'))
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleTimestampShortcut)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleTimestampShortcut)
})
</script>

<template>
  <div v-if="!material" class="flex items-center justify-center h-full">
    <p class="text-gray-500">Материал не найден</p>
  </div>

  <div v-else class="flex flex-col h-full">
    <!-- Header: compact on mobile -->
    <div class="px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
      <!-- Back link -->
      <NuxtLink to="/" class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center gap-1">
        <UIcon name="i-heroicons-arrow-left" class="text-xs" />
        <span class="hidden sm:inline">Назад</span>
      </NuxtLink>

      <!-- Title row -->
      <div class="flex items-center gap-2 mt-1 sm:mt-2">
        <UIcon :name="typeIcons[material.type] || typeIcons.OTHER" class="text-lg sm:text-2xl shrink-0" />
        <div class="min-w-0 flex-1">
          <h1 class="text-base sm:text-xl font-bold truncate">{{ material.title }}</h1>
          <p v-if="material.description" class="text-xs text-gray-500 truncate hidden sm:block">
            {{ material.description }}
          </p>
        </div>
      </div>

      <!-- Tags row -->
      <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
        <TagBadge
          v-for="tag in material.tags"
          :key="tag.id"
          :tag="tag"
        />
        <button
          class="inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          @click="showTagEditor = !showTagEditor"
        >
          <UIcon name="i-heroicons-tag" class="text-xs" />
          <span>{{ material.tags?.length ? 'Изменить' : 'Добавить теги' }}</span>
        </button>
      </div>

      <!-- Inline tag editor -->
      <div v-if="showTagEditor" class="mt-2">
        <TagSelect
          :model-value="selectedTagIds"
          :available-tags="availableTags"
          @update:model-value="updateTags"
          @tag-created="handleTagCreated"
        />
      </div>
    </div>

    <!-- Content area: ClientOnly избегает hydration mismatch (activeNoteId из localStorage) -->
    <ClientOnly>
      <div class="flex-1 min-h-0 overflow-hidden flex flex-col">
      <!-- Video material: split-view -->
      <MaterialWorkspace
        v-if="isVideoMaterial"
        :material="material"
        :active-note-id="activeNoteId"
        @update:active-note-id="activeNoteId = $event"
        @update:title="handleNoteTitleUpdate"
      >
        <template #notes-bar>
          <div class="px-3 py-2 sm:px-4 sm:py-2">
            <div class="flex items-center gap-2 overflow-x-auto scroll-smooth-x pb-1 -mb-1">
              <UPopover v-model:open="showNewNote">
                <UButton icon="i-heroicons-plus" size="xs" variant="soft" class="shrink-0">
                  <span class="hidden sm:inline">Заметка</span>
                </UButton>
                <template #content>
                  <div class="p-3 w-64">
                    <form @submit.prevent="createNote">
                      <UFormField label="Название заметки">
                        <UInput
                          v-model="newNoteTitle"
                          placeholder="Введите название..."
                          autofocus
                          size="sm"
                        />
                      </UFormField>
                      <div class="flex justify-end gap-2 mt-3">
                        <UButton size="xs" variant="ghost" @click="showNewNote = false">Отмена</UButton>
                        <UButton size="xs" type="submit">Создать</UButton>
                      </div>
                    </form>
                  </div>
                </template>
              </UPopover>
              <template v-for="note in material.notes" :key="note.id">
                <form
                  v-if="renamingNoteId === note.id"
                  class="shrink-0 flex items-center gap-1"
                  @submit.prevent="confirmRename(note.id)"
                >
                  <input
                    v-model="renameValue"
                    data-rename-input
                    class="px-2 py-1 text-xs rounded border border-primary-500 bg-white dark:bg-gray-900 outline-none w-32"
                    @keydown.enter.prevent="confirmRename(note.id)"
                    @keydown.escape.prevent="cancelRename"
                  />
                  <button type="button" class="shrink-0 text-green-500 hover:text-green-600 transition-colors" title="Сохранить" @click="confirmRename(note.id)">
                    <UIcon name="i-heroicons-check" class="text-sm" />
                  </button>
                  <button type="button" class="shrink-0 text-gray-400 hover:text-red-500 transition-colors" title="Отмена" @click="cancelRename">
                    <UIcon name="i-heroicons-x-mark" class="text-sm" />
                  </button>
                </form>
                <UButton
                  v-else
                  size="xs"
                  :variant="activeNoteId === note.id ? 'solid' : 'outline'"
                  class="shrink-0 max-w-[150px]"
                  @click="activeNoteId = note.id"
                  @dblclick="startRename(note)"
                >
                  <span class="truncate">{{ note.title }}</span>
                  <template #trailing>
                    <UIcon name="i-heroicons-x-mark" class="text-xs opacity-50 hover:opacity-100" @click.stop="deleteNote(note.id)" />
                  </template>
                </UButton>
              </template>
            </div>
          </div>
        </template>
      </MaterialWorkspace>

      <!-- Non-video material: notes bar над редактором -->
      <template v-else>
        <div class="shrink-0 px-3 py-2 sm:px-4 sm:py-2 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-2 overflow-x-auto scroll-smooth-x pb-1 -mb-1">
            <UPopover v-model:open="showNewNote">
              <UButton icon="i-heroicons-plus" size="xs" variant="soft" class="shrink-0">
                <span class="hidden sm:inline">Заметка</span>
              </UButton>
              <template #content>
                <div class="p-3 w-64">
                  <form @submit.prevent="createNote">
                    <UFormField label="Название заметки">
                      <UInput
                        v-model="newNoteTitle"
                        placeholder="Введите название..."
                        autofocus
                        size="sm"
                      />
                    </UFormField>
                    <div class="flex justify-end gap-2 mt-3">
                      <UButton size="xs" variant="ghost" @click="showNewNote = false">Отмена</UButton>
                      <UButton size="xs" type="submit">Создать</UButton>
                    </div>
                  </form>
                </div>
              </template>
            </UPopover>
            <template v-for="note in material.notes" :key="note.id">
              <form
                v-if="renamingNoteId === note.id"
                class="shrink-0 flex items-center gap-1"
                @submit.prevent="confirmRename(note.id)"
              >
                <input
                  v-model="renameValue"
                  data-rename-input
                  class="px-2 py-1 text-xs rounded border border-primary-500 bg-white dark:bg-gray-900 outline-none w-32"
                  @keydown.enter.prevent="confirmRename(note.id)"
                  @keydown.escape.prevent="cancelRename"
                />
                <button type="button" class="shrink-0 text-green-500 hover:text-green-600 transition-colors" title="Сохранить" @click="confirmRename(note.id)">
                  <UIcon name="i-heroicons-check" class="text-sm" />
                </button>
                <button type="button" class="shrink-0 text-gray-400 hover:text-red-500 transition-colors" title="Отмена" @click="cancelRename">
                  <UIcon name="i-heroicons-x-mark" class="text-sm" />
                </button>
              </form>
              <UButton
                v-else
                size="xs"
                :variant="activeNoteId === note.id ? 'solid' : 'outline'"
                class="shrink-0 max-w-[150px]"
                @click="activeNoteId = note.id"
                @dblclick="startRename(note)"
              >
                <span class="truncate">{{ note.title }}</span>
                <template #trailing>
                  <UIcon name="i-heroicons-x-mark" class="text-xs opacity-50 hover:opacity-100" @click.stop="deleteNote(note.id)" />
                </template>
              </UButton>
            </template>
          </div>
        </div>
        <div v-if="activeNoteId" class="flex-1 min-h-0 overflow-hidden">
          <NoteEditor
            :note-id="activeNoteId"
            :title-from-parent="activeNote?.title"
            @update:title="handleNoteTitleUpdate"
          />
        </div>
        <div v-else class="flex-1 flex items-center justify-center text-gray-400 p-4 sm:p-8">
          <div class="text-center">
            <UIcon name="i-heroicons-pencil-square" class="text-3xl mb-2" />
            <p class="text-sm sm:text-base">Выберите или создайте заметку</p>
          </div>
        </div>
      </template>
    </div>
    <template #fallback>
      <div class="flex-1 flex items-center justify-center min-h-0">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl text-gray-400" />
      </div>
    </template>
    </ClientOnly>
  </div>
</template>
