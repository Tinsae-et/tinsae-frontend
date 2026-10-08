# tinsae-frontend

Frontend for **Tinsae** — a verified electronics marketplace for Bole, Addis Ababa.
Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui, containerized with Docker.

## Prerequisites

You only need these installed on your machine:

- **Docker** (with Compose v2.22.0 or newer — `docker compose version` should work)
- **Git**

Node.js runs **inside the container** — you do not need it installed on your host.
(Installing Node locally is optional; Next.js requires Node ≥ 20.9 if you run it on the host.)

## Important: the backend must be running

This frontend talks to the **tinsae-backend** API. Before starting the frontend,
make sure the backend is running and healthy:

```bash
# in the tinsae-backend repo:
docker compose up
# verify: curl http://localhost:8000/api/health/  ->  {"status":"ok","database":"ok"}
```

To see real product data, seed the catalog (products need `last_confirmed_at` set to appear as fresh):

```bash
# in the tinsae-backend repo (inside its container):
docker compose exec backend python manage.py seed_catalog
docker compose exec backend python manage.py seed_shop_data
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
docker compose watch
```

The app is then live at **http://localhost:3000**.

You should see the **Tinsae home page**: the marketing landing (hero, categories,
freshest listings), with a header that lets you search and browse.

## Routes

| Route       | What it is                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`         | Home / landing — hero, browse-by-category, top shops, freshest listings grid, trust & explainer sections                                   |
| `/products` | Browse all listings — responsive product grid with skeletons, empty state, and infinite scroll. Supports `?category=<slug>`, `?q=<search>` |
| `/shop/dashboard/shop-profile` | Shop settings — edit shop name, city, description, and contact phone; surfaces Telegram link and verification status       |
| `/health`   | Backend system-status check (old status page)                                                                                              |

### Stable URLs & Slug Policy (TIN-40)

Shop URL slugs (`/shops/[slug]`) are immutable after shop registration and **do not regenerate upon rename**. This ensures:
- Bookmarks, shared links, and printed QR codes remain active.
- Telegram deep links and bot routing remain stable without broken link errors.
- Search engine indexing for shop pages is preserved without complex redirects.


## How it runs

`docker compose watch` starts one container and watches the frontend files:

- **`frontend`** — the Next.js dev server (Node 20).

Source edits sync into the container and **hot-reload** the page in the browser.
Changes to `package.json` or `package-lock.json` rebuild the image automatically;
`node_modules` and `.next` are excluded from source sync. You can use
`docker compose up --build` for a one-off rebuild when the Docker setup changes.

## Configuration

Settings come from environment variables (see `.env.example`). The real
`.env.local` is git-ignored and must never be committed.

| Variable              | Purpose                                                     | Local value                        |
| --------------------- | ----------------------------------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL for **browser** code                   | `http://localhost:8000`            |
| `API_INTERNAL_URL`    | Backend API base URL for **server-side** code (Docker only) | `http://host.docker.internal:8000` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JS API key for the shop profile map (optional) | your restricted dev key |

The `NEXT_PUBLIC_` prefix makes a value available to browser-side code.

**Why `API_INTERNAL_URL`?** The dev server runs _inside_ the frontend container,
so `localhost` there is the container itself — it can't reach the backend on
the host. The compose file maps `host.docker.internal` to the host gateway and
sets `API_INTERNAL_URL`, which `src/lib/api.ts` uses for server-side (SSR)
fetches. The browser keeps using `NEXT_PUBLIC_API_URL` (`localhost:8000` works
from the user's machine). For this to work, the backend's dev settings must
allow the `host.docker.internal` host (it does in `config/settings/dev.py`).

## Project structure

```
src/
├── app/
│   ├── layout.tsx       root layout (fonts, metadata, header + footer)
│   ├── page.tsx         home / landing page
│   ├── products/        browse-all page (grid + infinite scroll)
│   ├── health/          backend status check
│   ├── icon.svg         tab/favicon (Tinsae mark)
│   └── globals.css      Tailwind theme + Tinsae design tokens
├── components/
│   ├── home/            landing sections (hero, categories, shops, freshest…)
│   ├── layout/          site header (nav, mega-menu, drawer) + footer
│   ├── products/        product card, grid, infinite scroll
│   ├── tinsae/          design-system primitives (pill, icon, badge, placeholder)
│   └── ui/              shadcn/ui components
└── lib/
    ├── api.ts           backend API client (dual-context base URL)
    ├── format.ts        ETB money + freshness helpers
    ├── nav-categories.ts
    ├── types.ts         backend API types
    └── utils.ts         shadcn utility helper
```

## Common commands

```bash
docker compose watch              # start the frontend with fast refresh
docker compose up                 # start the frontend without file watching
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

- **Home page shows empty product sections / "No confirmed listings"** — the
  backend isn't seeded, or no product has `last_confirmed_at` within the last
  30 days. Run the seed commands above.
- **Server-rendered data fails but the browser works (Docker)** — the container
  can't reach the backend; `API_INTERNAL_URL` / `host.docker.internal` isn't set
  up (see Configuration), or the backend's `ALLOWED_HOSTS` doesn't include
  `host.docker.internal`.
- **Port 3000 already in use** — another app is using it. Stop that app, or
  change the host port in `docker-compose.yml` (e.g. `"3001:3000"`).
- **Module not found errors on start** — the container's `node_modules` was
  clobbered. Rebuild with `docker compose up --build`.

## Conventions

See the team's **Engineering Conventions** doc in Notion. In short: trunk-based
branches named `fro-<id>-<summary>`, Conventional Commits, and every PR links
its Linear issue with `Closes FRO-XX`.
