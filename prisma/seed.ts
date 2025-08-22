// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Starting production seed process...");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL environment variable is not set. Aborting seed.");
    process.exit(1);
  }

  // --- UPSERT ADMIN USER (Non-Destructive) ---
  // This command will try to find a user with the admin email.
  // - If it finds one, it will do nothing.
  // - If it does NOT find one, it will create the admin user.
  
  console.log(`🔍 Checking for admin user with email: ${adminEmail}...`);
  
  const adminUser = await db.user.upsert({
    where: { email: adminEmail },
    update: {}, // We don't want to update anything if the user exists
    create: {
      email: adminEmail,
      name: "Admin",
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin user check complete. User ID: ${adminUser.id}`);

  // We no longer create sample projects, posts, or media in production.
  // That content will be managed via the CMS dashboard.

  console.log("🎉 Production seed process finished successfully!");
}

main()
  .catch((e) => {
    console.error("An error occurred during the seed process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
