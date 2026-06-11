"use client";

import { useRef, useState, useTransition, useCallback } from "react";
import { Image as ImageIcon, Video } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createPost, type MediaAttachment } from "@/server/actions/post.actions";
import {
  MediaAttachmentPreview,
  type Attachment,
} from "@/components/media/media-attachment-preview";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_ATTACHMENTS_PER_POST,
  validateUpload,
} from "@/lib/storage/upload";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

const MAX_CHARS = 280;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function readDimensions(
  file: File
): Promise<{ width?: number; height?: number; durationSeconds?: number }> {
  return new Promise((resolve) => {
    if (file.type.startsWith("image/")) {
      const img = new window.Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({});
      img.src = URL.createObjectURL(file);
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () =>
        resolve({
          width: video.videoWidth || undefined,
          height: video.videoHeight || undefined,
          durationSeconds: video.duration || undefined,
        });
      video.onerror = () => resolve({});
      video.src = URL.createObjectURL(file);
    } else {
      resolve({});
    }
  });
}

// Uploads a file directly to R2 via a presigned PUT URL using XHR so we can
// track upload progress.
function uploadToR2(
  uploadUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`R2 upload failed: HTTP ${xhr.status}`));
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PostComposer() {
  const { data: session } = authClient.useSession();
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Upload logic ────────────────────────────────────────────────────────
  // useCallback must be declared before the early return below

  const processFiles = useCallback(
    async (files: File[]) => {
      const remaining = MAX_ATTACHMENTS_PER_POST - attachments.length;
      const toProcess = files.slice(0, remaining);

      if (toProcess.length === 0) {
        setError(`Maximum ${MAX_ATTACHMENTS_PER_POST} attachments per post`);
        return;
      }

      for (const file of toProcess) {
        const validation = validateUpload(file.type, file.size);
        if (!validation.valid) {
          setError(validation.error ?? "Invalid file");
          continue;
        }

        const id = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);
        const dims = await readDimensions(file);

        const attachment: Attachment = {
          id,
          file,
          previewUrl,
          status: "uploading",
          progress: 0,
          ...dims,
        };

        setAttachments((prev) => [...prev, attachment]);

        // Fire-and-forget per attachment so multiple uploads run in parallel
        (async () => {
          try {
            // 1. Request presigned URL
            const res = await fetch("/api/media/upload-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size,
              }),
            });

            if (!res.ok) {
              const { error: apiError } = await res.json().catch(() => ({}));
              throw new Error(apiError ?? "Failed to get upload URL");
            }

            const { uploadUrl, objectKey, mediaUrl } = await res.json();

            // 2. Upload directly to R2
            await uploadToR2(uploadUrl, file, (pct) => {
              setAttachments((prev) =>
                prev.map((a) => (a.id === id ? { ...a, progress: pct } : a))
              );
            });

            // 3. Mark done
            setAttachments((prev) =>
              prev.map((a) =>
                a.id === id
                  ? { ...a, status: "done", progress: 100, objectKey, mediaUrl }
                  : a
              )
            );
          } catch (err) {
            setAttachments((prev) =>
              prev.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      status: "error",
                      error:
                        err instanceof Error ? err.message : "Upload failed",
                    }
                  : a
              )
            );
          }
        })();
      }
    },
    [attachments.length]
  );

  // Guard: render nothing until session is loaded
  if (!session) return null;

  const user = session.user as unknown as SessionUser;
  const displayName = user.displayName ?? user.name;
  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const hasContent = content.trim().length > 0;
  const doneAttachments = attachments.filter((a) => a.status === "done");
  const pendingAttachments = attachments.filter((a) => a.status === "uploading");
  const canPost =
    hasContent && !isOverLimit && !isPending && pendingAttachments.length === 0;

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) processFiles(files);
    // Reset so the same file can be re-selected after removal
    e.target.value = "";
  }

  function handleRemove(id: string) {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att) URL.revokeObjectURL(att.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }

  // ── Drag and drop ───────────────────────────────────────────────────────

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) processFiles(files);
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canPost) return;
    setError(null);

    const mediaPayload: MediaAttachment[] = doneAttachments.map((a) => ({
      objectKey: a.objectKey!,
      url: a.mediaUrl!,
      mimeType: a.file.type,
      fileName: a.file.name,
      fileSize: a.file.size,
      width: a.width,
      height: a.height,
      durationSeconds: a.durationSeconds,
    }));

    startTransition(async () => {
      const result = await createPost(content, mediaPayload);
      if (result.error) {
        setError(result.error);
      } else {
        setContent("");
        // Clean up blob URLs
        attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
        setAttachments([]);
      }
    });
  }

  const atMaxAttachments = attachments.length >= MAX_ATTACHMENTS_PER_POST;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 p-4 border-b border-slate-200"
      aria-label="Create a new post"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Avatar src={user.image} name={displayName} size="md" />
      <div
        className={cn(
          "flex-1 min-w-0 rounded-2xl border transition-shadow px-3 pt-2 pb-2",
          isDragOver
            ? "border-sky-400 ring-1 ring-sky-400 bg-sky-50/30"
            : "border-slate-200 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400"
        )}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isDragOver ? "Drop media here…" : "What's happening?"
          }
          rows={3}
          maxLength={MAX_CHARS + 50}
          className="w-full text-slate-900 placeholder:text-slate-400 text-base resize-none focus:outline-none bg-transparent leading-relaxed"
          aria-label="Post content"
          disabled={isPending}
        />

        {/* Attachment previews */}
        <MediaAttachmentPreview
          attachments={attachments}
          onRemove={handleRemove}
        />

        {error && (
          <p className="text-sm text-red-500 mt-2" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            {/* Image upload */}
            <input
              ref={imageInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              multiple
              className="sr-only"
              aria-label="Attach images"
              onChange={handleFileInput}
              disabled={atMaxAttachments || isPending}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={atMaxAttachments || isPending}
              aria-label="Attach image"
              className="p-1.5 rounded-full text-sky-500 hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Video upload */}
            <input
              ref={videoInputRef}
              type="file"
              accept={ALLOWED_VIDEO_TYPES.join(",")}
              multiple
              className="sr-only"
              aria-label="Attach videos"
              onChange={handleFileInput}
              disabled={atMaxAttachments || isPending}
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={atMaxAttachments || isPending}
              aria-label="Attach video"
              className="p-1.5 rounded-full text-sky-500 hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Video className="w-4 h-4" />
            </button>

            {attachments.length > 0 && (
              <span className="text-xs text-slate-400 ml-1">
                {attachments.length}/{MAX_ATTACHMENTS_PER_POST}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                isOverLimit
                  ? "text-red-500"
                  : charsLeft <= 20
                    ? "text-amber-500"
                    : "text-slate-400"
              )}
              aria-live="polite"
              aria-label={`${charsLeft} characters remaining`}
            >
              {charsLeft}
            </span>
            <Button type="submit" disabled={!canPost} size="sm">
              {isPending
                ? "Posting…"
                : pendingAttachments.length > 0
                  ? "Uploading…"
                  : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
