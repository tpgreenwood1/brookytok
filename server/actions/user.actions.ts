"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfilePhoto(
  imageUrl: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  if (!imageUrl || typeof imageUrl !== "string") {
    return { error: "imageUrl is required" };
  }

  // Security: URL must come from our own R2 bucket
  const r2PublicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!r2PublicUrl || !imageUrl.startsWith(r2PublicUrl)) {
    return { error: "Invalid image URL" };
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
    select: { username: true },
  });

  revalidatePath(`/${user.username}`);
  revalidatePath("/");
  return { success: true };
}

export async function updateBannerImage(
  imageUrl: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  if (!imageUrl || typeof imageUrl !== "string") {
    return { error: "imageUrl is required" };
  }

  const r2PublicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!r2PublicUrl || !imageUrl.startsWith(r2PublicUrl)) {
    return { error: "Invalid image URL" };
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { bannerImage: imageUrl },
    select: { username: true },
  });

  revalidatePath(`/${user.username}`);
  revalidatePath("/");
  return { success: true };
}

export async function setDailyTimeLimit(
  minutes: number | null
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  if (
    minutes !== null &&
    (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440)
  ) {
    return { error: "Limit must be between 1 and 1440 minutes" };
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { dailyTimeLimitMinutes: minutes },
    select: { username: true },
  });

  revalidatePath(`/${user.username}`);
  return { success: true };
}
