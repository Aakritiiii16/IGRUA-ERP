import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany()
    console.log('Successfully connected to the database!')
    console.log(`Found ${users.length} users.`)
    if (users.length > 0) {
      console.log('User emails:', users.map(u => u.email).join(', '))
    }
  } catch (error) {
    console.error('Failed to connect to the database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
