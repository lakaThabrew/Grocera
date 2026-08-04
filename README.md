# Grocera Retail Intelligence Platform

Grocera is a comprehensive, full-stack retail intelligence platform that aggregates real-time pricing data from major supermarkets (Keells, Cargills, and Arpico). It empowers consumers with price comparisons and provides businesses with deep market analytics.

---

## 📊 Feature Status

### Fully Implemented
- **Smart Search & Comparison**: Compare product prices across multiple supermarkets in real-time.
- **Competitor Analytics**: Live radar, heatmaps, and inflation rates calculated using real historical price comparisons.
- **Price Alerts (Email, SMS, Push)**: Integrated via SMTP, Twilio (Free Trial), and Web-Push. Alerts are actively triggered by scraper updates.
- **Security**: Strict ownership validation on alerts and notifications is enforced.
- **AI Fallback**: Graceful degradation when Gemini API keys are missing or models fail.

### Prototype / Demo
- **Log Streaming**: Live dashboard simulation.
- **Scraper Proxies**: Currently runs headlessly without full proxy rotation.

### Planned
- Deep Basket Optimization with multi-stop routing logic.
- Mobile App with native push notifications.

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

*Note for Notifications*: To enable SMS and Push, configure the following in `backend/.env`:
```env
# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
TWILIO_TEST_NUMBER=recipient_number

# Web Push
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

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

**Running Tests**:
```bash
npm run test
```

### Development demo login

After running the database seed, sign in with `demo.consumer@grocera.test` and
`Demo12345!`. This account is intended for local development only; do not use
these credentials on a public deployment.

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
