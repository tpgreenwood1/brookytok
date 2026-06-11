"use client";

import { useRef, useState, useTransition } from "react";
import { Camera } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { updateProfilePhoto } from "@/server/actions/user.actions";
import { ALLOWED_IMAGE_TYPES, validateUpload } from "@/lib/storage/upload";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentImage: string | null;
  displayName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AvatarUpload({
  currentImage,
  displayName,
  size = "xl",
  className,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "saving" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const validation = validateUpload(file.type, file.size);
    if (!validation.valid) {
      setErrorMsg(validation.error ?? "Invalid file");
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);
    setStatus("uploading");
    setProgress(0);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/media/avatar-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        throw new Error(error ?? "Failed to get upload URL");
      }

      const { uploadUrl, avatarUrl } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (evt) => {
          if (evt.lengthComputable) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: HTTP ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setStatus("saving");
      startTransition(async () => {
        const result = await updateProfilePhoto(avatarUrl);
        if (result.error) {
          setErrorMsg(result.error);
          setStatus("error");
          URL.revokeObjectURL(blobUrl);
          setPreview(null);
        } else {
          setStatus("done");
          setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        }
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
      URL.revokeObjectURL(blobUrl);
      setPreview(null);
    }
  }

  const isActive = status === "uploading" || status === "saving" || isPending;
  const displayImage = preview ?? currentImage;

  return (
    <div className={cn("relative inline-block", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="sr-only"
        aria-label="Upload profile photo"
        onChange={handleFileChange}
        disabled={isActive}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isActive}
        aria-label="Change profile photo"
        className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 group cursor-pointer"
      >
        <Avatar src={displayImage} name={displayName} size={size} />

        {!isActive && (
          <span
            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden
          >
            <Camera className="w-6 h-6 text-white" />
          </span>
        )}

        {isActive && (
          <span
            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50"
            aria-hidden
          >
            <span className="text-white text-xs font-semibold tabular-nums">
              {status === "saving" ? "Saving…" : `${progress}%`}
            </span>
          </span>
        )}
      </button>

      {errorMsg && (
        <p className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs text-red-500 whitespace-nowrap bg-white shadow px-2 py-1 rounded-lg border border-red-200 z-10">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
