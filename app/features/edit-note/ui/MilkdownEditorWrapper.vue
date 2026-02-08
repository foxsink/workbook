<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue'
import MilkdownEditor from './MilkdownEditor.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<InstanceType<typeof MilkdownEditor> | null>(null)

function insertAtCursor(text: string) {
  editorRef.value?.insertAtCursor(text)
}

function focusAtEnd() {
  editorRef.value?.focusAtEnd()
}

defineExpose({ insertAtCursor, focusAtEnd })
</script>

<template>
  <MilkdownProvider>
    <MilkdownEditor
      ref="editorRef"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </MilkdownProvider>
</template>
