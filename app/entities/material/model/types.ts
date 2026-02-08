export type MaterialType = 'VIDEO' | 'ARTICLE' | 'PDF' | 'OTHER'

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Material {
  id: string
  title: string
  type: MaterialType
  url: string | null
  description: string | null
  folderId: string | null
  createdAt: string
  updatedAt: string
  folder?: Folder | null
  notes?: Note[]
  tags?: Tag[]
  _count?: { notes: number }
}

export interface Folder {
  id: string
  name: string
  sortOrder: number
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  materialId: string
  createdAt: string
  updatedAt: string
  timestamps?: Timestamp[]
}

export interface Timestamp {
  id: string
  seconds: number
  label: string
  noteId: string
}

export interface CreateMaterialDTO {
  title: string
  type?: MaterialType
  url?: string
  description?: string
  folderId?: string | null
  tagIds?: string[]
}

export interface UpdateMaterialDTO {
  title?: string
  type?: MaterialType
  url?: string | null
  description?: string | null
  folderId?: string | null
  tagIds?: string[]
}
