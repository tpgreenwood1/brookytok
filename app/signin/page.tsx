"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Feather, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "Sign in failed. Please try again." : null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    if (authError) {
      setError(authError.message ?? "Sign in failed. Please check your credentials.");
      setIsLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Left branding panel — desktop only */}
      <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-sky-500 to-indigo-600 px-12 text-white">
        <Feather className="w-16 h-16 mb-6 opacity-90" aria-hidden />
        <h1 className="text-4xl font-black tracking-tight mb-3">brooky-tok</h1>
        <p className="text-lg text-white/70 text-center leading-relaxed max-w-xs">
          Share what&apos;s happening. Follow people you love.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile-only logo */}
        <div className="flex flex-col items-center gap-2 mb-8 md:hidden">
          <Feather className="w-10 h-10 text-brand" aria-hidden />
          <span className="text-xl font-bold text-foreground">brooky-tok</span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-fg-muted mb-8">
            Sign in to your account to continue.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div
                role="alert"
                className="flex gap-3 items-start rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full mt-1"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-fg-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-brand hover:underline font-medium underline-offset-2"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
