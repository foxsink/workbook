export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title
  if (body.type !== undefined) data.type = body.type
  if (body.url !== undefined) data.url = body.url
  if (body.description !== undefined) data.description = body.description
  if (body.folderId !== undefined) data.folderId = body.folderId

  // Replace tags: disconnect all, then connect new ones
  if (body.tagIds !== undefined) {
    data.tags = {
      set: body.tagIds.map((tagId: string) => ({ id: tagId })),
    }
  }

  const material = await prisma.material.update({
    where: { id },
    data,
    include: { tags: true },
  })

  return material
})
