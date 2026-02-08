export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const folderId = query.folderId as string | undefined
  const tagId = query.tagId as string | undefined

  const where: Record<string, unknown> = {}
  if (folderId) where.folderId = folderId
  if (tagId) where.tags = { some: { id: tagId } }

  const materials = await prisma.material.findMany({
    where,
    include: {
      folder: true,
      tags: true,
      _count: { select: { notes: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return materials
})
