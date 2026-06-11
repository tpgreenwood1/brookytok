"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Video } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createComment, type MediaAttachment } from "@/server/actions/post.actions";
import { MediaAttachmentPreview } from "@/components/media/media-attachment-preview";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_ATTACHMENTS_PER_POST,
} from "@/lib/storage/upload";
import { useMediaAttachments } from "@/hooks/use-media-attachments";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

interface ReplyComposerProps {
  parentPostId: string;
  parentAuthorUsername: string;
  onSuccess?: () => void;
}

export function ReplyComposer({
  parentPostId,
  parentAuthorUsername,
  onSuccess,
}: ReplyComposerProps) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  if (!session) return null;
  const user = session.user as unknown as SessionUser;
  const displayName = user.displayName ?? user.name;
  const hasContent = content.trim().length > 0;
  const hasDoneMedia = doneAttachments.length > 0;
  const isOverLimit = content.length > 280;
  const canSubmit =
    (hasContent || hasDoneMedia) &&
    !isOverLimit &&
    !isPending &&
    pendingAttachments.length === 0;

  const error = submitError ?? uploadError;
  const atMaxAttachments = attachments.length >= MAX_ATTACHMENTS_PER_POST;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
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
      const result = await createComment(parentPostId, content, mediaPayload);
      if (result.error) {
        setSubmitError(result.error);
      } else {
        setContent("");
        clearAttachments();
        router.refresh();
        onSuccess?.();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 p-4 border-b border-border"
      aria-label="Write a reply"
    >
      <Avatar src={user.image} name={displayName} size="md" />
      <div
        className={cn(
          "flex-1 min-w-0 rounded-2xl border transition-shadow px-3 pt-2 pb-2",
          "border-border focus-within:border-brand focus-within:ring-1 focus-within:ring-brand"
        )}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Reply to @${parentAuthorUsername}…`}
          rows={2}
          maxLength={330}
          className="w-full text-foreground placeholder:text-fg-muted text-base resize-none focus:outline-none bg-transparent leading-relaxed"
          aria-label="Reply content"
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

            {attachments.length > 0 && (
              <span className="text-xs text-fg-muted ml-1">
                {attachments.length}/{MAX_ATTACHMENTS_PER_POST}
              </span>
            )}
          </div>

          <Button type="submit" disabled={!canSubmit} size="sm">
            {isPending
              ? "Replying…"
              : pendingAttachments.length > 0
                ? "Uploading…"
                : "Reply"}
          </Button>
        </div>
      </div>
    </form>
  );
}
