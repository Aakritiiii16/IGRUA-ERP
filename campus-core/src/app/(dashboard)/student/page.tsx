import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { submitAttendanceRequest, uploadDocument } from './actions';

export default async function StudentDashboard() {
    const session = await auth();

    // Fetch user profile and related data
    let userProfile: any = null;
    let timeTables: any[] = [];
    let recentNotices: any[] = [];
    let attendances: any[] = [];
    let documents: any[] = [];
    let marks: any[] = [];

    try {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = daysOfWeek[new Date().getDay()];

        const [p, notices] = await Promise.all([
            prisma.user.findUnique({
                where: { id: session?.user?.id },
                include: { profile: true }
            }),
            prisma.notice.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ]);
        userProfile = p;
        recentNotices = notices;

        // Fetch remaining data conditionally based on user profile
        if (p) {
            const courseOrClass = p.profile?.course || '';
            const [tt, att, docs, mrks] = await Promise.all([
                // Fetch schedules matching user's course/class
                prisma.timeTable.findMany({
                    where: { OR: [{ className: courseOrClass }, { course: courseOrClass }] },
                    include: { faculty: { include: { profile: true } } },
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
                }),
                prisma.attendance.findMany({
                    where: { studentId: p.id },
                    orderBy: { date: 'desc' },
                    take: 10,
                    include: { timeTable: true }
                }),
                prisma.document.findMany({
                    where: { userId: p.id },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.mark.findMany({
                    where: { studentId: p.id },
                    orderBy: { createdAt: 'desc' }
                })
            ]);
            timeTables = tt;
            attendances = att;
            documents = docs;
            marks = mrks;
        }

    } catch (e) {
         console.error("Database connection failed", e);
    }

    // Extract unique faculty from timetables
    const uniqueFacultyMap = new Map();
    timeTables.forEach(t => {
        if (t.faculty && !uniqueFacultyMap.has(t.facultyId)) {
            uniqueFacultyMap.set(t.facultyId, {
                name: t.faculty.name,
                email: t.faculty.email,
                phone: t.faculty.profile?.phone || 'N/A',
                subjects: new Set([t.course])
            });
        } else if (t.faculty) {
            uniqueFacultyMap.get(t.facultyId).subjects.add(t.course);
        }
    });
    const facultyList = Array.from(uniqueFacultyMap.values()).map(f => ({
        ...f,
        subjects: Array.from(f.subjects).join(', ')
    }));

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <header className="border-b border-slate-200 pb-4">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Student 360° Portal</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Comprehensive Academic & Profile Overview for {userProfile?.name}</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Profile & Hostel */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Student Profile Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
                        <div className="relative z-10 flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-indigo-500/50 mb-3 overflow-hidden">
                                {userProfile?.image ? (
                                    <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-full h-full text-slate-600 p-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                )}
                            </div>
                            <h2 className="text-xl font-black tracking-tight">{userProfile?.name}</h2>
                            <p className="text-xs font-bold text-indigo-300 tracking-widest uppercase">{userProfile?.profile?.course || 'No Course Assigned'}</p>
                        </div>
                        
                        <div className="relative z-10 space-y-3 bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Roll No</span>
                                <span className="text-sm font-mono font-bold text-indigo-200">{userProfile?.rollNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Email</span>
                                <span className="text-xs font-medium text-slate-200">{userProfile?.email}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Department</span>
                                <span className="text-xs font-medium text-slate-200">{userProfile?.profile?.department || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Phone</span>
                                <span className="text-xs font-medium text-slate-200">{userProfile?.profile?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Date of Birth</span>
                                <span className="text-xs font-medium text-slate-200">{userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Passing Year</span>
                                <span className="text-xs font-bold text-slate-200">{userProfile?.profile?.passingYear || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-start pt-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase w-1/3">Address</span>
                                <span className="text-xs font-medium text-slate-200 text-right">{userProfile?.profile?.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Hostel Allocation */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                        <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                            Hostel Allocation
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Hostel Name</p>
                                <p className="text-sm font-semibold text-slate-900">{userProfile?.profile?.hostelName || 'Not Allocated'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Room Number</p>
                                <p className="text-sm font-mono font-bold text-slate-900">{userProfile?.profile?.roomNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Faculty Details */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                        <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-4 border-b border-slate-100 pb-2">My Faculty</h3>
                        {facultyList.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No faculty assigned yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {facultyList.map((faculty, idx) => (
                                    <div key={idx} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <p className="font-bold text-sm text-slate-800">Prof. {faculty.name}</p>
                                        <p className="text-xs font-medium text-indigo-600">{faculty.subjects}</p>
                                        <div className="flex gap-3 mt-1 text-[10px] text-slate-500 font-medium">
                                            <span>📞 {faculty.phone}</span>
                                            <span>✉️ {faculty.email}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* MIDDLE & RIGHT COLUMN: Academics, Attendance, Documents */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {/* Attendance Tracker & Correction */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                Attendance Tracker
                            </h2>
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">Cumulative: 87%</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Recent Records</h3>
                                {attendances.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">No attendance records found.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {attendances.map(att => (
                                            <li key={att.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded border-b border-slate-100 last:border-0">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700">{att.timeTable?.course || 'Lecture'}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(att.date).toLocaleDateString()}</span>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${att.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {att.status}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-700 tracking-tight mb-3">Request Correction</h3>
                                <form action={submitAttendanceRequest} className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Lecture Date</label>
                                        <input type="date" name="date" required className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none bg-white"/>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Reason</label>
                                        <textarea name="reason" required placeholder="Medical emergency, transit delay..." className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none bg-white h-16 resize-none"></textarea>
                                    </div>
                                    <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded text-xs transition-colors">Submit Request</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Marks & Academic Reports */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                            My Marks & Reports
                        </h2>
                        {marks.length === 0 ? (
                            <div className="bg-slate-50 border border-slate-100 p-8 rounded-xl text-center">
                                <p className="text-sm text-slate-500 font-medium">No academic results published yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-2 uppercase text-[10px]">Title/Course</th>
                                            <th className="px-4 py-2 uppercase text-[10px]">Type</th>
                                            <th className="px-4 py-2 uppercase text-[10px]">Score</th>
                                            <th className="px-4 py-2 uppercase text-[10px]">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {marks.map(m => (
                                            <tr key={m.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-semibold text-slate-800">
                                                    {m.title}
                                                    <span className="block text-[10px] font-normal text-slate-500">{m.course}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">{m.type}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold font-mono text-emerald-600">{m.score}</span>
                                                    <span className="text-xs text-slate-400"> / {m.maxScore}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Digital Locker / Documents */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                                Digital Locker
                            </h2>
                            <ul className="space-y-3">
                                {documents.length === 0 ? (
                                    <li className="text-xs text-slate-400 italic">No documents uploaded.</li>
                                ) : (
                                    documents.map(doc => (
                                        <li key={doc.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg hover:shadow-xs transition-shadow cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">{doc.title}</span>
                                                    <span className="text-[10px] text-slate-400">{doc.type}</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-indigo-600 font-bold hover:underline">View</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                        
                        <div className="bg-slate-50 rounded-xl p-6 shadow-inner border border-slate-200 border-dashed">
                            <h3 className="text-sm font-bold text-slate-700 tracking-tight mb-4">Upload New Document</h3>
                            <form action={uploadDocument} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Document Type</label>
                                    <select name="type" className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none bg-white">
                                        <option value="ID">ID Card</option>
                                        <option value="CERTIFICATE">Certificate</option>
                                        <option value="ASSIGNMENT">Assignment</option>
                                        <option value="TRAINING_REPORT">Training Report</option>
                                    </select>
                                </div>
                                <div>
                                    <input type="file" name="document" required accept=".pdf,.png,.jpg,.jpeg" className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer" />
                                </div>
                                <button type="submit" className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 rounded text-xs transition-colors border border-slate-300">Upload File</button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Notices Footer */}
            {recentNotices.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm mt-6">
                    <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-3">System Broadcasts</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {recentNotices.map(notice => (
                            <div key={notice.id} className="min-w-[250px] bg-white p-3 rounded-lg border border-amber-100 shadow-sm text-sm text-slate-700">
                                <span className="font-bold text-amber-700 text-[10px] uppercase block mb-1">
                                    {new Date(notice.createdAt).toLocaleDateString()}
                                </span>
                                {notice.message}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
