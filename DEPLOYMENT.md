# Deployment Guide

This guide covers deploying brooky-tok to production using:
- **Vercel** for the Next.js application
- **Neon** for the PostgreSQL database
- **GitHub** for source control and CI/CD

---

## Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free tier works)
- A [Neon](https://neon.tech) account (free tier works)

---

## Step 1: Push to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on GitHub (do not initialize with README), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/brooky-tok.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create a Neon Database

1. Sign in to [neon.tech](https://neon.tech) and create a new project.
2. Name it `brooky-tok`.
3. Select a region close to your users (e.g., `us-east-1`).
4. After creation, go to **Connection Details** and copy the **Connection string** (it looks like `postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require`).

> **Important:** Add `?sslmode=require` to the end of the URL if not already present.

---

## Step 3: Run Migrations on Neon

On your local machine, temporarily point at the Neon database to run the initial migration:

```bash
# Backup your local .env first, then set Neon DATABASE_URL:
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/brookytok?sslmode=require" \
  npx prisma migrate deploy
```

Or update your `.env` temporarily and run:

```bash
npm run db:migrate
```

> Do **not** seed production with the dev seed script. Create a real account through the UI instead.

---

## Step 4: Generate a BetterAuth Secret

```bash
openssl rand -hex 32
```

Save the output — this is your `BETTER_AUTH_SECRET`.

---

## Step 5: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. Vercel will auto-detect Next.js. Leave the build settings as-is (`vercel.json` handles them).
3. Under **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `BETTER_AUTH_SECRET` | The 32-byte hex string from Step 4 |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

4. Click **Deploy**.

---

## Step 6: Update BETTER_AUTH_URL After Deployment

After the first deploy, Vercel assigns a URL (e.g., `https://brooky-tok.vercel.app`). Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to match this URL, then redeploy.

To redeploy without code changes, click **Redeploy** in the Vercel dashboard, or push an empty commit:

```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

---

## CI/CD

Once GitHub is connected to Vercel:

- Every push to `main` triggers a production deployment.
- Every pull request gets a preview deployment with a unique URL.
- `vercel.json` sets `buildCommand` to `prisma generate && next build`, ensuring the Prisma client is always regenerated on Vercel's build servers.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Random secret for session signing (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Base URL of your deployed app (no trailing slash) |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `BETTER_AUTH_URL` — exposed to the browser |

---

## Neon Database Tips

- **Branching:** Neon supports database branches. Create a `dev` branch to safely test schema changes without affecting production data.
- **Connection pooling:** For production workloads, use Neon's pooled connection string (shown as "Connection string (pooled)" in the dashboard) to handle concurrent serverless connections efficiently.
- **Backups:** Neon provides point-in-time restore on paid plans.

---

## Troubleshooting

**"Invalid DATABASE_URL" on Vercel build**
- Ensure the Neon connection string includes `?sslmode=require`.
- Check that the variable is set in Vercel for the correct environment (Production / Preview / Development).

**BetterAuth CSRF errors in production**
- Verify `BETTER_AUTH_URL` matches your exact production domain (including `https://`).
- No trailing slash.

**Prisma client not found on Vercel**
- `vercel.json` sets `buildCommand` to `prisma generate && next build`. If you override this, ensure `prisma generate` runs before `next build`.

**Posts not appearing after creating them**
- This is usually a caching issue in development. Hard-refresh the page or clear the Next.js cache with `rm -rf .next`.
