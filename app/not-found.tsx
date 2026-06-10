import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/">
        <Button size="sm">Go home</Button>
      </Link>
    </div>
  );
}
