"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, LogOut, Feather, Search } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
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
    <aside className="hidden md:flex flex-col w-64 xl:w-72 h-screen sticky top-0 border-r border-slate-200 px-3 py-6 gap-4 flex-shrink-0">
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 text-slate-900"
      >
        <Feather className="w-7 h-7 text-sky-500" />
        <span className="text-xl font-bold">brooky-tok</span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-full text-slate-600 hover:bg-slate-100 transition-colors font-medium",
              pathname === href &&
                "text-sky-500 font-semibold hover:bg-sky-50"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {session && (
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors text-left font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      )}
    </aside>
  );
}
