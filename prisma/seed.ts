import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const seedUsers = [
  {
    username: "alice",
    name: "Alice Johnson",
    displayName: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",
    bio: "Frontend developer & coffee enthusiast ☕",
  },
  {
    username: "bob",
    name: "Bob Smith",
    displayName: "Bob Smith",
    email: "bob@example.com",
    password: "password123",
    bio: "Building things on the internet. Open source contributor.",
  },
  {
    username: "carol",
    name: "Carol Davis",
    displayName: "Carol Davis",
    email: "carol@example.com",
    password: "password123",
    bio: "Designer 🎨 Dog mom 🐕 Avid reader 📚",
  },
  {
    username: "dave",
    name: "Dave Wilson",
    displayName: "Dave Wilson",
    email: "dave@example.com",
    password: "password123",
    bio: null,
  },
  {
    username: "eve",
    name: "Eve Martinez",
    displayName: "Eve Martinez",
    email: "eve@example.com",
    password: "password123",
    bio: "Security researcher. Always watching 👀",
  },
];

const seedPosts = [
  { username: "alice", content: "Just shipped a new feature! 🚀 Spent all day debugging a CSS issue that turned out to be a missing semicolon." },
  { username: "alice", content: "Hot take: dark mode should be the default, not the exception." },
  { username: "bob", content: "Open source is the best invention of the modern era. Change my mind." },
  { username: "bob", content: "Finally got my local dev environment set up exactly how I like it. Took 3 hours but worth it." },
  { username: "bob", content: "Reminder: code reviews are a gift, not a punishment." },
  { username: "carol", content: "Design systems save so much time. If you don't have one, start now." },
  { username: "carol", content: "My dog just knocked over my coffee while I was in a video call. Remote work is great." },
  { username: "dave", content: "Monday morning. Coffee first. Emails second. Always." },
  { username: "dave", content: "Does anyone else talk to themselves while debugging? Just me? Okay." },
  { username: "eve", content: "Reminder to update your dependencies. Those CVEs don't patch themselves." },
  { username: "eve", content: "Good security is invisible. If users notice the security, something has gone wrong." },
  { username: "alice", content: "Reading \"A Philosophy of Software Design\" for the third time. Still finding new things." },
];

const seedFollows = [
  { follower: "alice", following: "bob" },
  { follower: "alice", following: "carol" },
  { follower: "bob", following: "alice" },
  { follower: "bob", following: "eve" },
  { follower: "carol", following: "alice" },
  { follower: "carol", following: "dave" },
  { follower: "dave", following: "bob" },
  { follower: "eve", following: "alice" },
  { follower: "eve", following: "carol" },
];

async function main() {
  console.log("🌱 Seeding database...");

  const userIds: Record<string, string> = {};

  for (const u of seedUsers) {
    const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        emailVerified: true,
        username: u.username,
        displayName: u.displayName,
        bio: u.bio,
        accounts: {
          create: {
            accountId: u.email,
            providerId: "credential",
            password: hashedPassword,
          },
        },
      },
    });

    userIds[u.username] = user.id;
    console.log(`  ✓ User @${u.username}`);
  }

  for (const p of seedPosts) {
    await prisma.post.create({
      data: {
        content: p.content,
        authorId: userIds[p.username],
        // Spread posts across last 7 days
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
        ),
      },
    });
  }
  console.log(`  ✓ ${seedPosts.length} posts`);

  for (const f of seedFollows) {
    const followerId = userIds[f.follower];
    const followingId = userIds[f.following];
    if (!followerId || !followingId) continue;

    await prisma.follow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      update: {},
      create: { followerId, followingId },
    });
  }
  console.log(`  ✓ ${seedFollows.length} follows`);

  console.log("\n✅ Seed complete!");
  console.log("\nTest accounts (all passwords: password123):");
  seedUsers.forEach((u) => console.log(`  ${u.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
