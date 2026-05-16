const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Find all listings that still have no photos
  const listings = await prisma.listing.findMany({
    include: { photos: true }
  });
  
  const withoutPhotos = listings.filter(l => l.photos.length === 0);
  console.log("Listings without photos:", withoutPhotos.length);
  withoutPhotos.forEach(l => console.log(" -", l.id, l.title));

  // Generic photo URLs by type
  const photoByType = {
    APARTMENT: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    HOUSE:     "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    VILLA:     "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
    CABIN:     "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  };

  for (const listing of withoutPhotos) {
    const url = photoByType[listing.type] || photoByType.HOUSE;
    await prisma.listingPhoto.create({
      data: { url, publicId: "auto_" + listing.id, listingId: listing.id }
    });
    console.log("Added photo to:", listing.title);
  }
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
