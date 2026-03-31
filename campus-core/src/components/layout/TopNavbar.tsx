import { auth } from '@/auth';
import Link from 'next/link';
import SignOutButton from './SignOutButton';

export default async function TopNavbar() {
    const session = await auth();

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-slate-800 tracking-tight">CampusCore ERP</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm">
                            <span className="text-slate-500 mr-2">Logged in as:</span>
                            <span className="font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
                                {session?.user?.name || session?.user?.role || 'Guest'}
                            </span>
                        </div>
                        <SignOutButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}
