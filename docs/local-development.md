# Local Development Guide

## Prerequisites

- Node.js 18+
- PostgreSQL (local or Docker)
- A Cloudflare account with R2 configured (see [cloudflare-r2-setup.md](./cloudflare-r2-setup.md))

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd brooky-tok
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in all values. For local development:
- `DATABASE_URL` — local PostgreSQL connection string
- `BETTER_AUTH_SECRET` — generate with `openssl rand -hex 32`
- `BETTER_AUTH_URL` — `http://localhost:3000`
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000`
- R2 variables — from your Cloudflare dashboard (see setup guide)

> **No R2 yet?** You can run the app without R2 — posts with media will fail to upload but the rest of the app works. Set the R2 variables to placeholder values to prevent startup errors.

### 3. Run database migrations

```bash
npm run db:migrate
```

This creates the `post`, `media`, `user`, `session`, `account`, `verification`, and `follow` tables.

### 4. (Optional) Seed test data

```bash
npm run db:seed
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## R2 CORS for Local Development

Add `http://localhost:3000` to your R2 bucket's CORS `AllowedOrigins` (see setup guide). Without this, presigned PUT uploads will fail with a CORS error.

## Prisma Studio

To browse the database visually:

```bash
npm run db:studio
```

## Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema without migration file |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed test users and posts |
