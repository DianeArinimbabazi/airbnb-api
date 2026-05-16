import { PrismaClient, ListingType } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const host = await prisma.user.findFirst({ where: { role: "HOST" } });
  if (!host) { console.log("No host found. Create a host account first."); return; }

  const listings = [
    { title: "Oceanfront Villa with Infinity Pool", description: "Stunning oceanfront villa with breathtaking views and private infinity pool.", location: "Bali, Indonesia", pricePerNight: 285, guests: 8, type: ListingType.VILLA, amenities: "Pool, WiFi, Kitchen, AC, Parking" },
    { title: "Cozy Mountain Cabin with Hot Tub", description: "Escape to this cozy mountain cabin featuring a private hot tub and fireplace.", location: "Aspen, Colorado", pricePerNight: 320, guests: 4, type: ListingType.CABIN, amenities: "Hot Tub, Fireplace, WiFi, Kitchen" },
    { title: "Modern City Loft in Downtown", description: "Sleek and modern loft in the heart of the city, walking distance to everything.", location: "New York, USA", pricePerNight: 195, guests: 2, type: ListingType.APARTMENT, amenities: "WiFi, Kitchen, AC, Gym" },
    { title: "Charming Countryside Cottage", description: "A charming cottage surrounded by rolling hills and beautiful countryside.", location: "Cotswolds, England", pricePerNight: 150, guests: 4, type: ListingType.HOUSE, amenities: "Garden, WiFi, Kitchen, Fireplace" },
    { title: "Luxury Beachfront Bungalow", description: "Wake up steps from the beach in this luxury bungalow paradise.", location: "Maldives", pricePerNight: 450, guests: 2, type: ListingType.VILLA, amenities: "Pool, WiFi, Beach Access, AC" },
    { title: "Rustic Alpine Chalet", description: "Authentic alpine chalet with stunning mountain views and ski access.", location: "Zermatt, Switzerland", pricePerNight: 380, guests: 6, type: ListingType.CABIN, amenities: "Fireplace, Ski Access, WiFi, Kitchen" },
    { title: "Trendy Studio in Arts District", description: "Hip studio apartment in the vibrant arts district.", location: "Berlin, Germany", pricePerNight: 110, guests: 2, type: ListingType.APARTMENT, amenities: "WiFi, Kitchen, AC" },
    { title: "Peaceful Farm Stay", description: "Unwind at this peaceful farm stay surrounded by olive groves and vineyards.", location: "Tuscany, Italy", pricePerNight: 175, guests: 4, type: ListingType.HOUSE, amenities: "Garden, WiFi, Kitchen, Parking" },
    { title: "Cliffside Ocean View Suite", description: "Perched on a cliff with panoramic ocean views and iconic sunsets.", location: "Santorini, Greece", pricePerNight: 395, guests: 2, type: ListingType.VILLA, amenities: "Pool, WiFi, AC, Breakfast" },
    { title: "Ski-in Ski-out Mountain Lodge", description: "Premium ski lodge with direct slope access and luxury amenities.", location: "Whistler, Canada", pricePerNight: 410, guests: 8, type: ListingType.CABIN, amenities: "Ski Access, Hot Tub, WiFi, Kitchen" },
    { title: "Minimalist Tokyo Apartment", description: "Beautifully designed minimalist apartment in central Tokyo.", location: "Tokyo, Japan", pricePerNight: 130, guests: 2, type: ListingType.APARTMENT, amenities: "WiFi, Kitchen, AC" },
    { title: "Lavender Field Farmhouse", description: "Stunning farmhouse surrounded by fragrant lavender fields.", location: "Provence, France", pricePerNight: 210, guests: 6, type: ListingType.HOUSE, amenities: "Garden, WiFi, Kitchen, Pool" },
    { title: "Tropical Treehouse Retreat", description: "Unique treehouse experience in the heart of the rainforest.", location: "Costa Rica", pricePerNight: 165, guests: 2, type: ListingType.CABIN, amenities: "WiFi, Breakfast, Nature Tours" },
    { title: "Glass Igloo under Northern Lights", description: "Sleep under the stars in a heated glass igloo and watch the northern lights.", location: "Lapland, Finland", pricePerNight: 520, guests: 2, type: ListingType.CABIN, amenities: "Heated, WiFi, Breakfast" },
    { title: "Historic Brownstone Apartment", description: "Classic brownstone apartment in a historic neighborhood.", location: "Boston, USA", pricePerNight: 185, guests: 4, type: ListingType.APARTMENT, amenities: "WiFi, Kitchen, Washer" },
    { title: "Rolling Hills Vineyard Villa", description: "Luxurious villa surrounded by world-famous Napa Valley vineyards.", location: "Napa Valley, USA", pricePerNight: 340, guests: 6, type: ListingType.VILLA, amenities: "Pool, WiFi, Kitchen, Wine Tasting" },
    { title: "Overwater Bungalow Paradise", description: "Ultimate overwater bungalow with crystal clear lagoon views.", location: "Bora Bora, French Polynesia", pricePerNight: 680, guests: 2, type: ListingType.VILLA, amenities: "Pool, WiFi, AC, Water Sports" },
    { title: "Secluded Mountain Yurt", description: "Off-grid yurt experience with stunning Montana wilderness views.", location: "Montana, USA", pricePerNight: 145, guests: 2, type: ListingType.CABIN, amenities: "Fireplace, Hiking, Stargazing" },
    { title: "Parisian Haussmann Apartment", description: "Classic Haussmann apartment in the heart of Paris.", location: "Paris, France", pricePerNight: 225, guests: 4, type: ListingType.APARTMENT, amenities: "WiFi, Kitchen, AC" },
    { title: "English Country Manor", description: "Magnificent country manor with manicured gardens and grand interiors.", location: "Yorkshire, England", pricePerNight: 290, guests: 10, type: ListingType.HOUSE, amenities: "Garden, WiFi, Kitchen, Parking" },
    { title: "Beachfront Cabana", description: "Laid-back beachfront cabana steps from the turquoise Caribbean sea.", location: "Tulum, Mexico", pricePerNight: 195, guests: 2, type: ListingType.CABIN, amenities: "Beach Access, WiFi, AC" },
    { title: "Rooftop Penthouse with City Views", description: "Stunning penthouse with wraparound terrace and panoramic city views.", location: "Barcelona, Spain", pricePerNight: 355, guests: 4, type: ListingType.APARTMENT, amenities: "Rooftop, Pool, WiFi, AC" },
    { title: "Scottish Highlands Retreat", description: "Remote highland retreat surrounded by dramatic Scottish scenery.", location: "Inverness, Scotland", pricePerNight: 195, guests: 6, type: ListingType.HOUSE, amenities: "Fireplace, WiFi, Kitchen, Hiking" },
    { title: "Amalfi Coast Cliffside Hideaway", description: "Breathtaking hideaway perched on the iconic Amalfi Coast cliffs.", location: "Positano, Italy", pricePerNight: 465, guests: 4, type: ListingType.VILLA, amenities: "Pool, WiFi, AC, Sea View" },
    { title: "Dubai Marina Sky Apartment", description: "Ultra-modern apartment with stunning Dubai Marina skyline views.", location: "Dubai, UAE", pricePerNight: 390, guests: 4, type: ListingType.APARTMENT, amenities: "Pool, Gym, WiFi, AC, Parking" },
    { title: "Hawaiian Beachfront Estate", description: "Spectacular beachfront estate on the shores of Maui.", location: "Maui, Hawaii", pricePerNight: 595, guests: 10, type: ListingType.VILLA, amenities: "Pool, Beach Access, WiFi, Kitchen" },
    { title: "Patagonia Wilderness Lodge", description: "Remote wilderness lodge at the edge of the world.", location: "Torres del Paine, Chile", pricePerNight: 425, guests: 6, type: ListingType.HOUSE, amenities: "WiFi, Kitchen, Hiking, Stargazing" },
    { title: "Kyoto Machiya Townhouse", description: "Beautifully restored traditional machiya townhouse in historic Kyoto.", location: "Kyoto, Japan", pricePerNight: 230, guests: 4, type: ListingType.HOUSE, amenities: "WiFi, Kitchen, Traditional Bath" },
    { title: "Moroccan Riad with Rooftop", description: "Authentic Moroccan riad with stunning rooftop terrace and courtyard.", location: "Marrakech, Morocco", pricePerNight: 175, guests: 6, type: ListingType.HOUSE, amenities: "Rooftop, WiFi, Breakfast, Pool" },
    { title: "Seychelles Private Island Villa", description: "Exclusive private island villa with pristine beaches all to yourself.", location: "Mahe, Seychelles", pricePerNight: 750, guests: 8, type: ListingType.VILLA, amenities: "Private Beach, Pool, WiFi, Chef" },
    { title: "Iceland Hot Spring Cabin", description: "Cozy cabin with private hot spring and volcano views.", location: "Reykjavik, Iceland", pricePerNight: 345, guests: 4, type: ListingType.CABIN, amenities: "Hot Spring, WiFi, Kitchen, Northern Lights" },
    { title: "Zanzibar Spice Island Villa", description: "Luxurious villa on the exotic Spice Island of Zanzibar.", location: "Zanzibar, Tanzania", pricePerNight: 310, guests: 6, type: ListingType.VILLA, amenities: "Pool, Beach Access, WiFi, AC" },
    { title: "Phuket Hillside Pool Villa", description: "Stunning hillside villa with infinity pool overlooking the Andaman Sea.", location: "Phuket, Thailand", pricePerNight: 335, guests: 6, type: ListingType.VILLA, amenities: "Infinity Pool, WiFi, Kitchen, AC" },
    { title: "Portuguese Quinta Estate", description: "Historic quinta estate in the heart of the Douro Valley wine region.", location: "Douro Valley, Portugal", pricePerNight: 260, guests: 8, type: ListingType.HOUSE, amenities: "Pool, WiFi, Kitchen, Wine Tasting" },
    { title: "New Zealand Sheep Farm Stay", description: "Authentic farm stay experience with stunning Queenstown mountain views.", location: "Queenstown, New Zealand", pricePerNight: 155, guests: 4, type: ListingType.HOUSE, amenities: "Garden, WiFi, Kitchen, Farm Activities" },
  ];

  for (const listing of listings) {
    await prisma.listing.create({
      data: { ...listing, hostId: host.id },
    });
  }
  console.log(`Seeded ${listings.length} listings for host: ${host.name}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());