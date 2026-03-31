import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { addTimeTableEntry, deleteTimeTableEntry, sendNotice, createUser, deleteUser, deleteNotice } from './actions';

export default async function AdminDashboard() {
    const session = await auth();

    // Fetch all context data for Admin View
    let timeTables: any[] = [];
    let facultyMembers: any[] = [];
    let students: any[] = [];
    let notices: any[] = [];

    try {
        [timeTables, facultyMembers, students, notices] = await Promise.all([
            prisma.timeTable.findMany({
                orderBy: [
                    { dayOfWeek: 'asc' },
                    { startTime: 'asc' }
                ],
                include: { faculty: true }
            }),
            prisma.user.findMany({
                where: { role: 'FACULTY' },
                include: { profile: true }
            }),
            prisma.user.findMany({
                where: { role: 'STUDENT' },
                include: { profile: true }
            }),
            prisma.notice.findMany({
                orderBy: { createdAt: 'desc' }
            })
        ]);
    } catch (e) {
        console.error("Database connection failed", e);
    }

    return (
        <div className="space-y-6">
            <header className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-800">Administrator Console</h1>
                <p className="text-sm text-slate-500">Manage institution schedules, notices, and core settings.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Management Section */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm lg:col-span-2">
                    <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">User Management</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Add User Form */}
                        <div className="md:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700 mb-3">Add New User</h3>
                            <form action={createUser} className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                                    <input name="name" type="text" required placeholder="John Sharma" className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email</label>
                                    <input name="email" type="email" required placeholder="john@campus.edu" className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Role</label>
                                        <select name="role" required className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none bg-white font-medium">
                                            <option value="STUDENT">Student</option>
                                            <option value="FACULTY">Faculty</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">DOB</label>
                                        <input name="dateOfBirth" type="date" required className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none bg-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Roll/Emp ID</label>
                                        <input name="rollNumber" type="text" placeholder="Roll No (Student)" className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none" />
                                        <input name="employeeId" type="text" placeholder="Emp ID (Faculty)" className="mt-1 w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Profile Data</label>
                                        <input name="age" type="number" placeholder="Age" className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none" />
                                        <input name="height" type="text" placeholder="Height (e.g. 175cm)" className="mt-1 w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Course</label>
                                    <input name="course" type="text" placeholder="Course Major" className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none" />
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded transition-colors tracking-wide">
                                    CREATE ACCOUNT
                                </button>
                                <p className="text-[10px] text-slate-400 italic text-center">Password will be generated as LastName + DDMMYYYY</p>
                            </form>
                        </div>

                        {/* User List */}
                        <div className="md:col-span-2 overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2 text-[10px] uppercase">Name</th>
                                        <th className="px-4 py-2 text-[10px] uppercase">Role</th>
                                        <th className="px-4 py-2 text-[10px] uppercase">Roll/Emp ID</th>
                                        <th className="px-4 py-2 text-[10px] uppercase">Course</th>
                                        <th className="px-4 py-2 text-[10px] uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...facultyMembers, ...students].map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 group">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-800">{user.name}</div>
                                                <div className="text-[10px] text-slate-400">{user.email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.role === 'STUDENT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                                                {user.rollNumber || user.employeeId || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{user.profile?.course || 'N/A'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <form action={async () => {
                                                    'use server';
                                                    await deleteUser(user.id);
                                                }}>
                                                    <button type="submit" className="text-red-500 hover:text-red-700 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">REMOVE</button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Timetable Form */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">Create TimeTable Entry</h2>
                    <form action={addTimeTableEntry} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Course Name</label>
                                <input name="course" type="text" required placeholder="CS101" className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Room</label>
                                <input name="room" type="text" required placeholder="Lab 3" className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Day</label>
                                <select name="dayOfWeek" className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none bg-white">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Class/Cohort</label>
                                <input name="className" type="text" placeholder="Year 1" className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Faculty</label>
                                <select name="facultyId" required className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none bg-white">
                                    <option value="">Select Faculty</option>
                                    {facultyMembers.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Start</label>
                                <input name="startTime" type="time" required className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">End</label>
                                <input name="endTime" type="time" required className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none bg-white" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-md transition-colors mt-2 text-sm">
                            Add Entry
                        </button>
                    </form>
                </div>

                {/* Submissions/Listed Timetable */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col">
                    <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">Active System Schedule</h2>
                    
                    {timeTables.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No schedule records.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2 uppercase text-[10px]">Course</th>
                                        <th className="px-4 py-2 uppercase text-[10px]">Day/Time</th>
                                        <th className="px-4 py-2 uppercase text-[10px]">Room</th>
                                        <th className="px-4 py-2 uppercase text-[10px]">Faculty</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {timeTables.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-slate-50 group">
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {entry.course} 
                                                <div className="text-[10px] text-slate-400 font-normal">{entry.className}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                <div className="font-medium text-xs">{entry.dayOfWeek}</div>
                                                <div className="text-[10px] font-mono whitespace-nowrap">{entry.startTime} - {entry.endTime}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 text-xs">{entry.room}</td>
                                            <td className="px-4 py-3 text-slate-600 text-xs">{entry.faculty?.name || 'TBA'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <form action={async () => {
                                                    'use server';
                                                    await deleteTimeTableEntry(entry.id);
                                                }}>
                                                    <button type="submit" className="text-red-500 hover:text-red-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Notices Section */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm lg:col-span-2">
                    <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-4">System Notices</h2>
                    
                    <div className="mb-6 space-y-2 max-h-64 overflow-y-auto pr-2">
                        {notices.length === 0 ? (
                            <p className="text-sm text-slate-400 italic text-center py-4">No notices broadcasted yet.</p>
                        ) : (
                            notices.map(n => (
                                <div key={n.id} className="p-3 bg-amber-50 border border-amber-100 rounded-md text-sm text-slate-700 flex justify-between items-start group">
                                    <div className="flex-1">
                                        <p className="font-medium">{n.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Live</span>
                                        <form action={async () => {
                                            'use server';
                                            await deleteNotice(n.id);
                                        }}>
                                            <button type="submit" className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all p-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-tight">Broadcast New Notice</h3>
                    <form action={sendNotice} className="flex gap-4">
                        <textarea 
                            name="message" 
                            required 
                            placeholder="Type a notice to broadcast to all students and faculty..." 
                            className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm outline-none resize-none h-20 transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100" 
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 rounded-md transition-all shadow-md active:transform active:scale-95 text-xs uppercase tracking-widest">
                            Broadcast
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
