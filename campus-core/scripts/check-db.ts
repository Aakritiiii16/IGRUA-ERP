import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("--- SYSTEM USERS ---")
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  })
  console.table(users)

  console.log("\n--- RECENT NOTICES ---")
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } }
  })
  console.table(notices.map(n => ({
    id: n.id,
    message: n.message.substring(0, 50),
    author: n.author?.name || 'Unknown',
    createdAt: n.createdAt.toLocaleString()
  })))
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
