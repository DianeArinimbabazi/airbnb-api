const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const photos = {
  "006e8d7a-340d-414a-be46-8d9d6446472f": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "afad3951-38bc-40ca-85ca-36abdd2270a3": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  "de487475-c5db-47db-97f6-fba4871cb5a7": "https://images.unsplash.com/photo-1520483601560-389dff434fdf?w=800",
  "0761ee0a-5e52-4e91-89e6-cfaa07d208b9": "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?w=800",
  "021bf366-8044-4d32-9237-b5bc0bfad5d1": "https://images.unsplash.com/photo-1505881402582-c5bc11054f91?w=800",
  "56311513-a93d-4159-be96-226c9a5f2097": "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800",
  "a6b529db-d6bf-4efd-af89-1bfa1b906ab0": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800",
  "42e6e5c8-1cc9-460a-8fdc-b6cc94384618": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800",
  "4b573cac-65bf-4dfa-883a-b1b34d73b205": "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
  "0aea4566-7db4-43e1-ab40-5baff17c8ebb": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
  "b35eb04b-0ad9-4ec0-a54e-6e77a4b4e75d": "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800",
  "09a3e203-338f-45af-b562-c8a9394eca90": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  "eb1861ca-b96d-4f08-8dfe-b253d3e75904": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
  "7d842ce1-dc63-4f51-842b-3e272c63d37e": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
  "afff7f0d-38bf-4de9-90d1-1bc32dca3d5b": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "69f7c7cd-35d2-4531-8d0e-c514ac01bd22": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  "43856ca9-0a59-4c01-b3a0-edf17a40bd93": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
  "b5626aa9-f373-481f-ad64-a994a82a0f14": "https://images.unsplash.com/photo-1474690870753-1b92efa1f2d8?w=800",
  "c327ceed-4188-433c-8904-ace38c12bc51": "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800",
  "d288d449-cf36-43df-9e88-93118f91c97d": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
  "9c72e6cd-b4d3-4309-ae55-72733024e468": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
  "ea03857b-1b84-4385-9aa0-316a30450ab4": "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?w=800",
  "8d435402-8e93-41a6-9274-8a900cd6a8ec": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
  "9a04bfdf-10f8-420a-a9ed-9baa672d72b4": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "36163442-ff04-4048-8e81-396a03abb553": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  "db78c9fd-4a8a-42b0-a6f3-3cf882d3481f": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
  "4318ce5d-3235-4dad-9290-b6ed06ee1790": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  "6dc22c9b-7feb-409d-986d-f150ab613a54": "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
  "595e5d0e-39bc-430d-a318-f21a128c1dfc": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
  "45dfe85c-c7c4-40bd-b41b-8deb43697d9e": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  "de8838ac-7ba9-4d73-b14b-599bbc85d2c9": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
  "d7b08164-5e98-4a80-92b4-a7541520539d": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
  "f9101c4c-4dac-42b9-81c7-ee6d7e8271d3": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
  "cdf82c9d-8dfe-4347-a989-70b3b2bcfe8e": "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
  "4a097d54-f9c6-4a35-80a1-a04a377d9efd": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  "250216ed-ee53-4ec9-9920-fde721517faa": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
  "d0a98052-454e-4721-94a0-d243cf3bdbbd": "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800",
  "d83149eb-f23a-4c60-acf7-020e0fa2040c": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800",
  "bf59650f-550d-4f3a-bac8-b86e6df06fad": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800",
  "e3da605a-e7e1-4a44-a436-5613b7e5e7b4": "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
};

async function main() {
  for (const [listingId, url] of Object.entries(photos)) {
    const existing = await prisma.listingPhoto.findFirst({ where: { listingId } });
    if (existing) { console.log("Skip (already has photo):", listingId); continue; }
    await prisma.listingPhoto.create({
      data: { url, publicId: "unsplash_" + listingId, listingId },
    });
    console.log("Added:", listingId);
  }
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
