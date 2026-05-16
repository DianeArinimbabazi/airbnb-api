const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Find all photos and test if URL is valid (not a placeholder)
  const photos = await prisma.listingPhoto.findMany();
  let removed = 0;
  for (const p of photos) {
    // Remove photos with bad/broken URLs
    if (!p.url || !p.url.startsWith("http")) {
      await prisma.listingPhoto.delete({ where: { id: p.id } });
      removed++;
      console.log("Removed bad photo:", p.id);
    }
  }
  console.log("Done! Removed:", removed, "bad photos");
  console.log("Remaining photos:", photos.length - removed);
}
main().catch(console.error).finally(() => prisma.$disconnect());
