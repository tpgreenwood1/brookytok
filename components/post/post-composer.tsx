"use client";

import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createPost } from "@/server/actions/post.actions";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

const MAX_CHARS = 280;

export function PostComposer() {
  const { data: session } = authClient.useSession();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!session) return null;

  const user = session.user as unknown as SessionUser;
  const displayName = user.displayName ?? user.name;
  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const isEmpty = content.trim().length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEmpty || isOverLimit) return;
    setError(null);
    startTransition(async () => {
      const result = await createPost(content);
      if (result.error) {
        setError(result.error);
      } else {
        setContent("");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 p-4 border-b border-slate-100"
      aria-label="Create a new post"
    >
      <Avatar src={user.image} name={displayName} size="md" />
      <div className="flex-1 min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          rows={3}
          maxLength={MAX_CHARS + 50}
          className="w-full text-slate-900 placeholder:text-slate-400 text-lg resize-none focus:outline-none bg-transparent leading-relaxed"
          aria-label="Post content"
          disabled={isPending}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
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
          <Button
            type="submit"
            disabled={isEmpty || isOverLimit || isPending}
            size="sm"
          >
            {isPending ? "Posting…" : "Post"}
          </Button>
        </div>
      </div>
    </form>
  );
}
