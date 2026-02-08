<script setup lang="ts">
import { Editor, rootCtx, defaultValueCtx, editorViewCtx } from '@milkdown/kit/core'
import { TextSelection } from '@milkdown/kit/prose/state'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { history } from '@milkdown/kit/plugin/history'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { Milkdown, useEditor } from '@milkdown/vue'
import { nord } from '@milkdown/theme-nord'
import { timestampDecorationPlugin } from './timestampDecorationPlugin'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorInfo = useEditor((root) =>
  Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, props.modelValue)
      ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
        emit('update:modelValue', markdown)
      })
    })
    .config(nord)
    .use(commonmark)
    .use(history)
    .use(listener)
    .use(timestampDecorationPlugin),
)

/**
 * Insert text at the current cursor position (в текущую строку, не на новую).
 * Used by parent components to insert timestamps via Ctrl+Shift+~.
 */
function insertAtCursor(text: string) {
  const editor = editorInfo.get()
  if (!editor) return

  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx)
    const { state } = view
    const { from } = state.selection
    const $from = state.doc.resolve(from)

    // Если курсор в начале пустого/whitespace параграфа — вставляем в конец предыдущего (не на новую строку)
    let insertPos = from
    const isEmptyBlock = !$from.parent.textContent || !$from.parent.textContent.trim()
    if ($from.parentOffset === 0 && isEmptyBlock) {
      const beforeCurrent = $from.before($from.depth)
      if (beforeCurrent > 0) insertPos = beforeCurrent
    }
    // Не вставлять до начала первого блока (position 0)
    insertPos = Math.max(1, insertPos)

    const tr = state.tr.insertText(text, insertPos)
    view.dispatch(tr)
    view.focus()
  })
}

/** Фокус редактора и курсор в конец (для клика по пустой области) */
function focusAtEnd() {
  const editor = editorInfo.get()
  if (!editor) return

  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx)
    const { state } = view
    const end = state.doc.content.size
    const tr = state.tr.setSelection(TextSelection.create(state.doc, end))
    view.dispatch(tr)
    view.focus()
  })
}

defineExpose({ insertAtCursor, focusAtEnd })
</script>

<template>
  <Milkdown />
</template>

<style>
@reference "../../../assets/css/main.css";

.milkdown {
  @apply min-h-[max(300px,100%)] p-4 cursor-text;
}

.milkdown .editor {
  @apply outline-none;
}

.milkdown h1 {
  @apply text-2xl font-bold mt-6 mb-3;
}

.milkdown h2 {
  @apply text-xl font-semibold mt-5 mb-2;
}

.milkdown h3 {
  @apply text-lg font-medium mt-4 mb-2;
}

.milkdown p {
  @apply mb-2 leading-relaxed;
}

.milkdown ul, .milkdown ol {
  @apply pl-6 mb-2;
}

.milkdown li {
  @apply mb-1;
}

.milkdown ul li {
  @apply list-disc;
}

.milkdown ol li {
  @apply list-decimal;
}

.milkdown code {
  @apply bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono;
}

.milkdown pre {
  @apply bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-3 overflow-x-auto;
}

.milkdown pre code {
  @apply bg-transparent p-0;
}

.milkdown blockquote {
  @apply border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 mb-3;
}

.milkdown hr {
  @apply my-6 border-gray-200 dark:border-gray-700;
}

.milkdown a {
  @apply text-primary-500 hover:underline;
}

.milkdown strong {
  @apply font-bold;
}

.milkdown em {
  @apply italic;
}

/* Timestamp chip decoration */
.milkdown .timestamp-chip {
  @apply inline-flex items-center px-2 py-0.5 rounded-full
         bg-primary-100 dark:bg-primary-900
         text-primary-700 dark:text-primary-300
         text-xs font-mono
         hover:bg-primary-200 dark:hover:bg-primary-800
         transition-colors cursor-pointer;
}
</style>
