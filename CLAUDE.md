# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint

npm run db:migrate   # Run Prisma migrations (prompts for migration name)
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:seed      # Seed with 5 test users (alice/bob/carol/dave/eve, password: password123)
npm run db:studio    # Open Prisma Studio
```

Local database requires Docker:
```bash
docker compose up -d   # Start PostgreSQL on port 5432
```

## Architecture

**Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS · BetterAuth · Prisma · PostgreSQL · Cloudflare R2

### Auth

BetterAuth is configured in `lib/auth.ts` (server) and `lib/auth-client.ts` (client). It uses the `username` plugin so users authenticate by username. Additional fields (`displayName`, `bio`) are declared in the BetterAuth config and synced to the Prisma `User` model.

The middleware (`middleware.ts`) runs on the Edge Runtime and checks session cookies directly — it intentionally avoids importing `lib/auth.ts` because that module pulls in Node.js-incompatible code.

### Data layer

- `server/queries/` — read-only Prisma queries (`getFeed`, `getFollowingFeed`, `getUserByUsername`, etc.)
- `server/actions/` — Next.js Server Actions (`createPost`, `followUser`, `unfollowUser`)
- API routes under `app/api/` call the same queries/actions from REST handlers

### Media uploads (Cloudflare R2)

Upload flow is client-initiated with server-issued presigned URLs:

1. Client calls `POST /api/media/upload-url` with `{ fileName, contentType, fileSize }`
2. Server validates, generates a user-scoped object key (`media/posts/{userId}/{uuid}`), and returns a presigned PUT URL
3. Client uploads directly to R2 using the presigned URL
4. Client submits the post via the `createPost` server action, passing `MediaAttachment[]` with the object keys
5. Server re-validates that each key is scoped to the authenticated user before writing `Media` rows

`lib/storage/upload.ts` holds all type/size constants and validation helpers. `lib/storage/r2.ts` holds the S3-compatible R2 client.

### Key type: `PostWithAuthor`

Defined in `types/`, this is the return type for all feed and profile queries — a Prisma `Post` with `author` (partial `User`) and `media: Media[]` included.

## Environment variables

See `.env.example`. Required: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`. R2 variables (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`) are needed for media uploads but the app works without them if media features are unused.

## Deployment

Hosted on Vercel + Neon. `vercel.json` overrides the build command to `prisma generate && next build` so the Prisma client is regenerated on Vercel's build servers. See `DEPLOYMENT.md` for full instructions.
