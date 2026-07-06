# tinsae-frontend

Frontend for **Tinsae** — a local product-discovery marketplace.
Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui, containerized with Docker.

## Prerequisites

You only need these installed on your machine:

- **Docker** (with the Compose v2 plugin — `docker compose version` should work)
- **Git**

Node.js runs **inside the container** — you do not need it installed on your host.
(Installing Node locally is optional and only helps your editor's autocomplete.)

## Important: the backend must be running

This frontend talks to the **tinsae-backend** API. Before starting the frontend,
make sure the backend is running and healthy:

```bash
# in the tinsae-backend repo:
docker compose up
# verify: curl http://localhost:8000/api/health/  ->  {"status":"ok","database":"ok"}
```

The two repos run independently. Clone both side by side:
workspace/
├── tinsae-backend/
└── tinsae-frontend/

## Getting started

```bash
# 1. Clone and enter the repo
git clone <repo-url> tinsae-frontend
cd tinsae-frontend

# 2. Create your local environment file
cp .env.example .env.local

# 3. Make sure the backend is running (see above), then start the frontend
docker compose up --build
```

The app is then live at **http://localhost:3000**.

You should see the **Tinsae — System Status** page showing the backend and
database as `ok`, confirming the frontend can reach the backend.

## How it runs

`docker compose up` starts one container:

- **`frontend`** — the Next.js dev server (Node 20).

Your code is mounted into the container, so **editing a file hot-reloads** the
page in the browser — no rebuild needed. You only rebuild
(`docker compose up --build`) when dependencies change (`package.json`) or the
Docker setup changes.

## Configuration

Settings come from environment variables (see `.env.example`). The real
`.env.local` is git-ignored and must never be committed.

| Variable              | Purpose                          | Local value             |
|-----------------------|----------------------------------|-------------------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API      | `http://localhost:8000` |

The `NEXT_PUBLIC_` prefix means the value is available to browser-side code.

## Project structure
src/
├── app/            App Router pages (page.tsx = home / status page)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── ui/         shadcn/ui components (card, etc.)
└── lib/
├── api.ts      central backend API helper
└── utils.ts    shadcn utility helper
Dockerfile          multi-stage image (dev + prod targets)
docker-compose.yml  frontend service for local development
components.json      shadcn/ui configuration

## Common commands

```bash
docker compose up                 # start the frontend
docker compose up --build         # rebuild (after dependency changes)
docker compose down               # stop and remove the container
docker compose logs -f frontend   # tail the logs

# Add a shadcn/ui component (run via a throwaway Node container):
docker run --rm -it -v "$PWD":/app -w /app node:20-slim npx shadcn@latest add button
```

## Adding UI components

We use [shadcn/ui](https://ui.shadcn.com). Components are added into
`src/components/ui/` and owned by us (not a runtime dependency), so they can be
styled freely. Example: `npx shadcn@latest add button`.

## Troubleshooting

- **Status page shows "Could not reach the backend"** — the backend isn't
  running, or CORS isn't allowing this origin. Start the backend, and ensure its
  `.env` has `CORS_ALLOWED_ORIGINS=http://localhost:3000`.
- **Port 3000 already in use** — another app is using it. Stop that app, or
  change the host port in `docker-compose.yml` (e.g. `"3001:3000"`).
- **Module not found errors on start** — the container's `node_modules` was
  clobbered. Rebuild with `docker compose up --build`.

## Conventions

See the team's **Engineering Conventions** doc in Notion. In short: trunk-based
branches named `fro-<id>-<summary>`, Conventional Commits, and every PR links
its Linear issue with `Closes FRO-XX`.
