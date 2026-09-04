import "dotenv/config";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

async function main() {
  const auth0 = new Auth0Client({
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    secret: process.env.AUTH0_SECRET!,
    appBaseUrl: process.env.AUTH0_BASE_URL!,
  });

  const session = await auth0.getSession();
  if (!session?.user) {
    console.log("No session found. Log in to the app first.");
    console.log("env check:", process.env.AUTH0_DOMAIN);
    return;
  }

  const auth0Id = session.user.sub;
  console.log("Session auth0Id:", auth0Id);
  console.log("Session user:", session.user.email);

  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const existing = await db.user.findUnique({ where: { auth0Id } });
  if (existing) {
    await db.user.update({ where: { auth0Id }, data: { role: "admin" } });
    console.log("Updated existing user to admin");
  } else {
    await db.user.create({
      data: {
        auth0Id,
        email: session.user.email!,
        name: session.user.name ?? null,
        role: "admin",
      },
    });
    console.log("Created admin user with real auth0Id");
  }

  // Delete the fake manual-admin user if exists
  await db.user.deleteMany({ where: { auth0Id: "manual-admin" } });
  console.log("Cleaned up fake admin user");

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
