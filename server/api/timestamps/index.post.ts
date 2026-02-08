export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (typeof body.seconds !== 'number') {
    throw createError({ statusCode: 400, message: 'Seconds is required (number)' })
  }
  if (!body.label || typeof body.label !== 'string') {
    throw createError({ statusCode: 400, message: 'Label is required' })
  }
  if (!body.noteId || typeof body.noteId !== 'string') {
    throw createError({ statusCode: 400, message: 'Note ID is required' })
  }

  const timestamp = await prisma.timestamp.create({
    data: {
      seconds: body.seconds,
      label: body.label,
      noteId: body.noteId,
    },
  })

  return timestamp
})
