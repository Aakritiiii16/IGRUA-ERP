'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function submitAttendanceRequest(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
        throw new Error('Unauthorized');
    }
    
    // For a real system you'd link to a specific Attendance record ID
    // We will just simulate a submission or you can expand this later.
    const reason = formData.get('reason') as string;
    const date = formData.get('date') as string;
    
    console.log(`Attendance correction requested by ${session.user.id} for date ${date}. Reason: ${reason}`);
    
    // Mocking success behavior
    revalidatePath('/student');
}

export async function uploadDocument(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
        throw new Error('Unauthorized');
    }

    const file = formData.get('document') as File;
    const type = formData.get('type') as string;
    
    if (file && file.size > 0) {
        await prisma.document.create({
            data: {
                userId: session.user.id,
                title: file.name,
                url: `/mock-uploads/${file.name}`, // In a real app, upload to S3/Cloudinary
                type: type || 'ID',
            }
        });
        console.log(`Document ${file.name} uploaded.`);
    }

    revalidatePath('/student');
}
