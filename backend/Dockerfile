FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y openssl

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Install Playwright dependencies
RUN npx playwright install --with-deps chromium

EXPOSE 3001

CMD [ "sh", "-c", "npx prisma db push && npx prisma db seed && npm run start:prod" ]
