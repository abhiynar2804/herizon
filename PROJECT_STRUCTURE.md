# Project Structure

## Overview

This repository is a full-stack Next.js application for a health, cycle-tracking, and wellness platform. The stack includes:

- Next.js App Router
- TypeScript
- Prisma ORM with PostgreSQL
- NextAuth.js for authentication
- Zod validation utilities
- Tailwind CSS via PostCSS

The app is structured around user health management, partner sharing, symptom tracking, educational resources, and admin/audit features.

---

## Root Structure

```text
herizone-vone/
├── .agents/                       # Local agent metadata or automation files
├── .claude/                       # Claude-specific project guidance
├── .env                           # Local environment variables
├── .git/                          # Git repository metadata
├── .gitignore                     # Git ignore rules
├── .next/                         # Next.js build cache/output
├── .windsurf/                     # Windsurf/editor metadata
├── AGENTS.md                      # Agent/project instructions
├── CLAUDE.md                      # Claude-specific instructions
├── eslint.config.mjs              # ESLint configuration
├── next-env.d.ts                  # Next.js TypeScript environment declarations
├── next.config.ts                 # Next.js configuration
├── node_modules/                  # Installed project dependencies
├── package-lock.json              # NPM lock file
├── package.json                   # App scripts and dependencies
├── postcss.config.mjs             # PostCSS configuration
├── prisma/                        # Prisma schema and migrations
│   ├── migrations/                # Database migrations
│   │   └── migration_lock.toml    # Prisma migration lock file
│   └── schema.prisma              # Core database schema
├── prisma.config.ts               # Prisma project configuration
├── PROJECT_STRUCTURE.md           # Project structure overview
├── public/                        # Public static files
│   └── favicon.ico                # Site favicon
├── README.md                      # Default project docs
├── skills-lock.json               # Tool/skills lock file
├── src/                           # Application source code
├── tsconfig.json                  # TypeScript settings
└── .vscode/                       # VS Code workspace files (if generated locally)
```

---

## Source Structure

```text
src/
├── app/                           # App Router pages and API routes
│   ├── api/                       # Backend endpoints
│   │   ├── admin/                 # Admin APIs
│   │   │   ├── article-categories/
│   │   │   ├── articles/
│   │   │   ├── audit-logs/
│   │   │   ├── dashboard/
│   │   │   ├── symptom-rules/
│   │   │   ├── symptoms/
│   │   │   └── users/
│   │   ├── auth/                  # Auth endpoints
│   │   │   ├── signup/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── cycles/                # Cycle tracking APIs
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── partner/               # Partner-sharing APIs
│   │   │   ├── connection/
│   │   │   ├── dashboard/
│   │   │   ├── invite/
│   │   │   └── sharing/
│   │   ├── resources/             # Educational content APIs
│   │   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   └── [slug]/
│   │   └── symptoms/              # Symptom APIs
│   │       ├── check/
│   │       └── history/
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard page
│   ├── favicon.ico                # App icon
│   ├── globals.css                # Global styling
│   ├── layout.tsx                 # Root app layout
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── onboarding/
│   │   └── page.tsx               # Onboarding page
│   ├── page.tsx                   # Home page
│   └── resources/                 # Resource UI section
├── generated/                     # Generated Prisma client output
│   └── prisma/                    # Prisma runtime files and types
├── lib/                           # Shared logic, validation, helpers
│   ├── auth.ts                    # Auth helpers and config
│   ├── password.ts                # Password hashing / verification
│   ├── period/
│   │   └── calculations.ts        # Period and cycle calculations
│   ├── prisma.ts                  # Prisma singleton
│   ├── symptoms/                  # Symptom-related utility modules
│   └── validations/               # Zod validation schemas
│       ├── article.ts
│       ├── health-profile.ts
│       ├── partner.ts
│       ├── period.ts
│       ├── symptom-rule.ts
│       └── symptom.ts
├── types/                         # TS declarations
│   └── next-auth.d.ts             # NextAuth augmentation
└── ...
```

---

## Database Model Overview

The Prisma schema defines a health and wellness domain with the following primary models:

### Core user and auth

- `User`
- `HealthProfile`
- `PartnerConnection`
- `PartnerSharingSetting`

### Period and symptom tracking

- `Cycle`
- `CycleSymptom`
- `Symptom`
- `SymptomRule`
- `SymptomRuleCondition`
- `SymptomCheck`
- `SymptomCheckItem`

### Education and content

- `ArticleCategory`
- `Article`

### AI and communication

- `ChatSession`
- `ChatMessage`
- `Notification`

### Admin and audit

- `AdminAuditLog`

### Enums

The schema includes enums such as:

- `Role`
- `ConnectionStatus`
- `NotificationType`
- `NotificationChannel`
- `NotificationStatus`
- `SymptomSeverity`
- `RulePriority`
- `ArticleStatus`
- `ChatSender`
- `CyclePhase`

---

## Main Features by Area

### 1. Authentication and user account management

- Sign-up flow under `src/app/api/auth/signup`
- Auth routes under `src/app/api/auth/[...nextauth]`
- Shared auth logic in `src/lib/auth.ts`
- Password handling in `src/lib/password.ts`

### 2. Period and cycle tracking

- Cycle CRUD endpoints in `src/app/api/cycles`
- Cycle calculation utilities in `src/lib/period/calculations.ts`
- Validation helpers in `src/lib/validations/period.ts`

### 3. Partner and sharing features

- Partner invitation, connection, and sharing endpoints in `src/app/api/partner`
- Matching validation in `src/lib/validations/partner.ts`

### 4. Symptom analysis and recommendations

- Symptom check routes in `src/app/api/symptoms`
- Symptom rule engine in Prisma schema and validation utilities
- Support for tracked symptoms and emergency recommendation logic

### 5. Educational content resources

- Resource API under `src/app/api/resources`
- Content categories and article model under `prisma/schema.prisma`
- Validation in `src/lib/validations/article.ts`

### 6. Admin and audit workflows

- Admin endpoints for users, articles, symptoms, and dashboard metadata
- Audit logging model for administrative actions

---

## Key Configuration Files

- `package.json` — scripts, dependencies, and project metadata
- `next.config.ts` — Next.js runtime/build configuration
- `tsconfig.json` — TypeScript compiler configuration
- `eslint.config.mjs` — linting rules
- `postcss.config.mjs` — CSS pipeline configuration
- `prisma.config.ts` — Prisma configuration
- `.env` — environment variables (database URL, auth keys, etc.)

---

## Environment Expectations

This project is configured for PostgreSQL, as shown by the Prisma datasource and dependency stack.

Typical environment variables include:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- Any app-specific credentials or secrets used by the platform

---

## Standard Development Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

For Prisma database work:

```bash
npx prisma generate
npx prisma migrate dev
```

---

## Notes

- The Prisma client is generated into `src/generated/prisma`.
- The app uses Next.js App Router rather than the Pages Router.
- The codebase is more feature-rich than a simple starter app and includes a health-platform domain model.
- Several folders (for example `src/app/api/admin`, `src/app/api/partner`, `src/app/api/resources`) indicate a more complete product architecture than the default template.

---

## Summary

This project is a multi-feature wellness application with:

- user authentication
- cycle tracking
- partner sharing
- symptom management
- educational content
- admin operations
- audit and notification infrastructure

The repository structure reflects a product-ready SaaS-style application rather than a basic scaffold.

Last updated: 2026-08-21
