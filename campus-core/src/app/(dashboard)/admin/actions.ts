'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addTimeTableEntry(formData: FormData) {
    const session = await auth();
    console.log("Adding TimeTable - Session Auth Check:", { id: session?.user?.id, role: session?.user?.role });
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        console.error("Unauthorized: Role or ID mismatch");
        throw new Error('Unauthorized - Admin access required');
    }

    const course = formData.get('course') as string;
    const room = formData.get('room') as string;
    const dayOfWeek = formData.get('dayOfWeek') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const className = formData.get('className') as string;
    const facultyId = formData.get('facultyId') as string; // Ensure we get this from a dropdown or input

    if (!course || !room || !dayOfWeek || !startTime || !endTime || !facultyId) {
        throw new Error('Missing required fields');
    }

    try {
        await prisma.timeTable.create({
            data: {
                course,
                room,
                dayOfWeek,
                startTime,
                endTime,
                className: className || null,
                facultyId: facultyId
            }
        });
        console.log("SUCCESS: TimeTable entry created in DB");
    } catch (error) {
        console.error("ERROR: Failed to create TimeTable entry:", error);
        throw error;
    }

    revalidatePath('/admin');
    revalidatePath('/student');
    revalidatePath('/faculty');
}

export async function deleteTimeTableEntry(id: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    await prisma.timeTable.delete({
        where: { id }
    });

    revalidatePath('/admin');
    revalidatePath('/student');
    revalidatePath('/faculty');
}

export async function sendNotice(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }
    
    const message = formData.get('message') as string;
    if (!message) throw new Error('Notice message is required');

    try {
        const createdNotice = await prisma.notice.create({
            data: {
                message,
                authorId: session.user.id
            }
        });
        console.log("SUCCESS: Notice created in DB:", createdNotice.id);
    } catch (error) {
        console.error("ERROR: Failed to create Notice In DB:", error);
        throw error;
    }

    revalidatePath('/admin');
    revalidatePath('/student');
    revalidatePath('/faculty');
}

export async function deleteNotice(id: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    await prisma.notice.delete({
        where: { id }
    });

    revalidatePath('/admin');
    revalidatePath('/student');
    revalidatePath('/faculty');
}

export async function createUser(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as any;
    const dateOfBirth = formData.get('dateOfBirth') as string; // YYYY-MM-DD
    const rollNumber = formData.get('rollNumber') as string;
    const employeeId = formData.get('employeeId') as string;
    const ageInput = formData.get('age') as string;
    const age = ageInput ? parseInt(ageInput) : null;
    const height = (formData.get('height') as string) || null;
    const course = (formData.get('course') as string) || null;

    if (!name || !email || !role || !dateOfBirth) {
        throw new Error('Missing basic required fields');
    }

    // Logic: Password = LastName + DDMMYYYY
    const nameParts = name.trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
    
    // Format DOB: YYYY-MM-DD -> DDMMYYYY
    const [year, month, day] = dateOfBirth.split('-');
    const formattedDOB = `${day}${month}${year}`;
    const initialPassword = `${lastName}${formattedDOB}`;

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: initialPassword, // Stored as per user request (plain text mock flow)
                role,
                rollNumber: rollNumber || null,
                employeeId: employeeId || null,
                dateOfBirth: new Date(dateOfBirth),
                profile: {
                    create: {
                        age: isNaN(age!) ? null : age,
                        height: height,
                        course: course
                    }
                }
            }
        });
        console.log(`SUCCESS: User ${name} created with password ${initialPassword}`);
    } catch (error) {
        console.error("ERROR: Failed to create user:", error);
        throw error;
    }

    revalidatePath('/admin');
}

export async function deleteUser(id: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    // Note: This will also delete the Profile due to onDelete: Cascade in schema
    await prisma.user.delete({
        where: { id }
    });

    revalidatePath('/admin');
}
