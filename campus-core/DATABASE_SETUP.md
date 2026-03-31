# Database Setup Guide

This document explains how to set up the database for the CampusCore ERP system.

The project uses PostgreSQL as its database and Prisma as its ORM (Object-Relational Mapper).

## Prerequisites
1. **PostgreSQL**: You must have PostgreSQL installed and running on your system (e.g., using Postgres.app on macOS, Docker, or native installation).
2. **Environment Variable**: Ensure you have a `.env` file at the root of `campus-core` with a `DATABASE_URL` pointing to your local (or remote) Postgres database.

Example `.env` content:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/campuscore?schema=public"
```

## Step-by-Step Setup

### 1. Initialize DB and Push Schema (Development)
If you are developing locally and just want to map the Prisma schema to the database quickly without a formal migration history, you can use `db push`:
```bash
npx prisma db push
```
*Note: This will create the required tables (`User`, `Profile`, `AuditLog`, `TimeTable`) directly in your database.*

### 2. Generate Prisma Client
After making any structural changes to `prisma/schema.prisma` or running `db push`, you need to generate the TypeScript client:
```bash
npx prisma generate
```
This ensures that your code (`prisma` imports) recognizes the new models, like `TimeTable`.

### 3. Formal Migrations (For Production or Team Collaboration)
If you want to create formal SQL migration files that team members can run consistently instead of using `db push`, you run:
```bash
npx prisma migrate dev --name init
```
This will automatically generate a new SQL file in the `prisma/migrations` folder and apply it to your database.

### 4. Viewing Database Content with Prisma Studio
Prisma provides a nice, visual GUI to peek into your database and manually add/edit rows. To start it, run:
```bash
npx prisma studio
```
This will open a browser window at `http://localhost:5555` where you can see all your tables and manage data visually.

---
**Troubleshooting**: 
- If you encounter an connection error "connection to server at 'localhost' (::1), port 5432 failed", ensure your PostgreSQL daemon is actively running.
- Ensure the user credentials supplied in your `DATABASE_URL` are correct.
