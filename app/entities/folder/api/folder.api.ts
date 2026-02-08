import type { Folder, CreateFolderDTO, UpdateFolderDTO } from '../model/types'

export const folderApi = {
  getTree() {
    return $fetch<Folder[]>('/api/folders')
  },

  create(data: CreateFolderDTO) {
    return $fetch<Folder>('/api/folders', {
      method: 'POST',
      body: data,
    })
  },

  update(id: string, data: UpdateFolderDTO) {
    return $fetch<Folder>(`/api/folders/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  remove(id: string) {
    return $fetch(`/api/folders/${id}`, { method: 'DELETE' })
  },
}
