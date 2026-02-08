import { folderApi } from '~/entities/folder'
import type { Folder } from '~/entities/folder'

export function useFolders() {
  const folders = ref<Folder[]>([])
  const isLoading = ref(false)

  async function fetchFolders() {
    isLoading.value = true
    try {
      folders.value = await folderApi.getTree()
    }
    finally {
      isLoading.value = false
    }
  }

  async function createFolder(name: string, parentId?: string | null) {
    await folderApi.create({ name, parentId })
    await fetchFolders()
  }

  async function renameFolder(id: string, name: string) {
    await folderApi.update(id, { name })
    await fetchFolders()
  }

  async function deleteFolder(id: string) {
    await folderApi.remove(id)
    await fetchFolders()
  }

  return { folders, isLoading, fetchFolders, createFolder, renameFolder, deleteFolder }
}
