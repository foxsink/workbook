import type { Timestamp } from '~/entities/note'

export function useTimestamps() {
  async function createTimestamp(noteId: string, seconds: number, label: string) {
    return await $fetch<Timestamp>('/api/timestamps', {
      method: 'POST',
      body: { noteId, seconds, label },
    })
  }

  async function deleteTimestamp(id: string) {
    await $fetch(`/api/timestamps/${id}`, { method: 'DELETE' })
  }

  return { createTimestamp, deleteTimestamp }
}
