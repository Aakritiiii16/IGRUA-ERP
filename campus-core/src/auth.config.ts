import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = auth?.user?.role?.toUpperCase();

            const isProtectedRoute = nextUrl.pathname.startsWith('/admin') ||
                                     nextUrl.pathname.startsWith('/faculty') ||
                                     nextUrl.pathname.startsWith('/student');

            if (isProtectedRoute) {
                if (!isLoggedIn) return false;

                // Role-based Access Control Enforcement
                if (nextUrl.pathname.startsWith('/admin') && userRole !== 'ADMIN') {
                    return Response.redirect(new URL(`/${userRole?.toLowerCase() || 'login'}`, nextUrl));
                }
                if (nextUrl.pathname.startsWith('/faculty') && userRole !== 'FACULTY') {
                    return Response.redirect(new URL(`/${userRole?.toLowerCase() || 'login'}`, nextUrl));
                }
                if (nextUrl.pathname.startsWith('/student') && userRole !== 'STUDENT') {
                    return Response.redirect(new URL(`/${userRole?.toLowerCase() || 'login'}`, nextUrl));
                }

                return true;
            }

            // If logged in and on the login page or root, redirect to their dashboard
            if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/')) {
                const role = userRole || 'STUDENT';
                return Response.redirect(new URL(`/${role.toLowerCase()}`, nextUrl));
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.id = (token.id as string) || token.sub || '';
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
