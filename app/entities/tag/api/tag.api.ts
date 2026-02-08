import type { Tag, CreateTagDTO, UpdateTagDTO } from '../model/types'

export const tagApi = {
  getAll() {
    return $fetch<Tag[]>('/api/tags')
  },

  create(data: CreateTagDTO) {
    return $fetch<Tag>('/api/tags', {
      method: 'POST',
      body: data,
    })
  },

  update(id: string, data: UpdateTagDTO) {
    return $fetch<Tag>(`/api/tags/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  remove(id: string) {
    return $fetch(`/api/tags/${id}`, { method: 'DELETE' })
  },
}
