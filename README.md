# 🎓 CampusCore ERP: Integrated Educational Platform

CampusCore is a professional-grade, high-performance Educational Resource Planning (ERP) system built for modern academic institutions. It provides a centralized hub for administrators, faculty, and students to manage schedules, institutional broadcasts, and academic profiles.

---

## 🚀 Key Features

### 🏢 Administrator Console
- **Unified Roster Management**: Create and delete Student, Faculty, and Admin accounts with ease.
- **Auto-Password Logic**: Newly created accounts follow the secure `LastName + DDMMYYYY` pattern.
- **Broadcast System**: Send real-time institutional notices across all user dashboards.
- **Dynamic Scheduling**: Manage complex timetables with faculty and room assignments.

### 👨‍🏫 Faculty Portal
- **Academic Schedule**: Dedicated view of all assigned courses and room mappings.
- **Profile Hub**: Display employee IDs and departmental data.
- **Attendance & Grades**: Core data structures ready for academic performance tracking.

### 🎓 Student Space
- **Visual Timetable**: Real-time access to daily class schedules.
- **Official Profile**: Integrated "Official ID" display showing Roll Number, Course, Age, and Height.
- **Notice Board**: Instant updates on campus announcements.

---

## 🛠️ Technology Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components)
- **Authentication**: [Auth.js v5](https://authjs.dev/) (JWT Runtime Strategy)
- **ORM**: [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Runtime**: Node.js 20+

---

## ⚙️ Development Setup

### 1. Prerequisites
- **Node.js** (v20.x or higher)
- **PostgreSQL** (v15.x or higher)
- **npm** (v10.x or higher)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd IGRUA-ERP/campus-core
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `campus-core` directory:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/campuscore?schema=public"
AUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Initialization
Once Postgres is running, synchronize the schema and generate the client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Running the Application
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to access the platform.

---

## 🔑 Default Credentials (Dev Mode)
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@campuscore.com` | `admin` |
| **Faculty** | `faculty@campuscore.com` | `faculty` |
| **Student** | `student@campuscore.com` | `student` |

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

> [!TIP]
> **Production Note**: Always ensure your `AUTH_SECRET` is a secure 32-character string generated via `openssl rand -base64 32`.
