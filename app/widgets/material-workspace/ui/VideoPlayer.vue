<script setup lang="ts">
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

const props = defineProps<{
  url: string
  /** ID материала — для сохранения позиции в localStorage */
  materialId?: string
}>()

const emit = defineEmits<{
  timeUpdate: [seconds: number]
  ready: []
}>()

const containerRef = ref<HTMLElement | null>(null)
let player: Plyr | null = null

const currentTime = ref(0)
let savePositionTimeout: ReturnType<typeof setTimeout> | null = null

const STORAGE_KEY = 'video-position'

// Parse YouTube video ID from URL
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&]+)/)
  return match ? match[1] : null
}

// Parse Vimeo video ID from URL
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

function initPlayer() {
  if (!containerRef.value) return

  try {
    const youtubeId = getYouTubeId(props.url)
    const vimeoId = getVimeoId(props.url)

    if (youtubeId) {
      containerRef.value.innerHTML = `<div data-plyr-provider="youtube" data-plyr-embed-id="${youtubeId}"></div>`
    }
    else if (vimeoId) {
      containerRef.value.innerHTML = `<div data-plyr-provider="vimeo" data-plyr-embed-id="${vimeoId}"></div>`
    }
    else {
      containerRef.value.innerHTML = `<video src="${props.url}" controls crossorigin playsinline></video>`
    }

    player = new Plyr(containerRef.value.firstElementChild as HTMLElement, {
      controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'fullscreen'],
    })

    player.on('timeupdate', () => {
      if (player) {
        currentTime.value = Math.floor(player.currentTime)
        emit('timeUpdate', currentTime.value)
        // Сохранить позицию (debounced)
        if (props.materialId && typeof localStorage !== 'undefined') {
          if (savePositionTimeout) clearTimeout(savePositionTimeout)
          savePositionTimeout = setTimeout(() => {
            localStorage.setItem(`${STORAGE_KEY}:${props.materialId}`, String(Math.floor(player!.currentTime)))
          }, 1000)
        }
      }
    })

    if (props.materialId && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}:${props.materialId}`)
      const seconds = saved ? parseInt(saved, 10) : 0
      if (!Number.isNaN(seconds) && seconds > 0) {
        const doSeek = () => {
          if (player) {
            player.currentTime = seconds
            currentTime.value = Math.floor(seconds)
          }
        }
        // ready — когда Plyr полностью инициализирован (YouTube/Vimeo/HTML5)
        player.on('ready', () => {
          emit('ready')
          doSeek()
        })
        // HTML5: loadedmetadata / canplay — дополнительно для seek
        player.on('loadedmetadata', doSeek)
        player.on('canplay', doSeek)
        // Embed может загружаться с задержкой — резервные попытки
        setTimeout(doSeek, 500)
        setTimeout(doSeek, 1500)
        setTimeout(doSeek, 3000)
      }
      else {
        player.on('ready', () => emit('ready'))
      }
    }
    else {
      player.on('ready', () => emit('ready'))
    }
  }
  catch (err) {
    console.error('[VideoPlayer] initPlayer error:', err)
  }
}

function getCurrentTime(): number {
  return player?.currentTime ? Math.floor(player.currentTime) : 0
}

function seekTo(seconds: number) {
  if (player) {
    player.currentTime = seconds
  }
}

onMounted(() => {
  nextTick(() => initPlayer())
})

onUnmounted(() => {
  if (savePositionTimeout) clearTimeout(savePositionTimeout)
  player?.destroy()
  player = null
})

defineExpose({ getCurrentTime, seekTo, currentTime })
</script>

<template>
  <div ref="containerRef" class="w-full aspect-video bg-black rounded-lg overflow-hidden" />
</template>

<style>
.plyr {
  --plyr-color-main: var(--color-primary-500);
}
</style>
