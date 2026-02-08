import { materialApi } from '~/entities/material'
import type { CreateMaterialDTO, MaterialType } from '~/entities/material'

export function useCreateMaterial(onSuccess?: () => void) {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const form = reactive<CreateMaterialDTO>({
    title: '',
    type: 'OTHER' as MaterialType,
    url: '',
    description: '',
    folderId: null,
    tagIds: [],
  })

  const typeOptions = [
    { label: 'Видео', value: 'VIDEO' },
    { label: 'Статья', value: 'ARTICLE' },
    { label: 'PDF', value: 'PDF' },
    { label: 'Другое', value: 'OTHER' },
  ]

  async function submit() {
    if (!form.title.trim()) {
      error.value = 'Введите название'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      await materialApi.create({
        title: form.title.trim(),
        type: form.type,
        url: form.url?.trim() || undefined,
        description: form.description?.trim() || undefined,
        folderId: form.folderId,
        tagIds: form.tagIds?.length ? form.tagIds : undefined,
      })

      // Reset form
      form.title = ''
      form.type = 'OTHER'
      form.url = ''
      form.description = ''
      form.folderId = null
      form.tagIds = []

      onSuccess?.()
    }
    catch (e: any) {
      error.value = e?.data?.message || 'Не удалось создать материал'
    }
    finally {
      isLoading.value = false
    }
  }

  return { form, typeOptions, isLoading, error, submit }
}
