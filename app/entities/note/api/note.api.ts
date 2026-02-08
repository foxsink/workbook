import type { Note, CreateNoteDTO, UpdateNoteDTO } from '../model/types'

export const noteApi = {
  getById(id: string) {
    return $fetch<Note>(`/api/notes/${id}`)
  },

  create(data: CreateNoteDTO) {
    return $fetch<Note>('/api/notes', {
      method: 'POST',
      body: data,
    })
  },

  update(id: string, data: UpdateNoteDTO) {
    return $fetch<Note>(`/api/notes/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  remove(id: string) {
    return $fetch(`/api/notes/${id}`, { method: 'DELETE' })
  },
}
