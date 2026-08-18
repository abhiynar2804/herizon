# Project Structure Documentation

## Overview

This is a **Next.js 15+ Full-Stack Application** with **Prisma ORM** as the database layer and **NextAuth.js** for authentication. The project is structured using the Next.js App Router pattern with TypeScript.

---

## Directory Structure

```
herizone-vone/
├── public/                          # Static assets served publicly
├── prisma/                          # Prisma ORM configuration and migrations
│   ├── schema.prisma               # Database schema definition
│   ├── migrations/                 # Database migration history
│   │   ├── migration_lock.toml     # Migration lock file (SQLite)
│   │   └── 20260814082438_init_herizon/
│   │       └── migration.sql       # Initial database migration
│   └── .env.local                  # (Not shown) Database connection URL
├── src/                            # Source code directory
│   ├── app/                        # Next.js App Router (Pages & API Routes)
│   │   ├── globals.css             # Global stylesheet
│   │   ├── layout.tsx              # Root layout component
│   │   ├── page.tsx                # Home page component
│   │   ├── api/                    # API routes (backend endpoints)
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts    # NextAuth.js authentication handler
│   │   │   │   └── signup/
│   │   │   │       └── route.ts    # User registration endpoint
│   │   │   ├── cycles/
│   │   │   │   ├── route.ts        # GET/POST cycles (list & create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts    # GET/PATCH/DELETE specific cycle
│   │   │   ├── health-profile/
│   │   │   │   └── route.ts        # Health profile management endpoint
│   │   │   └── symptoms/
│   │   │       └── check/          # Symptoms checking endpoint
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard page
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   └── onboarding/
│   │       └── page.tsx            # Onboarding page
│   ├── generated/                  # Auto-generated code (Prisma Client)
│   │   └── prisma/
│   │       ├── client.d.ts         # Prisma Client TypeScript types
│   │       ├── client.js           # Prisma Client compiled JS
│   │       ├── default.d.ts        # Default export types
│   │       ├── default.js          # Default export compiled JS
│   │       ├── edge.d.ts           # Edge runtime types
│   │       ├── edge.js             # Edge runtime compiled JS
│   │       ├── index-browser.js    # Browser compatible version
│   │       ├── index.d.ts          # Main export types
│   │       ├── index.js            # Main export compiled JS
│   │       ├── package.json        # Prisma package metadata
│   │       ├── query_compiler_*.js # Query compilation files
│   │       ├── schema.prisma       # Generated schema copy
│   │       ├── wasm-*.mjs          # WASM binary loaders
│   │       └── runtime/            # Runtime utilities
│   │           ├── client.d.ts
│   │           ├── client.js
│   │           ├── index-browser.*
│   │           └── wasm-compiler-edge.js
│   ├── lib/                        # Shared utility functions & logic
│   │   ├── auth.ts                 # Authentication utilities
│   │   ├── password.ts             # Password hashing & validation
│   │   ├── prisma.ts               # Prisma Client singleton instance
│   │   ├── period/
│   │   │   └── calculations.ts     # Menstrual cycle calculations
│   │   ├── symptoms/               # Symptoms-related utilities
│   │   └── validations/            # Input validation schemas
│   │       ├── health-profile.ts   # Health profile validation
│   │       └── period.ts           # Period/cycle validation
│   └── types/                      # TypeScript type definitions
│       └── next-auth.d.ts          # NextAuth.js type augmentation
├── .env.local                      # (Not shown) Environment variables
├── .gitignore                      # (Not shown) Git ignore rules
├── AGENTS.md                       # Modernization agent guidelines
├── CLAUDE.md                       # Assistant guidelines
├── PROJECT_STRUCTURE.md            # This file
├── README.md                       # Project documentation
├── eslint.config.mjs               # ESLint configuration (ES modules)
├── next-env.d.ts                   # Next.js auto-generated TypeScript definitions
├── next.config.ts                  # Next.js configuration
├── package.json                    # Project dependencies & scripts
├── postcss.config.mjs              # PostCSS configuration
├── prisma.config.ts                # Prisma configuration (custom)
├── skills-lock.json                # Skills/dependencies lock file
└── tsconfig.json                   # TypeScript configuration
```

---

## Key Directories Explained

### `/src/app` - Next.js App Router

The main application structure using Next.js 13+ App Router:

- **Page routes**: Nested folders become URL routes
- **API routes**: `api/` folder contains backend endpoints
- **Layouts**: `layout.tsx` provides shared UI and state

### `/src/lib` - Business Logic & Utilities

