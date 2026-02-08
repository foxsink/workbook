export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    throw createError({ statusCode: 400, message: 'Tag name is required' })
  }

  const name = body.name.trim()

  // Check if tag already exists (return existing one)
  const existing = await prisma.tag.findUnique({ where: { name } })
  if (existing) return existing

  const tag = await prisma.tag.create({
    data: {
      name,
      color: body.color || '#6366f1',
    },
  })

  return tag
})
