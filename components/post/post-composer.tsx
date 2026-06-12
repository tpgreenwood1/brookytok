"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Image as ImageIcon, Video, Type } from "lucide-react";

// Dynamic import — fabric.js accesses window/document at module evaluation time
const TextCardCreator = dynamic(
  () => import("@/components/text-card-creator").then((m) => m.TextCardCreator),
  { ssr: false }
);
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createPost, type MediaAttachment } from "@/server/actions/post.actions";
import {
  MediaAttachmentPreview,
} from "@/components/media/media-attachment-preview";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_ATTACHMENTS_PER_POST,
} from "@/lib/storage/upload";
import { useMediaAttachments } from "@/hooks/use-media-attachments";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

const MAX_CHARS = 280;
const CIRCUMFERENCE = 2 * Math.PI * 10; // ≈ 62.83, r=10

// ── Circular progress arc for character counter ───────────────────────────────

function CharCounter({ charsLeft }: { charsLeft: number }) {
  const progress = Math.min((MAX_CHARS - charsLeft) / MAX_CHARS, 1);
  const dashoffset = CIRCUMFERENCE * (1 - progress);
  const isNearLimit = charsLeft <= 20;
  const isOverLimit = charsLeft < 0;

  const arcColor = isOverLimit
    ? "var(--destructive)"
    : isNearLimit
      ? "#f59e0b"
      : "var(--brand)";

  return (
    <div className="flex items-center gap-1.5" aria-live="polite" aria-label={`${charsLeft} characters remaining`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke={arcColor}
          strokeWidth="2"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 100ms linear, stroke 150ms" }}
        />
      </svg>
      {isNearLimit && (
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            isOverLimit ? "text-destructive" : "text-amber-500"
          )}
        >
          {charsLeft}
        </span>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PostComposer() {
  const { data: session } = authClient.useSession();
  const [content, setContent] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showTextCard, setShowTextCard] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const {
    attachments,
    uploadError,
    processFiles,
    handleRemove,
    handleFileInput,
    clearAttachments,
    doneAttachments,
    pendingAttachments,
  } = useMediaAttachments();

  // Guard: render nothing until session is loaded
  if (!session) return null;

  const user = session.user as unknown as SessionUser;
  const displayName = user.displayName ?? user.name;
  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const hasContent = content.trim().length > 0;
  const hasDoneMedia = doneAttachments.length > 0;
  const canPost =
    (hasContent || hasDoneMedia) &&
    !isOverLimit &&
    !isPending &&
    pendingAttachments.length === 0;

  const error = submitError ?? uploadError;

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canPost) return;
    setSubmitError(null);

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
        setSubmitError(result.error);
      } else {
        setContent("");
        clearAttachments();
      }
    });
  }

  const atMaxAttachments = attachments.length >= MAX_ATTACHMENTS_PER_POST;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 p-4 border-b border-border"
      aria-label="Create a new post"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Avatar src={user.image} name={displayName} size="md" />
      <div
        className={cn(
          "flex-1 min-w-0 rounded-lg border transition-shadow px-3 pt-2 pb-2",
          isDragOver
            ? "border-brand ring-1 ring-brand bg-brand-light/20"
            : "border-border focus-within:border-brand focus-within:ring-1 focus-within:ring-brand"
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
          className="w-full text-foreground placeholder:text-fg-muted text-base resize-none focus:outline-none bg-transparent leading-relaxed"
          aria-label="Post content"
          disabled={isPending}
        />

        <MediaAttachmentPreview
          attachments={attachments}
          onRemove={handleRemove}
        />

        {error && (
          <p className="text-sm text-destructive mt-2" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between mt-1 pt-2 border-t border-border-muted">
          <div className="flex items-center gap-1">
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
              className="p-1.5 rounded-full text-brand hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

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
              className="p-1.5 rounded-full text-brand hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Video className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowTextCard(true)}
              disabled={atMaxAttachments || isPending}
              aria-label="Create text card"
              className="p-1.5 rounded-full text-brand hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Type className="w-4 h-4" />
            </button>

            {attachments.length > 0 && (
              <span className="text-xs text-fg-muted ml-1">
                {attachments.length}/{MAX_ATTACHMENTS_PER_POST}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
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

      {/* Text card creator — fixed overlay, outside normal form flow */}
      {showTextCard && (
        <TextCardCreator
          onExport={(blob) => {
            const file = new File([blob], "text-card.jpg", { type: "image/jpeg" });
            processFiles([file]);
            setShowTextCard(false);
          }}
          onClose={() => setShowTextCard(false)}
        />
      )}
    </form>
  );
}
