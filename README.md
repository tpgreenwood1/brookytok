# brooky-tok

A production-quality Twitter-like social platform built with Next.js 15, BetterAuth, Prisma, and PostgreSQL.

## Features

- Sign up / sign in / sign out
- Create text posts (280 characters max)
- Global reverse-chronological feed
- User profiles with bio, stats, and post history
- Follow / unfollow other users
- Mobile responsive layout

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | BetterAuth |
| ORM | Prisma |
| Database | PostgreSQL |
| Hosting | Vercel + Neon |

---

## Local Development

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/brooky-tok.git
cd brooky-tok
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/brookytok"
BETTER_AUTH_SECRET="<generate with: openssl rand -hex 32>"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Start the database

```bash
docker compose up -d
```

Wait for the health check to pass (a few seconds), then:

### 4. Run database migrations

```bash
npm run db:migrate
# Enter migration name when prompted: init
```

### 5. (Optional) Seed with sample data

```bash
npm run db:seed
```

This creates 5 users (`alice`, `bob`, `carol`, `dave`, `eve`) with password `password123` and sample posts.

### 6. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). You'll be redirected to the sign-in page.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

---

## Project Structure

```
brooky-tok/
├── app/                     # Next.js App Router pages and API routes
│   ├── api/auth/[...all]/   # BetterAuth handler
│   ├── api/posts/           # POST /api/posts
│   ├── api/feed/            # GET /api/feed
│   ├── api/users/[username] # GET /api/users/[username]
│   ├── api/follow/          # POST/DELETE /api/follow
│   ├── signin/              # Sign-in page
│   ├── signup/              # Sign-up page
│   └── [username]/          # User profile page
├── components/              # React components
│   ├── ui/                  # Base UI primitives (Button, Input, Avatar)
│   ├── layout/              # Shell, Sidebar, BottomNav
│   ├── post/                # PostCard, PostList, PostComposer
│   └── user/                # ProfileHeader, FollowButton
├── lib/                     # Shared utilities
│   ├── auth.ts              # BetterAuth server instance
│   ├── auth-client.ts       # BetterAuth client instance
│   ├── prisma.ts            # Prisma singleton
│   └── utils.ts             # cn(), formatDate(), etc.
├── server/                  # Server-side business logic
│   ├── actions/             # Server actions (createPost, followUser)
│   └── queries/             # Database queries (getFeed, getUserByUsername)
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
└── types/                   # Shared TypeScript types
```

---

## REST API Reference

All endpoints return JSON. Authentication uses the BetterAuth session cookie.

### POST /api/posts
Create a new post. Requires authentication.

**Body:** `{ "content": "string (max 280 chars)" }`

**Response:** `201 Created` with the created post object.

### GET /api/feed
Fetch posts in reverse chronological order.

**Query params:**
- `cursor` (optional) — last post ID for pagination
- `limit` (optional, default `20`, max `50`)

**Response:** Array of posts with author info.

### GET /api/users/[username]
Get a user's profile, posts, and follow status.

**Response:** `{ user, posts, isFollowing }`

### POST /api/follow
Follow a user. Requires authentication.

**Body:** `{ "username": "string" }`

### DELETE /api/follow
Unfollow a user. Requires authentication.

**Body:** `{ "username": "string" }`

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production deployment instructions.
