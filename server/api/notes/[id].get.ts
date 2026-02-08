export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      timestamps: { orderBy: { seconds: 'asc' } },
      material: true,
    },
  })

  if (!note) {
    throw createError({ statusCode: 404, message: 'Note not found' })
  }

  return note
})
