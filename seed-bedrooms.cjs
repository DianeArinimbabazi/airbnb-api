const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany();
  for (const l of listings) {
    const bedrooms  = l.type === "CABIN" ? 1 : l.type === "APARTMENT" ? 2 : l.type === "VILLA" ? 4 : 3;
    const bathrooms = l.type === "CABIN" ? 1 : l.type === "APARTMENT" ? 1 : l.type === "VILLA" ? 3 : 2;
    await prisma.listing.update({
      where: { id: l.id },
      data: { bedrooms, bathrooms }
    });
    console.log("Updated:", l.title, "->", bedrooms, "bed /", bathrooms, "bath");
  }
  console.log("Done!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
