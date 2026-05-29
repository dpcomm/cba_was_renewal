FROM node:alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci


FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm run build:email-worker && npm run build:push-worker

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
# Expo Push를 사용하므로 비활성화
# COPY --from=builder /app/serviceAccountKey.json ./

RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --ignore-scripts

RUN chown -R nestjs:nodejs /app

USER nestjs
EXPOSE 3000
CMD ["sh", "-c", "npm run migration:prod && node dist/src/main"]
