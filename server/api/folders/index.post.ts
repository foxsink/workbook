export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name || typeof body.name !== 'string') {
    throw createError({ statusCode: 400, message: 'Folder name is required' })
  }

  const folder = await prisma.folder.create({
    data: {
      name: body.name,
      parentId: body.parentId || null,
    },
  })

  return folder
})
