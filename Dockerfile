# Recipe for the frontend container. Multi-stage: shared base, then dev + prod.
# Local runs `dev` (hot-reload); production runs `prod` (optimized build).

FROM node:22-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- dev: Compose Watch syncs later source edits for hot-reload ----
FROM base AS dev
COPY . .
CMD ["npm", "run", "dev"]

# ---- prod: build an optimized bundle and serve it (used in Go Live) ----
FROM base AS prod
# NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so
# they must be present here — setting them only at runtime has no effect.
# Pass with: docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example --target prod .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN test -n "$NEXT_PUBLIC_API_URL" || (echo "NEXT_PUBLIC_API_URL build arg is required" >&2; exit 1)
# Optional: without it the shop profile shows no map (address + directions remain).
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
