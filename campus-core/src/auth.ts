import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    // adapter: PrismaAdapter(prisma), // Enable this once we seed the DB properly
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Sync Auth with newly seeded DB users
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user) {
                    console.log("Auth Error: User not found", credentials.email);
                    return null;
                }

                // Verify password directly from DB (Plain text login for development as per user request)
                // In production, use bcrypt.compare(credentials.password, user.password)
                const isPasswordValid = credentials.password === user.password;

                if (isPasswordValid) {
                    console.log("Auth Success:", user.email, "Role:", user.role);
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };
                }

                console.log("Auth Error: Password mismatch for", user.email);
                return null;
            },
        }),
    ],
});
