"use client";

import { Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/signin");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Feather className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Account pending approval</h1>
          <p className="text-muted-foreground">
            Your account is awaiting review. You&apos;ll be able to access the
            app once an admin approves your registration.
          </p>
        </div>
        <Button variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
