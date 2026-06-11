import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getR2BucketName } from "./r2";

// ── Allowed types ─────────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const ALLOWED_MEDIA_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
export type AllowedVideoType = (typeof ALLOWED_VIDEO_TYPES)[number];
export type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

// ── Size limits ───────────────────────────────────────────────────────────────

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_ATTACHMENTS_PER_POST = 4;

// ── Type guards ───────────────────────────────────────────────────────────────

export function isAllowedMediaType(type: string): type is AllowedMediaType {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(type);
}

export function isImageType(type: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

export function isVideoType(type: string): boolean {
  return (ALLOWED_VIDEO_TYPES as readonly string[]).includes(type);
}

export function getMediaCategory(mimeType: string): "image" | "video" {
  return isImageType(mimeType) ? "image" : "video";
}

export function getMaxFileSize(mimeType: string): number {
  return isImageType(mimeType) ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUpload(
  mimeType: string,
  fileSize: number
): UploadValidationResult {
  if (!isAllowedMediaType(mimeType)) {
    return {
      valid: false,
      error: `Unsupported file type "${mimeType}". Allowed: JPEG, PNG, WebP, GIF, MP4, WebM, MOV.`,
    };
  }
  const maxBytes = getMaxFileSize(mimeType);
  if (fileSize > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size for this type is ${maxMb} MB.`,
    };
  }
  return { valid: true };
}

// ── Object key generation ─────────────────────────────────────────────────────

export type StoragePrefix =
  | "media/posts"
  | "media/avatars"
  | "media/banners";

// Generates a collision-resistant, user-scoped object key.
// Example: media/posts/clxyz.../550e8400-e29b-41d4-a716-446655440000
export function generateObjectKey(
  prefix: StoragePrefix,
  userId: string
): string {
  return `${prefix}/${userId}/${crypto.randomUUID()}`;
}

// ── Presigned URL ─────────────────────────────────────────────────────────────

export interface PresignedUploadParams {
  objectKey: string;
  contentType: string;
  fileSize: number;
  /** Expiry in seconds. Defaults to 5 minutes. */
  expiresIn?: number;
}

export async function generatePresignedUploadUrl(
  params: PresignedUploadParams
): Promise<string> {
  const { objectKey, contentType, fileSize, expiresIn = 300 } = params;

  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: objectKey,
    ContentType: contentType,
    ContentLength: fileSize,
  });

  return getSignedUrl(getR2Client(), command, { expiresIn });
}
