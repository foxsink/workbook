import type { Material, CreateMaterialDTO, UpdateMaterialDTO } from '../model/types'

export const materialApi = {
  getAll(folderId?: string, tagId?: string) {
    const params = new URLSearchParams()
    if (folderId) params.set('folderId', folderId)
    if (tagId) params.set('tagId', tagId)
    const query = params.toString() ? `?${params.toString()}` : ''
    return $fetch<Material[]>(`/api/materials${query}`)
  },

  getById(id: string) {
    return $fetch<Material>(`/api/materials/${id}`)
  },

  create(data: CreateMaterialDTO) {
    return $fetch<Material>('/api/materials', {
      method: 'POST',
      body: data,
    })
  },

  update(id: string, data: UpdateMaterialDTO) {
    return $fetch<Material>(`/api/materials/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  remove(id: string) {
    return $fetch(`/api/materials/${id}`, { method: 'DELETE' })
  },
}
