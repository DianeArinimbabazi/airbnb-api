import prisma from "./src/config/prisma.js";

const photos: Record<string, string[]> = {
  "e1cd9c3e-7c84-4775-bdd3-e32deede4502": [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
  ],
  "9b8dd389-0110-47aa-a08f-49eb7dd12531": [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
  ],
  "96377867-4416-4175-bf35-6db082c01373": [
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800"
  ],
  "6dd948f5-2afc-42a3-adfe-539594acd1fd": [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
  ],
  "7bc6f2df-8feb-4a34-9b8c-f74d2848bb03": [
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
  ],
  "4e070b1e-d9b6-4fe6-afb8-3d6ae6579469": [
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800"
  ],
  "151fc857-2fb0-4e8b-987a-e1118db218b5": [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"
  ],
  "bc9b5560-f42f-4b39-a8c7-70bb7aa0a7e5": [
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800"
  ],
  "e58af7fb-13d9-43a0-85dc-8dfaf676d90d": [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
  ],
  "008b710f-96b2-4d15-89ce-3e3fc376dc12": [
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
  ],
};

async function main() {
  for (const [listingId, urls] of Object.entries(photos)) {
    for (const url of urls) {
      await prisma.listingPhoto.create({
        data: {
          url,
          publicId: `unsplash_${listingId}`,
          listingId,
        },
      });
      console.log(`Added photo to ${listingId}`);
    }
  }
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
