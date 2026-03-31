import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@campuscore.com'
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!admin) {
    console.error("Admin user not found in DB. Please seed first.")
    return
  }

  console.log("Attempting to create a manual notice for Admin:", admin.id)

  try {
    const notice = await prisma.notice.create({
      data: {
        message: "This is a manual test notice to verify DB connectivity.",
        authorId: admin.id
      }
    })
    console.log("SUCCESS: Manual notice created with ID:", notice.id)
  } catch (err) {
    console.error("FAILURE: Could not create notice:", err)
  }
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
