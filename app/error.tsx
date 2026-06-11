"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-background text-center">
      <AlertTriangle className="w-14 h-14 text-fg-muted opacity-50" strokeWidth={1.5} />
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-fg-muted text-sm max-w-xs">
          An unexpected error occurred. This has been logged and we&apos;ll look into it.
        </p>
      </div>
      <Button onClick={reset} variant="secondary" size="sm">
        Try again
      </Button>
    </div>
  );
}
