import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function StudentDashboard() {
    const session = await auth();

    // Fetch user profile, timetable and notices
    let userProfile: any = null;
    let todaySchedule: any[] = [];
    let recentNotices: any[] = [];

    try {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = daysOfWeek[new Date().getDay()];

        const [p, schedule, notices] = await Promise.all([
            prisma.user.findUnique({
                where: { id: session?.user?.id },
                include: { profile: true }
            }),
            prisma.timeTable.findMany({
                where: { dayOfWeek: currentDay },
                include: { faculty: true },
                orderBy: { startTime: 'asc' }
            }),
            prisma.notice.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ]);
        userProfile = p;
        todaySchedule = schedule;
        recentNotices = notices;
    } catch (e) {
         console.error("Database connection failed", e);
    }

    return (
        <div className="space-y-6">
            <header className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Student Space</h1>
                <p className="text-sm text-slate-500 italic">Welcome back, {userProfile?.name || 'Student'}. Check your daily tasks and schedule.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    
                    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm ring-1 ring-slate-900/5">
                        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3 mb-5 flex items-center gap-2">
                            <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                            Today's Schedule
                        </h2>
                        <div className="overflow-x-auto text-sm">
                            {todaySchedule.length === 0 ? (
                                <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                    No classes scheduled for today.
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-2 uppercase text-[10px]">Course</th>
                                            <th className="px-4 py-2 uppercase text-[10px]">Time</th>
                                            <th className="px-4 py-2 uppercase text-[10px]">Room</th>
                                            <th className="px-4 py-2 uppercase text-[10px]">Faculty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 italic">
                                        {todaySchedule.map((cls, i) => (
                                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-4 py-4">
                                                    <span className="font-bold text-slate-900">{cls.course}</span>
                                                    {cls.className && <span className="ml-2 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">{cls.className}</span>}
                                                </td>
                                                <td className="px-4 py-4 text-indigo-700 font-bold font-mono tracking-tighter">{cls.startTime} - {cls.endTime}</td>
                                                <td className="px-4 py-4 text-slate-700 font-medium">{cls.room}</td>
                                                <td className="px-4 py-4 text-slate-500 text-xs">Prof. {cls.faculty?.name || 'TBA'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-shadow">
                            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">My Attendance</h3>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-slate-900 tracking-tighter">85%</p>
                                <span className="text-emerald-500 font-bold text-xs">↑ 2.4%</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Status: Good standing</p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-shadow">
                            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Academic GPA</h3>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-slate-900 tracking-tighter">3.82</p>
                                <span className="text-slate-400 font-bold text-[10px] tracking-tighter">/ 4.0</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Status: Dean's List</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar area inside grid */}
                <div className="space-y-6">
                    {/* NEW Profile Card */}
                    <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xl ring-1 ring-slate-900/10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-indigo-500/30 transition-all duration-500"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                            Official Profile
                        </h3>
                        <div className="space-y-3 relative z-10">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Roll Number</p>
                                <p className="text-lg font-black tracking-widest font-mono text-indigo-100">{userProfile?.rollNumber || 'NOT SET'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Age</p>
                                    <p className="text-sm font-bold">{userProfile?.profile?.age || '--'} yrs</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Height</p>
                                    <p className="text-sm font-bold">{userProfile?.profile?.height || '--'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Major Course</p>
                                <p className="text-sm font-bold text-slate-200">{userProfile?.profile?.course || 'Not Enrolled'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 shadow-sm ring-1 ring-amber-900/5">
                        <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-4 flex justify-between items-center">
                            Recent Notices
                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                        </h3>
                        <div className="space-y-3">
                            {recentNotices.length === 0 ? (
                                <p className="text-xs text-amber-800 opacity-60 italic text-center py-4">No recent notices.</p>
                            ) : (
                                recentNotices.map(notice => (
                                    <div key={notice.id} className="bg-white p-3 rounded-lg border border-amber-100/50 shadow-sm text-sm text-slate-700 hover:scale-[1.02] transition-transform">
                                        <span className="font-bold text-amber-700 text-[10px] uppercase block mb-1">
                                            {new Date(notice.createdAt).toLocaleDateString()}
                                        </span>
                                        {notice.message}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm ring-1 ring-slate-900/5">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Actions</h3>
                        <ul className="space-y-2 text-xs font-bold">
                            <li className="flex items-center gap-2 group cursor-pointer hover:bg-slate-50 p-2 rounded -mx-2 transition-colors">
                            <svg className="text-slate-400 group-hover:text-indigo-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                <span className="text-slate-600 group-hover:text-slate-900">Download Fee Receipt</span></li>
                            <li className="flex items-center gap-2 group cursor-pointer hover:bg-slate-50 p-2 rounded -mx-2 transition-colors">
                                <svg className="text-slate-400 group-hover:text-indigo-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                <span className="text-slate-600 group-hover:text-slate-900">Request Transcript</span></li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
