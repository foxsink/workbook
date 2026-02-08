export interface Folder {
  id: string
  name: string
  sortOrder: number
  parentId: string | null
  createdAt: string
  updatedAt: string
  children?: Folder[]
  _count?: { materials: number }
}

export interface CreateFolderDTO {
  name: string
  parentId?: string | null
}

export interface UpdateFolderDTO {
  name?: string
  parentId?: string | null
  sortOrder?: number
}
