import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRepliesByPostId } from "@/server/queries/post.queries";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  const replies = await getRepliesByPostId(id, session?.user.id);
  return NextResponse.json(replies);
}
