export interface Listing {
  id: number;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: "apartment" | "house" | "villa" | "cabin";
  amenities: string[];
  host: string;
  rating?: number;
}

export const listings: Listing[] = [
  {
    id: 1,
    title: "Cozy Kigali Apartment",
    description: "Modern flat in Nyarutarama.",
    location: "Kigali, Rwanda",
    pricePerNight: 80,
    guests: 2,
    type: "apartment",
    amenities: ["WiFi", "AC", "Kitchen"],
    host: "Alice Nkusi",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Lakeside Villa",
    description: "Stunning views of Lake Kivu.",
    location: "Rubavu, Rwanda",
    pricePerNight: 200,
    guests: 6,
    type: "villa",
    amenities: ["Pool", "WiFi", "Parking"],
    host: "Claire Uwase",
    rating: 4.9,
  },
  {
    id: 3,
    title: "Forest Cabin Retreat",
    description: "Quiet escape in Nyungwe.",
    location: "Nyamasheke, Rwanda",
    pricePerNight: 120,
    guests: 4,
    type: "cabin",
    amenities: ["Fireplace", "Hiking trails"],
    host: "Alice Nkusi",
  },
];