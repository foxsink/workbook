export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const folder = await prisma.folder.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.parentId !== undefined && { parentId: body.parentId }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
  })

  return folder
})
