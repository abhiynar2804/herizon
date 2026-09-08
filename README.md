# Herizon

A modern women’s health and wellness platform for cycle tracking, symptom awareness, partner support, educational resources, and AI-assisted general wellness guidance.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.1-black?logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/NextAuth-Auth-3C82F6?logo=nextauth&logoColor=white" alt="NextAuth" />
</p>

## Overview

Herizon is a full-stack women’s health and wellness application designed to help users:

* track menstrual cycles and period history
* record symptoms and identify patterns over time
* manage personal health information
* receive general wellness guidance
* share selected cycle information with trusted partners
* access educational resources and wellness content
* manage platform content and administrative workflows

The application combines a user-focused health dashboard with a flexible backend, Prisma-powered data layer, PostgreSQL database, and AI-assisted conversational experiences.

## Project Background

Herizon is an independently developed women’s health and wellness platform.

The project was inspired by existing ideas and approaches in women’s health technology, while the implementation, architecture, database design, backend logic, and user interface were developed independently for this project.

## Key Features

### Personal Health Tracking

* cycle timeline and period tracking
* period and cycle history
* symptom logging and historical analysis
* health profile management
* predicted period and fertility windows
* cycle phase information

### Partner and Sharing

* partner invitation and connection flows
* controlled sharing of selected cycle information
* partner dashboard
* request and connection management
* user-controlled sharing and access

### AI and Education

* AI-assisted conversational wellness guidance
* educational resource library
* health and wellness articles
* symptom-related general guidance
* content management for educational resources

### Symptom Awareness

* database-driven symptom selection
* rule-based symptom evaluation
* general guidance based on selected symptoms
* recommendations to seek professional care when appropriate

> The symptom checker is designed for awareness and general guidance. It does not provide medical diagnoses or prescriptions.

### Admin Capabilities

* user and account administration
* symptom management
* symptom rule management
* article and educational content management
* audit log tracking
* platform analytics and operational visibility

## Tech Stack

* **Next.js 16** — App Router
* **React 19**
* **TypeScript**
* **Tailwind CSS**
* **Prisma ORM**
* **PostgreSQL**
* **NextAuth.js** — credentials-based authentication
* **Zod** — input validation
* **Google Gemini API** — AI-assisted conversational guidance

## Architecture

```text
User
  │
  ▼
Next.js Application
  │
  ├── UI / Dashboard
  ├── API Routes
  ├── Authentication
  ├── Business Logic
  └── AI Integration
          │
          ▼
      Google Gemini
          
Next.js Server
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL Database
```

## Project Structure

```text
herizon/
├── prisma/                     # Prisma schema and migrations
├── public/                     # Static assets
├── src/
│   ├── app/                    # App Router pages, routes, and API endpoints
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Auth, validation, Prisma, AI, and logic helpers
│   ├── generated/              # Generated Prisma client
│   └── types/                  # Type declarations
├── package.json
├── prisma.config.ts
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── README.md
└── .env.example
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
```

> Keep environment variables and API keys private. Do not commit your `.env` file to version control.

### 3. Generate Prisma Client and apply the database schema

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev      # start development server
npm run build    # create production build
npm run start    # run production build
npm run lint     # run ESLint
```

## Application Areas

The application includes the following key areas:

* `/login` — user login
* `/signup` — user registration
* `/dashboard` — main user dashboard
* `/period` — cycle and period tracking
* `/symptoms` — symptom awareness and checking
* `/resources` — educational resources
* `/partner` — partner sharing and connection
* `/admin` — administrative management

## Database and Authentication

Herizon uses:

* **Prisma** as the ORM and database schema manager
* **PostgreSQL** as the primary database
* **NextAuth.js** for credentials-based authentication
* secure password hashing for user authentication
* protected API routes with user-specific data access

User health information is intended to remain isolated between accounts, while partner access is limited to information explicitly shared by the user.

## AI Usage

Herizon uses Google Gemini for conversational, general women’s health and wellness guidance.

The AI assistant is not intended to:

* diagnose medical conditions
* prescribe medication
* replace a healthcare professional
* provide emergency medical care

Users should consult a qualified healthcare professional for diagnosis, treatment, or medical concerns.

## Privacy and Security

Herizon is designed with user privacy and controlled access in mind.

Key principles include:

* authenticated access to protected features
* user-specific health data access
* protected API endpoints
* hashed passwords
* controlled partner data sharing
* revocable partner access
* separation between administrative platform management and private user health information

For production deployment, appropriate security, privacy, data protection, and compliance requirements should be reviewed based on the deployment environment and applicable regulations.

## Health Disclaimer

> **Important:** Herizon is a health and wellness application intended for educational and general wellness purposes. Information provided by the application, including symptom guidance, cycle predictions, and AI-generated responses, should not be considered medical diagnosis, treatment, or professional medical advice.

> If you have a serious or urgent medical concern, consult a qualified healthcare professional or appropriate emergency service.

## Verification

The project is configured to support the standard production build flow.

Before deployment, run:

```bash
npm run lint
npm run build
```

Both checks should complete successfully before deploying a production build.

## Contributing

This project was developed as an independently developed academic/project implementation.

If contributions are accepted in the future, contributors should:

1. create a feature branch
2. make the required changes
3. validate the changes with lint and build checks
4. open a pull request with a clear summary

## License

All rights reserved.

This project is an independently developed academic/project implementation. The source code may not be copied, modified, distributed, or used commercially without permission from the project owner.

Third-party libraries, frameworks, and services used by this project remain subject to their respective licenses and terms.

## Acknowledgements

Herizon was developed using open-source technologies and third-party services including Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth.js, Zod, and Google Gemini.

All third-party software remains the property of its respective authors and is used according to its applicable license or terms.
