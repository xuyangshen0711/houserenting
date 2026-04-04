import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.property.findMany();
  console.log(p);
}
main().then(() => prisma.$disconnect());
