# Grocera Retail Intelligence Platform

A retail intelligence platform that aggregates real-time data from Keells, Cargills, and Arpico.

## Tech Stack
- Frontend: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: NestJS, Node.js, PostgreSQL, Prisma ORM, Redis
- Scraping: Playwright, Proxy Manager

## Getting Started

1. Start the database and redis:
   ```bash
   docker-compose up -d
   ```
2. Setup Backend:
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run start:dev
   ```
3. Setup Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
