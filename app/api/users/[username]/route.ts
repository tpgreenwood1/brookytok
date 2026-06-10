import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByUsername, getIsFollowing } from "@/server/queries/user.queries";
import { getPostsByUsername } from "@/server/queries/post.queries";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await getUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [posts, session] = await Promise.all([
    getPostsByUsername(username),
    auth.api.getSession({ headers: req.headers }),
  ]);

  let isFollowing = false;
  if (session && session.user.id !== user.id) {
    isFollowing = await getIsFollowing(session.user.id, user.id);
  }

  return NextResponse.json({ user, posts, isFollowing });
}
