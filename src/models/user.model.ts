export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: "host" | "guest";
  avatar?: string;
  bio?: string;
}

export const users: User[] = [
  {
    id: 1,
    name: "Alice Nkusi",
    email: "alice@example.com",
    username: "alicen",
    phone: "0781234567",
    role: "host",
    bio: "Love hosting travelers.",
  },
  {
    id: 2,
    name: "Bob Mugisha",
    email: "bob@example.com",
    username: "bobm",
    phone: "0789876543",
    role: "guest",
  },
  {
    id: 3,
    name: "Claire Uwase",
    email: "claire@example.com",
    username: "claireu",
    phone: "0782345678",
    role: "host",
    avatar: "https://i.pravatar.cc/150?u=claire",
  },
];