import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = new Hono().basePath('/api');

app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Example route for fetching stats
app.get('/stats', async (c) => {
    // In a real app we'd verify the NextAuth session here

    try {
        const studentCount = await prisma.user.count({ where: { role: 'STUDENT', isDeleted: false } });
        const facultyCount = await prisma.user.count({ where: { role: 'FACULTY', isDeleted: false } });

        return c.json({
            students: studentCount,
            faculty: facultyCount,
            revenue: 1200000 // mock
        });
    } catch (err) {
        return c.json({ error: 'Database not initialized yet' }, 500);
    }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
