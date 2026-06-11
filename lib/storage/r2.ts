import { S3Client } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// Returns an S3Client configured for Cloudflare R2.
// Called lazily so the module can be imported without crashing at startup
// when env vars aren't yet configured (e.g. during `prisma generate`).
export function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function getR2BucketName(): string {
  return requireEnv("R2_BUCKET_NAME");
}

// Builds the public URL for a stored object.
// R2_PUBLIC_URL is the bucket's public domain (custom domain or r2.dev subdomain).
export function getR2PublicUrl(objectKey: string): string {
  const base = requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");
  return `${base}/${objectKey}`;
}
