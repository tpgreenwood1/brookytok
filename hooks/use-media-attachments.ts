"use client";

import { useState, useCallback } from "react";
import type { Attachment } from "@/components/media/media-attachment-preview";
import {
  MAX_ATTACHMENTS_PER_POST,
  validateUpload,
} from "@/lib/storage/upload";

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

export function useMediaAttachments() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      const remaining = MAX_ATTACHMENTS_PER_POST - attachments.length;
      const toProcess = files.slice(0, remaining);

      if (toProcess.length === 0) {
        setUploadError(`Maximum ${MAX_ATTACHMENTS_PER_POST} attachments per post`);
        return;
      }

      for (const file of toProcess) {
        const validation = validateUpload(file.type, file.size);
        if (!validation.valid) {
          setUploadError(validation.error ?? "Invalid file");
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

        (async () => {
          try {
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

            await uploadToR2(uploadUrl, file, (pct) => {
              setAttachments((prev) =>
                prev.map((a) => (a.id === id ? { ...a, progress: pct } : a))
              );
            });

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

  const handleRemove = useCallback((id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att) URL.revokeObjectURL(att.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length) processFiles(files);
      e.target.value = "";
    },
    [processFiles]
  );

  const clearAttachments = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach((a) => URL.revokeObjectURL(a.previewUrl));
      return [];
    });
  }, []);

  const clearUploadError = useCallback(() => setUploadError(null), []);

  const doneAttachments = attachments.filter((a) => a.status === "done");
  const pendingAttachments = attachments.filter((a) => a.status === "uploading");

  return {
    attachments,
    uploadError,
    clearUploadError,
    processFiles,
    handleRemove,
    handleFileInput,
    clearAttachments,
    doneAttachments,
    pendingAttachments,
  };
}
