# Grocera Retail Intelligence Platform

Grocera is a comprehensive, full-stack retail intelligence platform that aggregates real-time pricing data from major supermarkets (Keells, Cargills, and Arpico). It empowers consumers with price comparisons and provides businesses with deep market analytics.

---

## 🚀 Features by Role

### 🛒 For Consumers
- **Smart Search & Comparison**: Compare product prices across multiple supermarkets in real-time.
- **Basket Optimization**: Build a shopping list and let Grocera split your basket across stores for the absolute lowest total cost.
- **Price Alerts**: Set target prices on favorite items and receive notifications when they drop.
- **AI Assistant**: A conversational AI that recommends products, recipes, and interprets market trends.

### 💼 For Businesses (B2B)
- **Competitor Analytics**: Access live price tracking and historical pricing charts for competitive intelligence.
- **Pricing Heatmaps**: A visual matrix showing which competitors are pricing highest/lowest across product categories.
- **Market Share & Indexing**: Real-time KPI dashboards calculating Price Leadership Share and market positioning.
- **Public REST API**: A versioned, rate-limited REST API (with Swagger OpenAPI documentation) secured via API Keys for integrations.

### 🛡️ For Administrators
- **System Monitoring**: Live dashboard displaying server memory (RSS), Node.js uptime, and database aggregates.
- **Log Streaming**: Real-time backend Winston server logs streamed directly to the frontend Admin terminal.
- **User Management**: Easily promote users to Business/Admin roles or manage system access.
- **Scraper Health**: Monitor the status and success rates of the automated Playwright scraping engine.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (Turbopack), React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts.
- **Backend**: NestJS, Node.js, TypeScript, Prisma ORM.
- **Database & Caching**: PostgreSQL 15, Redis 7 (In-memory caching and background job queuing).
- **Scraping Engine**: Playwright (Headless Chromium) with proxy rotation capabilities.
- **Infrastructure**: Docker, Nginx, GitHub Actions (CI).

---

## 💻 Getting Started (Local Development)

### 1. Prerequisites
- Docker & Docker Compose
- Node.js 20+

### 2. Environment Variables
Copy the example environment files and configure your secrets:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```
*(Make sure to update the database passwords and JWT secrets for your local environment)*.

### 3. Start Database and Redis
Spin up the backing services:
```bash
docker-compose up -d postgres redis
```

### 4. Setup Backend
```bash
cd backend
npm install
npx prisma db push
npm run start:dev
```
*The backend API will run on `http://localhost:3001` with Swagger docs available at `/api`.*

### 5. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend dashboard will run on `http://localhost:3000`.*

---

## 🐳 Running with Docker (Production/Staging)

You can run the entire stack (Frontend, Backend, Postgres, Redis) in containers:

```bash
# Build and start all services in detached mode
docker-compose up -build -d
```

---

## 🚀 Deployment

The platform is configured for automated CI/CD and secure deployments.

- **Continuous Integration**: GitHub Actions (`.github/workflows/ci.yml`) automatically lints, builds, and tests the application on every push to `main`.
- **Reverse Proxy**: An Nginx configuration template is provided in `nginx/nginx.conf` designed for Let's Encrypt SSL.
- **Deployment Script**: Use `./deploy.sh` on your production server to pull the latest changes, rebuild Docker images, and migrate the database with zero downtime.

---

## 📝 License
Proprietary & Confidential. All rights reserved.
