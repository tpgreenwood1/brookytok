import type { Metadata } from "next";
import {
  getAnalyticsTotals,
  getDailyActivity,
  getTopUsersByPosts,
  getTopUsersByTime,
  getStorageStats,
  getPendingApprovalCount,
} from "@/server/queries/analytics.queries";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const [overview, activity, topByPosts, topByTime, storage, pendingCount] = await Promise.all([
    getAnalyticsTotals(),
    getDailyActivity(14),
    getTopUsersByPosts(10),
    getTopUsersByTime(10),
    getStorageStats(),
    getPendingApprovalCount(),
  ]);

  const { totals, last7Days } = overview;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground mb-8">Usage overview for your app</p>

        {/* All-time totals */}
        <section className="mb-8">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            All-time totals
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Users" value={totals.users} />
            <StatCard label="Logins" value={totals.logins} />
            <StatCard label="Posts" value={totals.posts} />
            <StatCard label="Comments" value={totals.comments} />
            <StatCard label="Reposts" value={totals.reposts} />
            <StatCard label="Likes" value={totals.likes} />
            <StatCard label="Follows" value={totals.follows} />
            <StatCard label="Time Spent" value={formatHours(totals.timeSpentHours * 3600)} />
            <StatCard label="Pending approval" value={pendingCount} />
          </div>
        </section>

        {/* Storage */}
        <section className="mb-8">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Storage (R2)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total used" value={formatBytes(storage.totalBytes)} />
            <StatCard label="Media files" value={storage.totalFiles} />
            <StatCard label="Images" value={`${storage.images.count} · ${formatBytes(storage.images.bytes)}`} />
            <StatCard label="Videos" value={`${storage.videos.count} · ${formatBytes(storage.videos.bytes)}`} />
          </div>
        </section>

        {/* Last 7 days + daily activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <section className="border border-border rounded-lg p-5">
            <h2 className="font-semibold mb-4">Last 7 Days</h2>
            <dl className="space-y-3">
              <SummaryRow label="New signups" value={last7Days.signups} />
              <SummaryRow label="Logins" value={last7Days.logins} />
              <SummaryRow label="New posts" value={last7Days.posts} />
              <SummaryRow label="Likes given" value={last7Days.likes} />
            </dl>
          </section>

          <section className="border border-border rounded-lg p-5">
            <h2 className="font-semibold mb-4">Daily Activity</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left border-b border-border">
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 pr-4 font-medium text-right">Logins</th>
                    <th className="pb-2 pr-4 font-medium text-right">Posts</th>
                    <th className="pb-2 font-medium text-right">Signups</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((row) => (
                    <tr key={row.date} className="border-b border-border/40 last:border-0">
                      <td className="py-2 pr-4">{formatDate(row.date)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{row.logins}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{row.posts}</td>
                      <td className="py-2 text-right tabular-nums">{row.signups}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Top users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="border border-border rounded-lg p-5">
            <h2 className="font-semibold mb-4">Top Users by Posts</h2>
            {topByPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              <ol className="space-y-2.5">
                {topByPosts.map((user, i) => (
                  <li key={user.username} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="text-muted-foreground w-5 inline-block">{i + 1}.</span>
                      <span className="font-medium">{user.displayName || user.name || user.username}</span>
                      <span className="text-muted-foreground ml-1.5 text-xs">@{user.username}</span>
                    </span>
                    <span className="tabular-nums font-medium">{user._count.posts}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="border border-border rounded-lg p-5">
            <h2 className="font-semibold mb-4">Top Users by Time Spent</h2>
            {topByTime.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage data yet.</p>
            ) : (
              <ol className="space-y-2.5">
                {topByTime.map((user, i) => (
                  <li key={user.username} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="text-muted-foreground w-5 inline-block">{i + 1}.</span>
                      <span className="font-medium">{user.displayName || user.name || user.username}</span>
                      <span className="text-muted-foreground ml-1.5 text-xs">@{user.username}</span>
                    </span>
                    <span className="tabular-nums font-medium">{formatHours(user.totalSeconds)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <p className="text-2xl font-bold tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value.toLocaleString()}</dd>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function formatHours(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}
