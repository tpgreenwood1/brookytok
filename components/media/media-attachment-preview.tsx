"use client";

import { X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AttachmentStatus = "uploading" | "done" | "error";

export interface Attachment {
  /** Stable local ID, not the DB id */
  id: string;
  file: File;
  /** Blob URL for local preview */
  previewUrl: string;
  status: AttachmentStatus;
  /** 0–100 */
  progress: number;
  /** Set after upload completes */
  objectKey?: string;
  mediaUrl?: string;
  error?: string;
  /** Dimensions / duration extracted client-side */
  width?: number;
  height?: number;
  durationSeconds?: number;
}

interface MediaAttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export function MediaAttachmentPreview({
  attachments,
  onRemove,
}: MediaAttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
      {attachments.map((a) => (
        <AttachmentTile key={a.id} attachment={a} onRemove={onRemove} />
      ))}
    </div>
  );
}

function AttachmentTile({
  attachment: a,
  onRemove,
}: {
  attachment: Attachment;
  onRemove: (id: string) => void;
}) {
  const isVideo = a.file.type.startsWith("video/");

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
      {/* Preview */}
      {isVideo ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={a.previewUrl}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={a.previewUrl}
          alt={a.file.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Upload progress overlay */}
      {a.status === "uploading" && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
          <div className="w-3/4 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all duration-150"
              style={{ width: `${a.progress}%` }}
            />
          </div>
          <span className="mt-1 text-white text-xs font-medium tabular-nums">
            {a.progress}%
          </span>
        </div>
      )}

      {/* Error overlay */}
      {a.status === "error" && (
        <div className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center p-1">
          <AlertCircle className="w-5 h-5 text-red-200 mb-1 flex-shrink-0" />
          <span className="text-red-200 text-[10px] text-center leading-tight line-clamp-2">
            {a.error ?? "Upload failed"}
          </span>
        </div>
      )}

      {/* Remove button — always visible so user can discard errored uploads */}
      <button
        type="button"
        onClick={() => onRemove(a.id)}
        aria-label={`Remove ${a.file.name}`}
        className={cn(
          "absolute top-1 right-1 rounded-full p-0.5",
          "bg-black/60 hover:bg-black/80 text-white transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        )}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Video badge */}
      {isVideo && a.status !== "uploading" && a.status !== "error" && (
        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded font-medium">
          VIDEO
        </span>
      )}
    </div>
  );
}
