"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Feather } from "lucide-react";

type FormState = {
  username: string;
  displayName: string;
  email: string;
  password: string;
  bio: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    username: "",
    displayName: "",
    email: "",
    password: "",
    bio: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      setError("Username may only contain letters, numbers, and underscores.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    const { error: authError } = await (authClient.signUp as any).email({
      email: form.email,
      password: form.password,
      name: form.displayName || form.username,
      username: form.username,
      displayName: form.displayName || null,
      bio: form.bio || null,
    });

    if (authError) {
      setError(authError.message ?? "Sign up failed. Please try again.");
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

      {/* Right form panel — scrollable */}
      <div className="flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        {/* Mobile-only logo */}
        <div className="flex flex-col items-center gap-2 mb-8 md:hidden">
          <Feather className="w-10 h-10 text-brand" aria-hidden />
          <span className="text-xl font-bold text-foreground">brooky-tok</span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Create your account
          </h2>
          <p className="text-sm text-fg-muted mb-8">
            Join brooky-tok and start sharing today.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Username"
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="yourhandle"
              required
              autoComplete="username"
              autoFocus
              minLength={3}
              maxLength={30}
            />
            <Input
              label="Display name"
              type="text"
              id="displayName"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              placeholder="Your Name"
              autoComplete="name"
              maxLength={60}
            />
            <Input
              label="Email"
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              minLength={8}
            />
            <Input
              label="Bio (optional)"
              type="text"
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell us a little about yourself"
              maxLength={160}
            />

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full mt-1"
            >
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-fg-muted mt-6">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-brand hover:underline font-medium underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
