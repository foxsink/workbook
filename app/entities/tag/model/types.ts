export interface Tag {
  id: string
  name: string
  color: string
  _count?: { materials: number }
}

export interface CreateTagDTO {
  name: string
  color?: string
}

export interface UpdateTagDTO {
  name?: string
  color?: string
}
