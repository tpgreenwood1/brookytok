import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Shell } from "@/components/layout/shell";
import { SearchBar } from "@/components/search/search-bar";
import { UserCard } from "@/components/user/user-card";
import { searchUsers } from "@/server/queries/user.queries";
import { Users, SearchX } from "lucide-react";
import type { SessionUser } from "@/types";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const currentUser = session.user as unknown as SessionUser;

  const results = query.length >= 1 ? await searchUsers(query, currentUser.id) : [];

  return (
    <Shell>
      <div className="sticky top-0 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
        <h1 className="text-lg font-bold text-foreground">Search</h1>
      </div>
      <div className="p-4 border-b border-border">
        <SearchBar initialQuery={query} />
      </div>
      {query ? (
        results.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center px-8">
            <SearchX className="w-12 h-12 text-fg-muted opacity-40" strokeWidth={1.5} />
            <p className="text-base font-semibold text-foreground">No results found</p>
            <p className="text-sm text-fg-muted">
              No users matched &ldquo;{query}&rdquo;. Try a different search.
            </p>
          </div>
        ) : (
          <ul>
            {results.map((user) => (
              <li key={user.id}>
                <UserCard user={user} />
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="py-20 flex flex-col items-center gap-3 text-center px-8">
          <Users className="w-12 h-12 text-fg-muted opacity-40" strokeWidth={1.5} />
          <p className="text-base font-semibold text-foreground">Find people</p>
          <p className="text-sm text-fg-muted">
            Search by username or display name to find people to follow.
          </p>
        </div>
      )}
    </Shell>
  );
}