Shared code for backend operations:

- **auth.ts**: Authentication helper functions
- **prisma.ts**: Centralized Prisma Client instance (prevents connection pool issues)
- **period/**: Menstrual cycle-related calculations
- **validations/**: Input validation logic (likely using Zod or similar)

### `/src/types` - TypeScript Definitions

Custom type definitions for the application:

- **next-auth.d.ts**: Extends NextAuth.js types for custom user properties

### `/prisma` - Database Configuration

- **schema.prisma**: Database models and relationships
- **migrations/**: Version history of database changes (Git-like versioning)

---

## Technology Stack

| Layer               | Technology                     | Purpose                           |
| ------------------- | ------------------------------ | --------------------------------- |
| **Frontend**        | Next.js, React, TypeScript     | UI and client-side logic          |
| **Styling**         | PostCSS, CSS                   | Component styling                 |
| **Backend**         | Next.js API Routes             | RESTful API endpoints             |
| **Database**        | Prisma ORM                     | Database abstraction & management |
| **Authentication**  | NextAuth.js                    | User authentication & sessions    |
| **Database Engine** | SQLite (default) or PostgreSQL | Data persistence                  |
| **Language**        | TypeScript                     | Type-safe development             |
| **Linting**         | ESLint                         | Code quality                      |

---

## Core Features (Inferred from Structure)

1. **Authentication System**
   - User signup and login via `api/auth/`
   - NextAuth.js session management
   - Password utilities for hashing

2. **Health Tracking**
   - Menstrual cycle tracking (`/periods`, `/cycles`)
   - Health profile management
   - Symptoms logging and checking

3. **User Dashboard**
   - Personalized dashboard page
   - Onboarding flow for new users

---

## Environment Configuration

### Configuration Files

- **next.config.ts**: Next.js build and runtime settings
- **tsconfig.json**: TypeScript compiler options
- **eslint.config.mjs**: Code linting rules
- **postcss.config.mjs**: CSS processing pipeline
- **prisma.config.ts**: Custom Prisma configuration

### Environment Variables (`.env.local`)

Expected variables:

- `DATABASE_URL`: Prisma database connection string
- `NEXTAUTH_SECRET`: NextAuth.js encryption key
- `NEXTAUTH_URL`: Application URL for auth callbacks
- Additional API keys and configuration as needed

---

## API Endpoints Summary

| Route                     | Method           | Purpose                   |
| ------------------------- | ---------------- | ------------------------- |
| `/api/auth/[...nextauth]` | GET/POST         | Authentication endpoints  |
| `/api/auth/signup`        | POST             | User registration         |
| `/api/cycles`             | GET/POST         | List and create cycles    |
| `/api/cycles/[id]`        | GET/PATCH/DELETE | Manage specific cycle     |
| `/api/health-profile`     | GET/POST         | Health profile management |
| `/api/symptoms/check`     | POST             | Check/log symptoms        |

---

## Development Notes

### Database Schema Location

- Source: `prisma/schema.prisma`
- Generated types: `src/generated/prisma/client.d.ts`

### Prisma Client Usage

- Centralized instance: `src/lib/prisma.ts`
- Import with: `import { prisma } from '@/lib/prisma'`

### Authentication Flow

- Configured in: `src/lib/auth.ts`
- Routes handled: `src/app/api/auth/`
- Protected pages use NextAuth.js session checks

### Type Safety

- TypeScript strict mode enabled
- Prisma generates types automatically
- Custom types in `src/types/`

---

## Build Artifacts

### Generated Files (Auto-generated, do not edit)

- `/src/generated/prisma/`: Prisma Client build output
- `next-env.d.ts`: Next.js environment types

### Lock Files

- `skills-lock.json`: Dependency lock
- `prisma/migrations/migration_lock.toml`: Migration lock

---

## Getting Started

### Install Dependencies

```bash
npm install
```

### Setup Database

```bash
npx prisma migrate dev
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## File Naming Conventions

- **Pages**: `page.tsx`
- **Layouts**: `layout.tsx`
- **API Routes**: `route.ts`
- **Components**: `PascalCase.tsx` (not shown in structure, likely in shared folder)
- **Utilities**: `camelCase.ts`
- **Types**: `.d.ts` or types folder

---

## Security Considerations

1. ✅ Database: Prisma ORM prevents SQL injection
2. ✅ Authentication: NextAuth.js handles session security
3. ✅ Password: Custom password utilities for hashing
4. ✅ Environment: Sensitive data in `.env.local` (not committed)

---

**Last Updated**: 2026-08-18
