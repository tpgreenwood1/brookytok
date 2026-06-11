# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                │
│                                                                 │
│  ┌──────────────┐    ┌────────────────────────────────────────┐ │
│  │ PostComposer │    │            Feed / Profile              │ │
│  │              │    │                                        │ │
│  │ • Select file│    │  PostCard                              │ │
│  │ • Drag & drop│    │  ├── text content                      │ │
│  │ • XHR upload │    │  └── MediaGrid                         │ │
│  │   with prog. │    │       ├── <img> (images)               │ │
│  │ • Attach key │    │       └── <video controls> (video)     │ │
│  └──────┬───────┘    └────────────────────────────────────────┘ │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          │ 1. POST /api/media/upload-url
          │    { fileName, contentType, fileSize }
          │
          ▼
┌─────────────────────────────┐
│       Next.js Server        │
│   (Vercel serverless fn)    │
│                             │
│  • Validates type + size    │
│  • Generates object key     │
│    media/posts/{uid}/{uuid} │
│  • Signs PutObjectCommand   │
│    (expires in 5 min)       │
│  • Returns:                 │
│    - uploadUrl (presigned)  │
│    - objectKey              │
│    - mediaUrl (public CDN)  │
└──────────────┬──────────────┘
               │
               │ Returns presigned URL + object key
               │
               ▼
┌─────────────────────────────────┐
│           Browser               │
│                                 │
│  2. PUT <uploadUrl>             │
│     Content-Type: image/jpeg    │
│     Body: <binary file data>    │
│     (XHR with progress events)  │
└──────────────┬──────────────────┘
               │
               │ Direct browser → R2 upload (server not involved)
               │
               ▼
┌─────────────────────────────┐
│       Cloudflare R2         │
│                             │
│  Bucket: brooky-tok-media   │
│  Path: media/posts/{uid}/   │
│        {uuid}               │
│                             │
│  Publicly readable via      │
│  R2_PUBLIC_URL              │
└─────────────────────────────┘
               │
               │ 3. User submits post
               │    POST /api/posts (server action)
               │    { content, media: [{ objectKey, mediaUrl, ... }] }
               │
               ▼
┌─────────────────────────────┐
│       Next.js Server        │
│                             │
│  • Validates ownership:     │
│    objectKey must start     │
│    with media/posts/{uid}/  │
│  • Creates Post + Media     │
│    records in a single      │
│    Prisma transaction       │
│  • Revalidates feed cache   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     Neon PostgreSQL         │
│                             │
│  post { id, content, ... }  │
│  └── media[] {              │
│        url (CDN URL)        │
│        objectKey            │
│        mediaType            │
│        mimeType, size, ...  │
│      }                      │
└─────────────────────────────┘
```

## Storage Layer

```
lib/storage/
├── r2.ts        S3Client factory, bucket helpers, public URL builder
└── upload.ts    Allowed types, size limits, validation, key generation,
                 presigned URL generation
```

All storage logic is consolidated here. Avatar and banner uploads (future)
use the same `generateObjectKey` and `generatePresignedUploadUrl` utilities
with a different prefix (`media/avatars/`, `media/banners/`).

## Data Model

```
User ──< Post ──< Media
```

- A `Post` may have zero or many `Media` records.
- `Media` stores only metadata — binary data lives exclusively in R2.
- `objectKey` is unique: collision-resistant UUID path, user-scoped.

## Security Model

| Concern | Mitigation |
|---|---|
| Credential exposure | R2 credentials are server-only env vars, never sent to browser |
| Upload ownership | `objectKey` must start with `media/posts/{authenticatedUserId}/` — validated server-side on post creation |
| Presigned URL expiry | URLs expire in 5 minutes (`expiresIn: 300`) |
| MIME type enforcement | Validated both client-side (fast UX) and server-side (security) |
| File size enforcement | Validated both client-side and server-side |
| Attachment limit | Max 4 per post, enforced client-side and server-side |

## Extensibility Notes

The architecture is intentionally minimal today but leaves clear seams for:

| Future feature | Where to add |
|---|---|
| Image resizing / thumbnails | Post-upload webhook or background job reading R2 events |
| Video transcoding | Same pattern — trigger on upload, write transcoded key back to `Media` |
| Content moderation / NSFW | Middleware on `Media` creation; add `moderationStatus` field |
| Virus scanning | Pre-publish step; hold media in a staging prefix until scanned |
| CDN optimization | Swap `R2_PUBLIC_URL` for a Cloudflare cache zone or Image Resizing URL |
| User reporting | New `Report` model referencing `Media.id` or `Post.id` |
