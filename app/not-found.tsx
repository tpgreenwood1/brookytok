import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8 bg-background text-center">
      <p className="text-8xl font-black text-brand leading-none select-none">404</p>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-fg-muted text-sm max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="mt-2">
        <Button size="sm">Go home</Button>
      </Link>
    </div>
  );
}
