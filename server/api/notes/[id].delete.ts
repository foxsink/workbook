export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  await prisma.note.delete({ where: { id } })

  return { success: true }
})
