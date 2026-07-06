# Recipe for the frontend container. Multi-stage: shared base, then dev + prod.
# Local runs `dev` (hot-reload); production runs `prod` (optimized build).

FROM node:20-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- dev: code is mounted by compose for hot-reload ----
FROM base AS dev
CMD ["npm", "run", "dev"]

# ---- prod: build an optimized bundle and serve it (used in Go Live) ----
FROM base AS prod
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
