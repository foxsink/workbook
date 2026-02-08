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

export interface CreateNoteDTO {
  title: string
  materialId: string
  content?: string
}

export interface UpdateNoteDTO {
  title?: string
  content?: string
}
