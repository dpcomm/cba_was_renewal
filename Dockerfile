FROM node:alpine AS base
WORKDIR /app
RUN npm install -g npm@latest

FROM base AS deps
COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci


FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci --only=production --ignore-scripts

RUN chown -R nestjs:nodejs /app

USER nestjs
EXPOSE 3000
CMD ["sh", "-c", "npm run migration:prod && node dist/src/main"]
