'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(loginAction, undefined);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/demo/image/upload/v1652345678/abstract-bg.jpg')] bg-cover opacity-[0.03]"></div>

            <div className="relative z-10 w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-xl shadow-slate-200/50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">CampusCore ERP</h1>
                    <p className="text-slate-500">Sign in to access your dashboard</p>
                </div>

                {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                        {errorMessage}
                    </div>
                )}

                <form action={formAction} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="e.g. admin@campuscore.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50"
                    >
                        {isPending ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-500">
                        Mock Accounts:<br />
                        admin@campuscore.com / admin<br />
                        faculty@campuscore.com / faculty<br />
                        student@campuscore.com / student
                    </p>
                </div>
            </div>
        </div>
    );
}
