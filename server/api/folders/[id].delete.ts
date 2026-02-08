export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  await prisma.folder.delete({ where: { id } })

  return { success: true }
})
