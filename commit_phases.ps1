git add backend/src/baskets frontend/src/app/(dashboard)/baskets
git commit -m "feat(baskets): add basket optimization (Phase 6)"

git add backend/src/analytics frontend/src/app/(dashboard)/analytics
git commit -m "feat(analytics): add historical analytics (Phase 7)"

git add backend/src/consumers frontend/src/app/(dashboard)/favorites frontend/src/app/(dashboard)/alerts
git commit -m "feat(consumers): add favorites and price alerts (Phase 8)"

git add backend/src/business frontend/src/app/(dashboard)/business
git commit -m "feat(business): add B2B analytics and pricing heatmap (Phase 9)"

git add backend/src/public-api backend/src/auth/api-key.guard.ts
git commit -m "feat(api): add public REST API and rate limiting (Phase 10)"

git add backend/src/admin frontend/src/app/(dashboard)/admin
git commit -m "feat(admin): add admin panel and system health monitoring (Phase 11)"

git add backend/src/ai frontend/src/app/(dashboard)/assistant
git commit -m "feat(ai): improve AI assistant and product matching algorithms"

git add backend/src/scraping frontend/src/app/(dashboard)/scraper
git commit -m "feat(scraper): improve scraper strategies and performance"

git add backend/prisma backend/src/app.module.ts backend/src/main.ts backend/src/auth backend/src/users frontend/src/app/(auth) frontend/src/components frontend/src/app/(dashboard)/page.tsx frontend/src/app/globals.css frontend/src/lib/exportUtils.ts frontend/package*.json backend/package*.json
git commit -m "feat(core): update prisma schema, app modules, and core UI components"

git add .
git commit -m "chore(deploy): add deployment scripts, CI/CD, and environment configs (Phase 12)"

git push origin HEAD
