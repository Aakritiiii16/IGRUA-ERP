import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function FacultyDashboard() {
    const session = await auth();

    // Fetch faculty profile and their classes
    let facultyProfile: any = null;
    let myClasses: any[] = [];

    try {
        const [p, classes] = await Promise.all([
            prisma.user.findUnique({
                where: { id: session?.user?.id },
                include: { profile: true }
            }),
            prisma.timeTable.findMany({
                where: { facultyId: session?.user?.id },
                orderBy: [
                    { dayOfWeek: 'asc' },
                    { startTime: 'asc' }
                ]
            })
        ]);
        facultyProfile = p;
        myClasses = classes;
    } catch (e) {
        console.error("Database connection failed", e);
    }

    return (
        <div className="space-y-6">
            <header className="border-b border-slate-200 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Faculty Portal</h1>
                    <p className="text-sm text-slate-500 italic">Welcome back, Prof. {facultyProfile?.name || 'Faculty'}.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</p>
                    <p className="text-sm font-mono font-bold text-slate-700 tracking-wider bg-slate-100 px-2 py-0.5 rounded leading-none">{facultyProfile?.employeeId || '---'}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profile & Info Sidebar */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl ring-1 ring-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl -mr-20 -mt-20 rounded-full group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                            Faculty Profile
                        </h3>
                        <div className="space-y-5 relative z-10">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl font-black text-emerald-400">
                                    {facultyProfile?.name?.charAt(0) || 'F'}
                                </div>
                                <div>
                                    <p className="font-bold text-lg leading-tight">{facultyProfile?.name}</p>
                                    <p className="text-xs text-slate-400">{facultyProfile?.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Department</p>
                                    <p className="text-xs font-bold text-slate-200">{facultyProfile?.profile?.course || 'General'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Office Hours</p>
                                    <p className="text-xs font-bold text-slate-200">2pm - 4pm</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm ring-1 ring-slate-900/5">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Statistics</h3>
                        <div className="space-y-4 text-xs font-bold text-slate-600">
                            <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-slate-400 uppercase tracking-tighter">Classes Tagged</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-900">{myClasses.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-slate-400 uppercase tracking-tighter">Avg Attendance</span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">92%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Schedule Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 min-h-[400px]">
                        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-slate-900 rounded-full"></div>
                            My Academic Schedule
                        </h2>
                        
                        {myClasses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <p className="font-bold text-sm">No classes assigned yet.</p>
                                <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-60">Contact Admin for tagging</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {myClasses.map((cls) => (
                                    <div key={cls.id} className="group p-4 border border-slate-100 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-300 relative bg-slate-50/30">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight">{cls.course}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                                        {cls.className || 'All Batches'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                        {cls.startTime} - {cls.endTime}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                                <div className="bg-slate-900 text-white font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    {cls.dayOfWeek}
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">Room: <span className="text-slate-900 underline decoration-slate-200">{cls.room}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

