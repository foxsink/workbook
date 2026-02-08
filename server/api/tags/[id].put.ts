export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name.trim()
  if (body.color !== undefined) data.color = body.color

  const tag = await prisma.tag.update({
    where: { id },
    data,
  })

  return tag
})
