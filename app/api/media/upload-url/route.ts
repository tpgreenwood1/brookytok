import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  validateUpload,
  generateObjectKey,
  generatePresignedUploadUrl,
} from "@/lib/storage/upload";
import { getR2PublicUrl } from "@/lib/storage/r2";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { fileName?: unknown; contentType?: unknown; fileSize?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const fileName =
    typeof body.fileName === "string" ? body.fileName.trim() : null;
  const contentType =
    typeof body.contentType === "string" ? body.contentType.trim() : null;
  const fileSize =
    typeof body.fileSize === "number" && Number.isFinite(body.fileSize)
      ? body.fileSize
      : null;

  if (!fileName || !contentType || fileSize === null) {
    return NextResponse.json(
      { error: "fileName, contentType, and fileSize are required" },
      { status: 400 }
    );
  }

  if (fileSize <= 0) {
    return NextResponse.json({ error: "fileSize must be positive" }, { status: 400 });
  }

  const validation = validateUpload(contentType, fileSize);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 422 });
  }

  const objectKey = generateObjectKey("media/posts", session.user.id);

  let uploadUrl: string;
  try {
    uploadUrl = await generatePresignedUploadUrl({
      objectKey,
      contentType,
      fileSize,
    });
  } catch (err) {
    console.error("[upload-url] Failed to generate presigned URL:", err);
    return NextResponse.json(
      { error: "Storage service unavailable" },
      { status: 503 }
    );
  }

  const mediaUrl = getR2PublicUrl(objectKey);

  return NextResponse.json({ uploadUrl, objectKey, mediaUrl });
}
