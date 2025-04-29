FROM node:22-alpine AS base
WORKDIR /app

# Base de développement pour dépendances et build
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

# Image de développement
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build de l'application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Générer Prisma lors du build
RUN npx prisma generate
RUN npm run build

# Image de production
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copier les fichiers générés par Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["node", "server.js"]