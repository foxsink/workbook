<script setup lang="ts">
import type { Material } from '~/entities/material'
import type { Note } from '~/entities/note'
import { NoteEditor } from '~/features/edit-note'
import { TimestampInsert } from '~/features/video-timestamps'
import { formatSeconds } from '~/shared/lib/formatTime'
import VideoPlayer from './VideoPlayer.vue'

const props = defineProps<{
  material: Material & { notes: Note[] }
  activeNoteId: string | null
}>()

const emit = defineEmits<{
  'update:activeNoteId': [id: string | null]
  'update:title': [noteId: string, title: string]
}>()

const videoPlayerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)

const isVideoMaterial = computed(() =>
  props.material.type === 'VIDEO' && !!props.material.url,
)

const activeNote = computed(() =>
  props.material.notes?.find(n => n.id === props.activeNoteId),
)

function getCurrentTime(): number {
  const player = videoPlayerRef.value
  if (!player) return 0
  // Прямой запрос к Plyr
  const fromPlayer = player.getCurrentTime?.()
  if (fromPlayer != null && !Number.isNaN(fromPlayer)) return Math.floor(fromPlayer)
  // Fallback: ref обновляется на timeupdate
  const fromRef = player.currentTime?.value
  if (fromRef != null && fromRef >= 0) return Math.floor(fromRef)
  // Fallback: сохранённая позиция (после refresh плеер может ещё не отдать currentTime)
  if (props.material?.id && typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(`video-position:${props.material.id}`)
    const sec = saved ? parseInt(saved, 10) : 0
    if (!Number.isNaN(sec) && sec >= 0) return sec
  }
  return 0
}

function seekTo(seconds: number) {
  videoPlayerRef.value?.seekTo(seconds)
}

function handleTimestampInsert(seconds: number, formatted: string) {
  const timestampText = `@[${formatted}] `
  window.dispatchEvent(new CustomEvent('insert-timestamp', {
    detail: { text: timestampText, seconds },
  }))
}

// Ctrl+Shift+~: слушаем глобальный запрос на вставку таймкода — сами знаем время плеера
function handleRequestInsertTimestamp() {
  const seconds = getCurrentTime()
  const formatted = formatSeconds(seconds)
  handleTimestampInsert(seconds, formatted)
}

onMounted(() => {
  window.addEventListener('request-insert-timestamp', handleRequestInsertTimestamp)
})
onUnmounted(() => {
  window.removeEventListener('request-insert-timestamp', handleRequestInsertTimestamp)
})

provide('videoPlayerGetCurrentTime', getCurrentTime)
provide('videoPlayerSeekTo', seekTo)
</script>

<template>
  <div class="h-full flex flex-col lg:flex-row">
    <!-- Video panel -->
    <div
      v-if="isVideoMaterial"
      class="lg:w-1/2 shrink-0 flex flex-col min-h-0 lg:border-r border-b lg:border-b-0 border-gray-200 dark:border-gray-800"
    >
      <!-- Timestamp bar: над видео, аналогично шапке с заметками -->
      <div class="shrink-0 px-3 py-2 sm:px-4 sm:py-2 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <TimestampInsert :get-current-time="getCurrentTime" @insert="handleTimestampInsert" />
          <ClientOnly>
            <span class="text-xs text-gray-400 hidden sm:inline">Ctrl+Shift+~ для вставки таймкода</span>
            <template #fallback>
              <span class="text-xs text-gray-400 hidden sm:inline" />
            </template>
          </ClientOnly>
        </div>
      </div>

      <!-- Video -->
      <div class="flex-1 min-h-0 p-2 sm:p-4">
        <ClientOnly>
          <VideoPlayer
            ref="videoPlayerRef"
            :url="material.url!"
            :material-id="material.id"
          />
          <template #fallback>
            <div class="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-play-circle" class="text-4xl text-gray-300" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Editor panel -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div v-if="$slots['notes-bar']" class="shrink-0 border-b border-gray-200 dark:border-gray-800">
        <slot name="notes-bar" />
      </div>
      <div v-if="activeNoteId" class="flex-1 overflow-hidden">
        <NoteEditor
          :note-id="activeNoteId"
          :title-from-parent="activeNote?.title"
          @update:title="(noteId, title) => emit('update:title', noteId, title)"
        />
      </div>
      <div v-else class="flex-1 flex items-center justify-center text-gray-400 p-4 sm:p-8">
        <div class="text-center">
          <UIcon name="i-heroicons-pencil-square" class="text-3xl mb-2" />
          <p class="text-sm sm:text-base">Выберите заметку для редактирования</p>
        </div>
      </div>
    </div>
  </div>
</template>
