export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  await prisma.material.delete({ where: { id } })

  return { success: true }
})
