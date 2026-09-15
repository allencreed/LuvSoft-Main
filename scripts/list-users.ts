/**
 * Dev utility: list native users, credentials, and sessions.
 *   npx tsx scripts/list-users.ts
 */
import "dotenv/config";

type PrismaDB = import("../generated/prisma/client").PrismaClient;

async function initDb(): Promise<PrismaDB> {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../generated/prisma/client");
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  }) as PrismaDB;
}

async function main() {
  const db = await initDb();

  const users = await db.user.findMany({
    where: { email: { contains: "example.test" } },
    include: { password: true, sessions: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`=== native users (${users.length}) ===`);
  for (const u of users) {
    console.log(
      `${u.email} | auth0Id: ${u.auth0Id ?? "null"} | pw: ${
        u.password ? "set" : "none"
      } | sessions: ${u.sessions.length} | created: ${u.createdAt.toISOString()}`,
    );
  }

  const sessions = await db.session.findMany({
    orderBy: { createdAt: "asc" },
  });
  console.log(`\n=== sessions (${sessions.length}) ===`);
  for (const s of sessions) {
    console.log(
      `${s.id.slice(0, 8)} | user ${s.userId.slice(0, 8)} | expires ${s.expiresAt.toISOString()}`,
    );
  }

  const pw = users.find((u) => u.password)?.password;
  if (pw) {
    console.log(`\n=== sample hash prefix ===\n${pw.hash.slice(0, 24)}…`);
  }

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
