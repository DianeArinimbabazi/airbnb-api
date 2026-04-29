import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  // 1. Cleanup
  await prisma.booking.deleteMany();
  await prisma.listingPhoto.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create users with upsert
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@example.com",
      username: "alice_host",
      phone: "1111111111",
      password: await bcrypt.hash("password123", 10),
      role: "HOST",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "bob@example.com",
      username: "bob_host",
      phone: "2222222222",
      password: await bcrypt.hash("password123", 10),
      role: "HOST",
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      name: "Carol White",
      email: "carol@example.com",
      username: "carol_guest",
      phone: "3333333333",
      password: await bcrypt.hash("password123", 10),
      role: "GUEST",
    },
  });

  const david = await prisma.user.upsert({
    where: { email: "david@example.com" },
    update: {},
    create: {
      name: "David Brown",
      email: "david@example.com",
      username: "david_guest",
      phone: "4444444444",
      password: await bcrypt.hash("password123", 10),
      role: "GUEST",
    },
  });

  const eve = await prisma.user.upsert({
    where: { email: "eve@example.com" },
    update: {},
    create: {
      name: "Eve Davis",
      email: "eve@example.com",
      username: "eve_guest",
      phone: "5555555555",
      password: await bcrypt.hash("password123", 10),
      role: "GUEST",
    },
  });

  // 3. Create listings individually (need ids for bookings)
  const apartment = await prisma.listing.create({
    data: {
      title: "Modern Apartment in Kigali",
      description: "A stylish apartment in the heart of Kigali city",
      location: "Kigali, Rwanda",
      pricePerNight: 60,
      guests: 2,
      type: "APARTMENT",
      amenities: "WiFi, Kitchen, Air Conditioning",
      hostId: alice.id,
    },
  });

  const house = await prisma.listing.create({
    data: {
      title: "Spacious House in Musanze",
      description: "A lovely family house near Volcanoes National Park",
      location: "Musanze, Rwanda",
      pricePerNight: 90,
      guests: 6,
      type: "HOUSE",
      amenities: "WiFi, Parking, Garden, Kitchen",
      hostId: alice.id,
    },
  });

  const villa = await prisma.listing.create({
    data: {
      title: "Luxury Villa in Rubavu",
      description: "Stunning villa with lake Kivu views",
      location: "Rubavu, Rwanda",
      pricePerNight: 200,
      guests: 10,
      type: "VILLA",
      amenities: "WiFi, Pool, Kitchen, Parking, BBQ",
      hostId: bob.id,
    },
  });

  const cabin = await prisma.listing.create({
    data: {
      title: "Cozy Cabin in Nyungwe",
      description: "A peaceful cabin inside Nyungwe Forest",
      location: "Nyungwe, Rwanda",
      pricePerNight: 75,
      guests: 4,
      type: "CABIN",
      amenities: "Fireplace, Kitchen, Hiking Trails",
      hostId: bob.id,
    },
  });

  // 4. Create bookings
  const checkIn1 = new Date("2026-06-01");
  const checkOut1 = new Date("2026-06-05");
  const nights1 = 4;
  await prisma.booking.create({
    data: {
      guestId: carol.id,
      listingId: apartment.id,
      checkIn: checkIn1,
      checkOut: checkOut1,
      totalPrice: nights1 * apartment.pricePerNight,
      status: "CONFIRMED",
    },
  });

  const checkIn2 = new Date("2026-07-10");
  const checkOut2 = new Date("2026-07-15");
  const nights2 = 5;
  await prisma.booking.create({
    data: {
      guestId: david.id,
      listingId: villa.id,
      checkIn: checkIn2,
      checkOut: checkOut2,
      totalPrice: nights2 * villa.pricePerNight,
      status: "PENDING",
    },
  });

  const checkIn3 = new Date("2026-08-20");
  const checkOut3 = new Date("2026-08-25");
  const nights3 = 5;
  await prisma.booking.create({
    data: {
      guestId: eve.id,
      listingId: cabin.id,
      checkIn: checkIn3,
      checkOut: checkOut3,
      totalPrice: nights3 * cabin.pricePerNight,
      status: "CONFIRMED",
    },
  });

  console.log("✅ Seeding complete!");
  console.log("Hosts: alice@example.com, bob@example.com");
  console.log("Guests: carol@example.com, david@example.com, eve@example.com");
  console.log("Password for all: password123");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());