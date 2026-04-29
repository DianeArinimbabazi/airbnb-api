import prisma from "./src/config/prisma"; 
async function main() { 
  await prisma.user.deleteMany({ where: { email: "arinidiannah@gmail.com" } }); 
  console.log("Deleted!"); 
  await prisma.$disconnect(); 
} 
main(); 
