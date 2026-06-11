# Upload Flow — Sequence Diagram

```
Browser                Next.js Server              Cloudflare R2          Neon PostgreSQL
   │                        │                            │                       │
   │  1. User selects file  │                            │                       │
   │  ──────────────────►   │                            │                       │
   │  Validate client-side  │                            │                       │
   │  (type + size)         │                            │                       │
   │                        │                            │                       │
   │  2. POST /api/media/upload-url                      │                       │
   │     { fileName,        │                            │                       │
   │       contentType,     │                            │                       │
   │       fileSize }       │                            │                       │
   │  ─────────────────────►│                            │                       │
   │                        │  Validate type + size      │                       │
   │                        │  Generate object key       │                       │
   │                        │  media/posts/{uid}/{uuid}  │                       │
   │                        │  Sign PutObjectCommand     │                       │
   │                        │  (expires 5 min)           │                       │
   │  { uploadUrl,          │                            │                       │
   │    objectKey,          │                            │                       │
   │    mediaUrl }          │                            │                       │
   │  ◄─────────────────────│                            │                       │
   │                        │                            │                       │
   │  3. PUT <uploadUrl>                                  │                       │
   │     Content-Type: …    │                            │                       │
   │     Body: <file bytes> │                            │                       │
   │  ──────────────────────────────────────────────────►│                       │
   │  (XHR progress events) │                            │  Store object         │
   │                        │                            │  200 OK               │
   │  ◄──────────────────────────────────────────────────│                       │
   │                        │                            │                       │
   │  ┌────────────────────────────────────────────────┐ │                       │
   │  │  Repeat steps 1–3 for each file in parallel    │ │                       │
   │  └────────────────────────────────────────────────┘ │                       │
   │                        │                            │                       │
   │  4. User clicks "Post" │                            │                       │
   │                        │                            │                       │
   │  5. createPost() server action                      │                       │
   │     { content,         │                            │                       │
   │       media: [{        │                            │                       │
   │         objectKey,     │                            │                       │
   │         url,           │                            │                       │
   │         mimeType, …    │                            │                       │
   │       }] }             │                            │                       │
   │  ─────────────────────►│                            │                       │
   │                        │  Validate ownership        │                       │
   │                        │  (objectKey prefix check)  │                       │
   │                        │  prisma.post.create({      │                       │
   │                        │    media: { create: […] }  │                       │
   │                        │  })                        │                       │
   │                        │  ─────────────────────────────────────────────────►│
   │                        │                            │  INSERT post + media  │
   │                        │                            │  ◄─────────────────── │
   │                        │  revalidatePath("/")       │                       │
   │  { success: true }     │                            │                       │
   │  ◄─────────────────────│                            │                       │
   │                        │                            │                       │
   │  6. Feed re-renders    │                            │                       │
   │  with media in posts   │                            │                       │
```

## Key Properties

- The **application server never touches upload bytes** — the browser streams directly to R2.
- **Multiple files upload in parallel** — each fires an independent presign request and XHR.
- The **post is not created until all uploads succeed** — the submit button is disabled while uploads are in progress.
- **Ownership is enforced server-side** at post creation time, not just on the client.
- If a user navigates away mid-upload, orphaned R2 objects accumulate. A future lifecycle rule on the bucket can clean objects older than N days that have no corresponding DB record.
