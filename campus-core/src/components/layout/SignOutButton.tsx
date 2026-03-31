'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
    return (
        <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors border border-slate-200 hover:border-red-200 bg-slate-50 hover:bg-red-50 px-3 py-1.5 rounded-md"
        >
            Sign Out
        </button>
    );
}
