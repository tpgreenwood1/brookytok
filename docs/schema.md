# Database Schema

## Overview

```
User ──< Post ──< Media
User ──< Follow ──> User
```

## Models

### Post

```prisma
model Post {
  id        String   @id @default(cuid())
  content   String   @db.VarChar(280)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authorId  String
  author    User     @relation(...)
  media     Media[]
}
```

- `content` is required (1–280 characters).
- `media` is optional — zero or many items.

### Media

```prisma
model Media {
  id              String   @id @default(cuid())
  postId          String
  post            Post     @relation(...)

  url             String        // Public CDN URL served to clients
  objectKey       String @unique // R2 object key (e.g. media/posts/{uid}/{uuid})

  mediaType       String        // "image" | "video"
  mimeType        String        // e.g. "image/jpeg", "video/mp4"
  fileName        String        // Original filename (display only)
  fileSize        Int           // Bytes

  width           Int?          // Pixels (images + videos)
  height          Int?          // Pixels (images + videos)
  durationSeconds Float?        // Videos only

  createdAt       DateTime @default(now())
}
```

### Constraints

| Field | Constraint |
|---|---|
| `objectKey` | Unique — each upload gets a distinct UUID path |
| `mediaType` | `"image"` or `"video"` |
| `mimeType` | One of the 7 supported MIME types |
| `fileSize` | Enforced by upload validation (10 MB images, 50 MB videos) |
| `width`, `height`, `durationSeconds` | Optional; populated from client-side introspection |

## Migration

```bash
npx prisma migrate dev --name add-media
```

Prisma generates SQL equivalent to:

```sql
-- Add media[] relation to Post (no schema change needed, handled by FK)

CREATE TABLE "media" (
  "id"              TEXT NOT NULL,
  "postId"          TEXT NOT NULL,
  "url"             TEXT NOT NULL,
  "objectKey"       TEXT NOT NULL,
  "mediaType"       TEXT NOT NULL,
  "mimeType"        TEXT NOT NULL,
  "fileName"        TEXT NOT NULL,
  "fileSize"        INTEGER NOT NULL,
  "width"           INTEGER,
  "height"          INTEGER,
  "durationSeconds" DOUBLE PRECISION,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_objectKey_key" ON "media"("objectKey");
CREATE INDEX "media_postId_idx" ON "media"("postId");

ALTER TABLE "media" ADD CONSTRAINT "media_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```
