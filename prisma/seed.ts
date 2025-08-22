// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed process...");

  // --- CLEAN UP DATABASE ---
  console.log("🧹 Cleaning up existing data...");
  await db.project.deleteMany({});
  await db.post.deleteMany({});
  await db.resume.deleteMany({});
  await db.media.deleteMany({});
  await db.user.deleteMany({});
  console.log("✅ Database cleaned.");

  // --- CREATE ADMIN USER ---
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL environment variable is not set.");
  }

  console.log(`👤 Creating admin user with email: ${adminEmail}...`);
  const adminUser = await db.user.create({
    data: {
      email: adminEmail,
      name: "Admin User",
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user created with ID: ${adminUser.id}`);

  // --- CREATE SAMPLE MEDIA ---
  console.log("🖼️ Creating sample media...");
  const sampleCoverImage = await db.media.create({
    data: {
      url: "https://placehold.co/1200x630/000000/FFFFFF/png?text=Sample+Cover",
      type: "IMAGE",
      publicId: "sample-cover-1",
    },
  });
  console.log(`✅ Sample media created.`);

  // --- CREATE SAMPLE PROJECT ---
  console.log("🛠️ Creating sample project...");
  await db.project.create({
    data: {
      title: "My First Awesome Project",
      slug: "my-first-awesome-project",
      description: "This is a brief but exciting description of the project.",
      tags: ["Next.js", "TypeScript", "TailwindCSS"],
      liveUrl: "https://example.com",
      repoUrl: "https://github.com/example/repo",
      user: { connect: { id: adminUser.id } },
      coverImage: { connect: { id: sampleCoverImage.id } },
    },
  });
  console.log(`✅ Sample project created.`);

  // --- CREATE SAMPLE POST ---
  console.log("✍️ Creating sample blog post...");
  await db.post.create({
    data: {
      title: "Welcome to the Blog!",
      slug: "welcome-to-the-blog",
      excerpt: "This is the first post on the blog. More to come soon!",
      content:
        "This is the full content of the blog post. You can write in Markdown here and it will be rendered on the front end. Welcome!",
      tags: ["Introduction", "Update"],
      published: true,
      author: { connect: { id: adminUser.id } },
      coverImage: { connect: { id: sampleCoverImage.id } },
    },
  });
  console.log(`✅ Sample blog post created.`);

  console.log("🎉 Seed process finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });