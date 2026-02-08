export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  const material = await prisma.material.findUnique({
    where: { id },
    include: {
      folder: true,
      tags: true,
      notes: {
        include: {
          timestamps: { orderBy: { seconds: 'asc' } },
        },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  if (!material) {
    throw createError({ statusCode: 404, message: 'Material not found' })
  }

  return material
})
