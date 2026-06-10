import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Shell } from "@/components/layout/shell";
import { SearchBar } from "@/components/search/search-bar";
import { UserCard } from "@/components/user/user-card";
import { searchUsers } from "@/server/queries/user.queries";
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
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 z-10">
        <h1 className="text-lg font-bold text-slate-900">Search</h1>
      </div>
      <div className="p-4 border-b border-slate-100">
        <SearchBar initialQuery={query} />
      </div>
      {query ? (
        results.length === 0 ? (
          <p className="text-center text-slate-500 py-16 px-4">
            No users found for &ldquo;{query}&rdquo;
          </p>
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
        <p className="text-center text-slate-400 py-16 px-4 text-sm">
          Search for people to follow
        </p>
      )}
    </Shell>
  );
}
