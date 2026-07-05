const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function run() {
  const t = await prisma.tournament.findFirst({include: {format: true}})
  console.log(JSON.stringify(t.format, null, 2))
}
run().finally(() => prisma.$disconnect())
