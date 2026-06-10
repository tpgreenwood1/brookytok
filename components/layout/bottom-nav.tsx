"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Search } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
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
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50"
      aria-label="Mobile navigation"
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-slate-400 px-6 py-2",
              active && "text-slate-900"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              className={cn("w-6 h-6", active && "stroke-[2.5]")}
            />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
