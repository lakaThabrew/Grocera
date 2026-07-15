#!/bin/bash
set -e

echo "🚀 Starting Grocera Deployment..."

echo "📥 Pulling latest changes from git..."
git pull origin main

echo "🏗️ Building Docker images..."
docker-compose build

echo "🛑 Stopping running containers..."
docker-compose down

echo "🚀 Starting containers in detached mode..."
docker-compose up -d

echo "📦 Running database migrations..."
docker-compose exec -T backend npx prisma db push

echo "✅ Deployment complete! Grocera is now live."
