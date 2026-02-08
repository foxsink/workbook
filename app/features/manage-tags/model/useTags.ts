import { tagApi } from '~/entities/tag'
import type { Tag } from '~/entities/tag'

export function useTags() {
  const tags = ref<Tag[]>([])
  const isLoading = ref(false)

  async function fetchTags() {
    isLoading.value = true
    try {
      tags.value = await tagApi.getAll()
    }
    finally {
      isLoading.value = false
    }
  }

  async function createTag(name: string, color?: string): Promise<Tag> {
    const tag = await tagApi.create({ name, color })
    // Add to local list if not present
    if (!tags.value.find(t => t.id === tag.id)) {
      tags.value.push(tag)
    }
    return tag
  }

  async function removeTag(id: string) {
    await tagApi.remove(id)
    tags.value = tags.value.filter(t => t.id !== id)
  }

  return {
    tags,
    isLoading,
    fetchTags,
    createTag,
    removeTag,
  }
}
