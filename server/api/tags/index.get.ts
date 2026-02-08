export default defineEventHandler(async () => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { materials: true } },
    },
    orderBy: { name: 'asc' },
  })

  return tags
})
