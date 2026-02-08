export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  await prisma.tag.delete({ where: { id } })

  return { success: true }
})
