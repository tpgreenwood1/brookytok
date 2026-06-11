"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, LogOut, Feather, Search } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import type { SessionUser } from "@/types";

export function Sidebar() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();

  const user = session?.user as unknown as SessionUser | undefined;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/signin");
    router.refresh();
  }

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    ...(user?.username
      ? [{ href: `/${user.username}`, icon: User, label: "Profile" }]
      : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-16 xl:w-56 h-screen sticky top-0 border-r border-border px-2 xl:px-3 py-5 gap-2 flex-shrink-0 bg-background">
      <Link
        href="/"
        className="flex items-center justify-center xl:justify-start gap-2 px-2 xl:px-3 py-2.5 text-foreground mb-1"
        aria-label="brooky-tok home"
      >
        <Feather className="w-7 h-7 text-brand flex-shrink-0" />
        <span className="hidden xl:block text-lg font-bold truncate">brooky-tok</span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1" aria-label="Main navigation">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-center xl:justify-start gap-3 px-2 xl:px-3 py-2.5 rounded-full font-medium transition-colors",
                active
                  ? "bg-brand-light text-brand"
                  : "text-fg-muted hover:bg-surface hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  active && "stroke-[2.5]"
                )}
              />
              <span className="hidden xl:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-center xl:justify-start px-2 xl:px-3">
          <ThemeToggle className="w-10 h-10" />
        </div>

        {session && user && (
          <div className="hidden xl:flex items-center gap-2.5 px-3 py-2 rounded-full">
            <Avatar
              src={user.image}
              name={user.displayName ?? user.name}
              size="sm"
            />
            <span className="text-sm font-medium text-fg-muted truncate">
              @{user.username}
            </span>
          </div>
        )}

        {session && (
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center xl:justify-start gap-3 px-2 xl:px-3 py-2.5 rounded-full text-fg-muted hover:bg-surface hover:text-foreground transition-colors text-left font-medium w-full"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="hidden xl:inline">Sign out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
