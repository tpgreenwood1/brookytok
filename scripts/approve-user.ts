import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const username = process.argv[2];

async function main() {
  if (username) {
    const user = await prisma.user.update({
      where: { username },
      data: { approved: true },
      select: { username: true, email: true, displayName: true },
    });
    console.log(`Approved: ${user.displayName ?? user.username} (${user.email})`);
  } else {
    const users = await prisma.user.updateMany({
      where: { approved: false },
      data: { approved: true },
    });
    console.log(`Approved ${users.count} user(s).`);
  }
}

main()
  .catch((e) => {
    if ((e as any).code === "P2025") {
      console.error(`User not found: ${username}`);
    } else {
      console.error(e);
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
