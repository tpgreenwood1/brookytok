"use client";

import { useEffect } from "react";
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
      <p className="text-slate-500 text-sm">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset} variant="secondary" size="sm">
        Try again
      </Button>
    </div>
  );
}
