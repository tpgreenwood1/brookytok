"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  User,
  Search,
  PlusSquare,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { SessionUser } from "@/types";

export function BottomNav() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/signin");
  };

  const user = session?.user as unknown as SessionUser | undefined;

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/", icon: PlusSquare, label: "Create", isCreate: true },
    ...(user?.username
      ? [{ href: `/${user.username}`, icon: User, label: "Profile" }]
      : [{ href: "/signin", icon: User, label: "Sign in" }]),
  ];

  function handleCreate(e: React.MouseEvent) {
    e.preventDefault();
    const textarea = document.querySelector<HTMLTextAreaElement>(
      "textarea[aria-label='Post content']"
    );
    if (textarea) {
      textarea.focus({ preventScroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="mx-auto w-full max-w-[470px] h-12 flex items-center justify-around px-2">
        {navItems.map(({ href, icon: Icon, label, isCreate }) => {
          const active = pathname === href && !isCreate;
          if (isCreate) {
            return (
              <button
                key={label}
                type="button"
                onClick={handleCreate}
                aria-label={label}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] text-foreground"
              >
                <Icon className="w-6 h-6 stroke-[1.5]" />
              </button>
            );
          }
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] text-foreground"
            >
              <Icon
                className={cn(
                  "w-6 h-6",
                  active ? "stroke-[2.5]" : "stroke-[1.5]"
                )}
              />
            </Link>
          );
        })}

        <div className="flex items-center">
          <ThemeToggle className="w-8 h-8 text-fg-muted" />
          {session && (
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="flex items-center justify-center w-8 h-8 text-fg-muted"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
