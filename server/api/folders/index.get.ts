export default defineEventHandler(async () => {
  const folders = await prisma.folder.findMany({
    include: {
      children: {
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { materials: true } },
    },
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
  })

  return folders
})
