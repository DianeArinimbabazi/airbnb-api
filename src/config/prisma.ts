import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const connectDB = async () => {
  await prisma.$connect();
  console.log("Database connected successfully");
};

export default prisma;