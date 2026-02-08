import { noteApi } from '~/entities/note'
import type { Note } from '~/entities/note'

export function useEditNote(noteId: Ref<string | null>) {
  const note = ref<Note | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isPendingSave = ref(false) // пользователь ввёл текст, debounce ждёт
  const lastSaved = ref<Date | null>(null)

  let saveTimeout: ReturnType<typeof setTimeout> | null = null

  async function fetchNote() {
    if (!noteId.value) {
      note.value = null
      return
    }

    isLoading.value = true
    try {
      note.value = await noteApi.getById(noteId.value)
    }
    finally {
      isLoading.value = false
    }
  }

  async function saveContent(content: string) {
    if (!noteId.value) return

    isSaving.value = true
    try {
      await noteApi.update(noteId.value, { content })
      lastSaved.value = new Date()
    }
    finally {
      isSaving.value = false
    }
  }

  function debouncedSave(content: string) {
    if (saveTimeout) clearTimeout(saveTimeout)
    isPendingSave.value = true
    saveTimeout = setTimeout(async () => {
      isPendingSave.value = false
      await saveContent(content)
    }, 1500)
  }

  watch(noteId, () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
      isPendingSave.value = false
    }
    fetchNote()
  }, { immediate: true })

  return { note, isLoading, isSaving, isPendingSave, lastSaved, fetchNote, saveContent, debouncedSave }
}
