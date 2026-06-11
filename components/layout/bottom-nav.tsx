"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Search } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { SessionUser } from "@/types";

export function BottomNav() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  const user = session?.user as unknown as SessionUser | undefined;

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    ...(user?.username
      ? [{ href: `/${user.username}`, icon: User, label: "Profile" }]
      : []),
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-background border-t border-border flex items-center z-50 pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile navigation"
    >
      <div className="flex-1 flex justify-around items-center h-full">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className={cn(
                "flex items-center justify-center min-w-[56px] min-h-[56px]",
                active ? "text-brand" : "text-fg-muted"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                  active && "bg-brand-light"
                )}
              >
                <Icon
                  className={cn("w-5 h-5", active && "stroke-[2.5]")}
                />
              </span>
            </Link>
          );
        })}
        <div className="flex items-center justify-center min-w-[56px] min-h-[56px]">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
