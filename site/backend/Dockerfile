FROM node:20.5.0-alpine AS dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /home/app
COPY ./codebase/hasti_api/package.json ./
COPY ./codebase/hasti_api/yarn.lock ./
RUN yarn install --production --prefer-offline
FROM node:20.5.0-alpine AS builder
WORKDIR /home/app
COPY --from=dependencies /home/app/node_modules ./node_modules
COPY ./codebase/hasti_api .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV=production
RUN yarn prisma generate --schema=clients/prisma/schema.prisma
RUN yarn build
FROM node:20.5.0-alpine AS runner
WORKDIR /home/app
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=builder /home/app/.next/standalone ./standalone
COPY --from=builder /home/app/.next/static /home/app/standalone/.next/static
EXPOSE 3000
ENV PORT 3000
CMD ["node", "./standalone/server.js"]


