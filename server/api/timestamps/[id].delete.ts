export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  await prisma.timestamp.delete({ where: { id } })

  return { success: true }
})
