export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.title || typeof body.title !== 'string') {
    throw createError({ statusCode: 400, message: 'Title is required' })
  }

  const material = await prisma.material.create({
    data: {
      title: body.title,
      type: body.type || 'OTHER',
      url: body.url || null,
      description: body.description || null,
      folderId: body.folderId || null,
      tags: body.tagIds?.length
        ? { connect: body.tagIds.map((id: string) => ({ id })) }
        : undefined,
    },
    include: { tags: true },
  })

  return material
})
