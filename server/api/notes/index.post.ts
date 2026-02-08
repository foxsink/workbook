export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.title || typeof body.title !== 'string') {
    throw createError({ statusCode: 400, message: 'Title is required' })
  }
  if (!body.materialId || typeof body.materialId !== 'string') {
    throw createError({ statusCode: 400, message: 'Material ID is required' })
  }

  const note = await prisma.note.create({
    data: {
      title: body.title,
      content: body.content || '',
      materialId: body.materialId,
    },
  })

  return note
})
