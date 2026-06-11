import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isAllowedMediaType,
  getMediaCategory,
  MAX_ATTACHMENTS_PER_POST,
} from "@/lib/storage/upload";

// Shape expected for each media item in the request body
interface MediaInput {
  objectKey: string;
  url: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
}

function parseMediaItem(
  item: unknown,
  userId: string
): { data: MediaInput } | { error: string } {
  if (typeof item !== "object" || item === null) {
    return { error: "Each media item must be an object" };
  }

  const m = item as Record<string, unknown>;

  if (
    typeof m.objectKey !== "string" ||
    typeof m.url !== "string" ||
    typeof m.mimeType !== "string" ||
    typeof m.fileName !== "string" ||
    typeof m.fileSize !== "number"
  ) {
    return { error: "Media item missing required fields" };
  }

  // Security: objectKey must belong to the authenticated user
  if (!m.objectKey.startsWith(`media/posts/${userId}/`)) {
    return { error: "Invalid media reference" };
  }

  if (!isAllowedMediaType(m.mimeType)) {
    return { error: `Unsupported media type: ${m.mimeType}` };
  }

  return {
    data: {
      objectKey: m.objectKey,
      url: m.url,
      mimeType: m.mimeType,
      fileName: m.fileName,
      fileSize: m.fileSize,
      width: typeof m.width === "number" ? m.width : undefined,
      height: typeof m.height === "number" ? m.height : undefined,
      durationSeconds:
        typeof m.durationSeconds === "number" ? m.durationSeconds : undefined,
    },
  };
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { content?: unknown; media?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  const rawMedia = Array.isArray(body.media) ? body.media : [];
  if (!content && rawMedia.length === 0) {
    return NextResponse.json(
      { error: "Post must have text or media" },
      { status: 400 }
    );
  }
  if (content.length > 280) {
    return NextResponse.json(
      { error: "Post exceeds 280 characters" },
      { status: 400 }
    );
  }
  if (rawMedia.length > MAX_ATTACHMENTS_PER_POST) {
    return NextResponse.json(
      { error: `Maximum ${MAX_ATTACHMENTS_PER_POST} media items per post` },
      { status: 400 }
    );
  }

  const validatedMedia: MediaInput[] = [];
  for (const item of rawMedia) {
    const result = parseMediaItem(item, session.user.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    validatedMedia.push(result.data);
  }

  const post = await prisma.post.create({
    data: {
      content,
      authorId: session.user.id,
      media: {
        create: validatedMedia.map((m) => ({
          url: m.url,
          objectKey: m.objectKey,
          mediaType: getMediaCategory(m.mimeType),
          mimeType: m.mimeType,
          fileName: m.fileName,
          fileSize: m.fileSize,
          width: m.width ?? null,
          height: m.height ?? null,
          durationSeconds: m.durationSeconds ?? null,
        })),
      },
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          name: true,
          image: true,
        },
      },
      media: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
