# Vercel Deployment Guide

## Prerequisites

- A Vercel account
- A Neon PostgreSQL database
- Cloudflare R2 configured (see [cloudflare-r2-setup.md](./cloudflare-r2-setup.md))

## Deploy

### 1. Connect the repository

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your Git repository.
3. Framework preset: **Next.js** (auto-detected).

### 2. Configure environment variables

In the Vercel project settings → **Environment Variables**, add:

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon connection string (use the pooled connection for serverless) |
| `BETTER_AUTH_SECRET` | A secure random string |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public bucket URL (custom domain or r2.dev) |

> **Neon tip**: Use the **pooled** connection string (`?pgbouncer=true&connection_limit=1`) to avoid connection exhaustion in serverless environments.

### 3. Run the database migration

After the first deploy, run the migration against your Neon database:

```bash
# Locally, pointing at the production DB
DATABASE_URL="<neon-connection-string>" npx prisma migrate deploy
```

Or use Neon's built-in migration tooling.

### 4. Redeploy

Trigger a redeployment to pick up the new environment variables.

## R2 CORS for Production

Update your R2 bucket CORS policy to include the production origin:

```json
[
  {
    "AllowedOrigins": ["https://your-app.vercel.app"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "MaxAgeSeconds": 3000
  }
]
```

## Notes

- The Next.js app server **never proxies uploads** — the browser uploads directly to R2. Vercel's 4.5 MB body size limit does not affect media uploads.
- Presigned URLs expire after 5 minutes (`expiresIn: 300` in `lib/storage/upload.ts`). Adjust as needed.
