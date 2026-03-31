import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding CampusCore Database...");

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@campuscore.com' },
        update: {},
        create: {
            email: 'admin@campuscore.com',
            name: 'Admin User',
            role: Role.ADMIN,
            password: 'hashedpasswordisnotcheckedrightnow' // In production, hash this!
        }
    });

    // Create Faculty User
    const faculty = await prisma.user.upsert({
        where: { email: 'faculty@campuscore.com' },
        update: {},
        create: {
            email: 'faculty@campuscore.com',
            name: 'Faculty User',
            role: Role.FACULTY,
            password: 'hashedpasswordisnotcheckedrightnow'
        }
    });

    // Create Student User
    const student = await prisma.user.upsert({
        where: { email: 'student@campuscore.com' },
        update: {},
        create: {
            email: 'student@campuscore.com',
            name: 'Student User',
            role: Role.STUDENT,
            password: 'hashedpasswordisnotcheckedrightnow'
        }
    });

    console.log("Database seeded successfully with users:");
    console.log({ admin: admin.id, faculty: faculty.id, student: student.id });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
